let childDrawingState = {
  drawing: false,
  hasDrawn: false,
  tool: "pencil",
  color: "#263238",
  size: "medium",
  activeCtx: null
};

function fitCanvasToDisplay(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);

  const ctx = canvas.getContext("2d");

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  return ctx;
}

function setupDrawingCanvases() {
  const computerCanvas = document.getElementById("computerCanvas");
  const computerColorCanvas = document.getElementById("computerColorCanvas");
  const childCanvas = document.getElementById("childCanvas");
  const childColorCanvas = document.getElementById("childColorCanvas");

  if (
    !computerCanvas ||
    !computerColorCanvas ||
    !childCanvas ||
    !childColorCanvas
  ) {
    console.error("One or more drawing canvases are missing.");
    return;
  }

  fitCanvasToDisplay(computerColorCanvas);
  fitCanvasToDisplay(computerCanvas);
  fitCanvasToDisplay(childColorCanvas);
  fitCanvasToDisplay(childCanvas);

  setupChildDrawing(childCanvas, childColorCanvas);
  setupArtControls();

  GuidedDraw.start();
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function floodFillChildArtwork(
  lineCanvas,
  colorCanvas,
  cssX,
  cssY,
  fillColor
) {
  const lineCtx =
    lineCanvas.getContext("2d");

  const colorCtx =
    colorCanvas.getContext("2d");

  const width =
    colorCanvas.width;

  const height =
    colorCanvas.height;

  if (!width || !height) {
    return false;
  }

  /*
    Convert browser/CSS coordinates into the canvas's
    real pixel coordinates. This matters on Chromebooks
    with devicePixelRatio scaling.
  */
  const scaleX =
    width / colorCanvas.clientWidth;

  const scaleY =
    height / colorCanvas.clientHeight;

  const startX =
    Math.max(
      0,
      Math.min(
        width - 1,
        Math.floor(cssX * scaleX)
      )
    );

  const startY =
    Math.max(
      0,
      Math.min(
        height - 1,
        Math.floor(cssY * scaleY)
      )
    );

  const lineImage =
    lineCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const colorImage =
    colorCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const lineData =
    lineImage.data;

  const colorData =
    colorImage.data;

  /*
    Build a barrier map from the child's pencil lines.
    We slightly thicken that invisible barrier so
    antialiased line edges do not leak paint.
  */
  const barrier =
    new Uint8Array(
      width * height
    );

  const lineThreshold = 20;

  for (
    let pixel = 0;
    pixel < width * height;
    pixel++
  ) {
    const alpha =
      lineData[pixel * 4 + 3];

    if (alpha > lineThreshold) {
      barrier[pixel] = 1;
    }
  }

  /*
    Dilate the barrier by a couple of device pixels.
    This makes bucket filling more forgiving for
    kindergarten drawings.
  */
  const radius =
    Math.max(
      1,
      Math.round(
        Math.max(scaleX, scaleY)
      )
    );

  const thickBarrier =
    barrier.slice();

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      const index =
        y * width + x;

      if (!barrier[index]) {
        continue;
      }

      for (
        let dy = -radius;
        dy <= radius;
        dy++
      ) {
        const ny = y + dy;

        if (
          ny < 0 ||
          ny >= height
        ) {
          continue;
        }

        for (
          let dx = -radius;
          dx <= radius;
          dx++
        ) {
          const nx = x + dx;

          if (
            nx < 0 ||
            nx >= width
          ) {
            continue;
          }

          thickBarrier[
            ny * width + nx
          ] = 1;
        }
      }
    }
  }

  const startIndex =
    startY * width + startX;

  /*
    Don't fill if the child actually clicks
    directly on an outline.
  */
  if (thickBarrier[startIndex]) {
    return false;
  }

  const rgb =
    hexToRgb(fillColor);

  const visited =
    new Uint8Array(
      width * height
    );

  /*
    Int32Array queues are substantially faster and
    lighter than pushing millions of JS objects.
  */
  const queue =
    new Int32Array(
      width * height
    );

  let head = 0;
  let tail = 0;

  queue[tail++] =
    startIndex;

  visited[startIndex] = 1;

  while (head < tail) {
    const index =
      queue[head++];

    const x =
      index % width;

    const y =
      Math.floor(index / width);

    const dataIndex =
      index * 4;

    colorData[dataIndex] =
      rgb.r;

    colorData[dataIndex + 1] =
      rgb.g;

    colorData[dataIndex + 2] =
      rgb.b;

    colorData[dataIndex + 3] =
      255;

    const tryAdd = (
      nx,
      ny
    ) => {
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= width ||
        ny >= height
      ) {
        return;
      }

      const next =
        ny * width + nx;

      if (
        visited[next] ||
        thickBarrier[next]
      ) {
        return;
      }

      visited[next] = 1;
      queue[tail++] = next;
    };

    tryAdd(x - 1, y);
    tryAdd(x + 1, y);
    tryAdd(x, y - 1);
    tryAdd(x, y + 1);
  }

  colorCtx.putImageData(
    colorImage,
    0,
    0
  );

  return true;
}

let childUndoHistory = [];

function updateChildUndoButton() {
  const button =
    document.getElementById("undoButton");

  if (!button) return;

  button.disabled =
    childUndoHistory.length === 0;
}

function resetChildUndoHistory() {
  childUndoHistory = [];
  updateChildUndoButton();
}

function saveChildUndoState() {
  const lineCanvas =
    document.getElementById("childCanvas");

  const colorCanvas =
    document.getElementById("childColorCanvas");

  if (
    !lineCanvas ||
    !colorCanvas
  ) {
    return;
  }

  const doneButton =
    document.getElementById("doneButton");

  const lineCtx =
    lineCanvas.getContext("2d");

  const colorCtx =
    colorCanvas.getContext("2d");

  childUndoHistory.push({
    line:
      lineCtx.getImageData(
        0,
        0,
        lineCanvas.width,
        lineCanvas.height
      ),

    color:
      colorCtx.getImageData(
        0,
        0,
        colorCanvas.width,
        colorCanvas.height
      ),

    hasDrawn:
      childDrawingState.hasDrawn,

    doneDisabled:
      doneButton
        ? doneButton.disabled
        : true,

    doneReady:
      doneButton
        ? doneButton.classList.contains(
            "done-ready"
          )
        : false
  });

  /*
    Undo is meant for recent mistakes, not an
    unlimited history. Keeping eight snapshots
    also prevents large Chromebook canvases from
    consuming too much memory.
  */
  if (childUndoHistory.length > 8) {
    childUndoHistory.shift();
  }

  updateChildUndoButton();
}

function undoChildArtwork() {
  if (!childUndoHistory.length) {
    return;
  }

  const state =
    childUndoHistory.pop();

  const lineCanvas =
    document.getElementById("childCanvas");

  const colorCanvas =
    document.getElementById("childColorCanvas");

  if (
    !lineCanvas ||
    !colorCanvas
  ) {
    return;
  }

  lineCanvas
    .getContext("2d")
    .putImageData(
      state.line,
      0,
      0
    );

  colorCanvas
    .getContext("2d")
    .putImageData(
      state.color,
      0,
      0
    );

  childDrawingState.hasDrawn =
    state.hasDrawn;

  const doneButton =
    document.getElementById(
      "doneButton"
    );

  if (doneButton) {
    doneButton.disabled =
      state.doneDisabled;

    doneButton.classList.toggle(
      "done-ready",
      state.doneReady
    );
  }

  updateChildUndoButton();
}

function setupChildDrawing(lineCanvas, colorCanvas) {
  const lineCtx = lineCanvas.getContext("2d");
  const colorCtx = colorCanvas.getContext("2d");

  function getPoint(event) {
    const rect = lineCanvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function getActiveContext() {
    if (
      GuidedDraw.phase === "color-child" &&
      (
        childDrawingState.tool === "crayon" ||
        childDrawingState.tool === "marker" ||
        childDrawingState.tool === "eraser"
      )
    ) {
      return colorCtx;
    }

    return lineCtx;
  }

  lineCanvas.addEventListener("pointerdown", (event) => {
    if (
      !["child", "color-child"].includes(GuidedDraw.phase) ||
      lineCanvas.classList.contains("canvas-locked")
    ) {
      return;
    }

    if (childDrawingState.tool === "bucket") {
      event.preventDefault();

      const point =
        getPoint(event);

      /*
        Save the artwork before Fill. This is especially
        important if paint escapes through an open shape.
      */
      saveChildUndoState();

      const filled =
        floodFillChildArtwork(
          lineCanvas,
          colorCanvas,
          point.x,
          point.y,
          childDrawingState.color
        );

      if (filled) {
        childDrawingState.hasDrawn =
          true;

        const doneButton =
          document.getElementById(
            "doneButton"
          );

        if (doneButton) {
          doneButton.disabled =
            false;

          doneButton.classList.add(
            "done-ready"
          );
        }

        const colorGroup =
          document.querySelector(
            ".color-group"
          );

        if (colorGroup) {
          colorGroup.classList.remove(
            "child-choice-highlight"
          );
        }
      }

      return;
    }

    event.preventDefault();
    lineCanvas.setPointerCapture(event.pointerId);

    const point = getPoint(event);
    const ctx = getActiveContext();

    childDrawingState.drawing = true;
    childDrawingState.activeCtx = ctx;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  });

  lineCanvas.addEventListener("pointermove", (event) => {
    if (!childDrawingState.drawing) return;

    event.preventDefault();

    const point = getPoint(event);
    const ctx = childDrawingState.activeCtx;

    if (!ctx) return;

    if (childDrawingState.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.lineWidth = 30;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = childDrawingState.color;

      if (childDrawingState.tool === "pencil") {
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
      }

      if (childDrawingState.tool === "crayon") {
        const crayonWidths = {
          thin: 7,
          medium: 15,
          thick: 26
        };

        ctx.lineWidth =
          crayonWidths[childDrawingState.size] || 15;

        ctx.globalAlpha = 0.78;
      }

      if (childDrawingState.tool === "marker") {
        ctx.lineWidth = 11;
        ctx.globalAlpha = 0.92;
      }
    }

    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    if (!childDrawingState.hasDrawn) {
      childDrawingState.hasDrawn = true;

      const doneButton =
    document.getElementById("doneButton");

  const undoButton =
    document.getElementById("undoButton");

      if (doneButton) {
        doneButton.disabled = false;
        doneButton.classList.add(
          "done-ready"
        );
      }

      document.querySelectorAll(
        ".child-tool-ready"
      ).forEach((item) => {
        item.classList.remove(
          "child-tool-ready"
        );
      });

      const colorGroup =
        document.querySelector(
          ".color-group"
        );

      if (colorGroup) {
        colorGroup.classList.remove(
          "child-choice-highlight"
        );
      }
    }
  });

  function stopDrawing(event) {
    if (!childDrawingState.drawing) return;

    childDrawingState.drawing = false;

    if (childDrawingState.activeCtx) {
      childDrawingState.activeCtx.closePath();
      childDrawingState.activeCtx.globalAlpha = 1;
      childDrawingState.activeCtx.globalCompositeOperation = "source-over";
    }

    childDrawingState.activeCtx = null;

    try {
      lineCanvas.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer may already be released.
    }
  }

  lineCanvas.addEventListener("pointerup", stopDrawing);
  lineCanvas.addEventListener("pointercancel", stopDrawing);
}

function setupArtControls() {
  const toolButtons = document.querySelectorAll(".tool-button");
  const colorButtons = document.querySelectorAll(".color-button");
  const sizeButtons = document.querySelectorAll(".size-button");
  const doneButton = document.getElementById("doneButton");

  if (undoButton) {
    undoButton.addEventListener(
      "click",
      () => {
        if (undoButton.disabled) {
          return;
        }

        undoChildArtwork();
      }
    );

    updateChildUndoButton();
  }

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      toolButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      childDrawingState.tool =
        button.dataset.tool;

      const childCanvas =
        document.getElementById(
          "childCanvas"
        );

      if (childCanvas) {
        childCanvas.classList.toggle(
          "bucket-cursor",
          childDrawingState.tool ===
            "bucket"
        );
      }
    });
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      sizeButtons.forEach((item) => {
        item.classList.remove("active-size");
      });

      button.classList.add("active-size");
      childDrawingState.size = button.dataset.size;
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      colorButtons.forEach((item) => {
        item.classList.remove("active-color");
      });

      button.classList.add("active-color");
      childDrawingState.color = button.dataset.color;
    });
  });

  doneButton.addEventListener("click", () => {
    if (doneButton.disabled) return;

    doneButton.classList.remove(
      "done-ready"
    );

    GuidedDraw.childFinishedStep();
  });
}

function setupBucketTest() {
  const exampleCanvas =
    document.getElementById("bucketExampleCanvas");

  const childCanvas =
    document.getElementById("childCanvas");

  const childColorCanvas =
    document.getElementById("childColorCanvas");

  if (
    !exampleCanvas ||
    !childCanvas ||
    !childColorCanvas
  ) {
    return;
  }

  fitCanvasToDisplay(exampleCanvas);
  fitCanvasToDisplay(childColorCanvas);
  fitCanvasToDisplay(childCanvas);

  const exampleCtx =
    exampleCanvas.getContext("2d");

  const w =
    exampleCanvas.clientWidth;

  const h =
    exampleCanvas.clientHeight;

  /*
    Draw a big simple flower-like test shape.
  */
  exampleCtx.strokeStyle = "#30343b";
  exampleCtx.lineWidth = 6;
  exampleCtx.lineCap = "round";
  exampleCtx.lineJoin = "round";

  exampleCtx.beginPath();
  exampleCtx.arc(
    w * .5,
    h * .48,
    Math.min(w, h) * .18,
    0,
    Math.PI * 2
  );
  exampleCtx.stroke();

  exampleCtx.beginPath();
  exampleCtx.arc(
    w * .5,
    h * .48,
    Math.min(w, h) * .07,
    0,
    Math.PI * 2
  );
  exampleCtx.stroke();

  setupChildDrawing(
    childCanvas,
    childColorCanvas
  );

  setupArtControls();

  /*
    Free test mode:
    all tools and colors are available.
  */
  document.querySelectorAll(
    ".tool-button, .size-button, .color-button"
  ).forEach((button) => {
    button.disabled = false;
    button.classList.remove(
      "tool-locked",
      "size-locked",
      "color-locked"
    );
  });

  /*
    setupChildDrawing normally checks GuidedDraw.phase.
    Put it into a phase that accepts child input.
  */
  GuidedDraw.phase = "color-child";

  const doneButton =
    document.getElementById("doneButton");

  doneButton.addEventListener("click", () => {
    doneButton.classList.remove("done-ready");
  });
}
