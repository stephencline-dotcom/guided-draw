let childDrawingState = {
  drawing: false,
  hasDrawn: false,
  tool: "pencil",
  color: "#263238",
  lastX: 0,
  lastY: 0
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
  ) return;

  fitCanvasToDisplay(computerColorCanvas);
  fitCanvasToDisplay(computerCanvas);
  fitCanvasToDisplay(childColorCanvas);
  fitCanvasToDisplay(childCanvas);

  setupChildDrawing(childCanvas);
  setupArtControls();

  GuidedDraw.start();
}

function setupChildDrawing(canvas) {
  const lineCtx = canvas.getContext("2d");
  const colorCanvas = document.getElementById("childColorCanvas");
  const colorCtx = colorCanvas.getContext("2d");

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (
      !["child", "color-child"].includes(GuidedDraw.phase) ||
      canvas.classList.contains("canvas-locked")
    ) {
      return;
    }

    if (childDrawingState.tool === "bucket") {
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);

    const point = getPoint(event);

    childDrawingState.drawing = true;
    childDrawingState.lastX = point.x;
    childDrawingState.lastY = point.y;

    lineCtx.beginPath();
    lineCtx.moveTo(point.x, point.y);

    colorCtx.beginPath();
    colorCtx.moveTo(point.x, point.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!childDrawingState.drawing) return;

    event.preventDefault();

    const point = getPoint(event);

    const coloringTool =
      childDrawingState.tool === "crayon" ||
      childDrawingState.tool === "marker";

    const erasingColor =
      childDrawingState.tool === "eraser" &&
      GuidedDraw.phase === "color-child";

    const ctx =
      (coloringTool || erasingColor)
        ? colorCtx
        : lineCtx;

    if (childDrawingState.tool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 30;
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = childDrawingState.color;

      if (childDrawingState.tool === "pencil") {
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
      }

      if (childDrawingState.tool === "crayon") {
        ctx.lineWidth = 13;
        ctx.globalAlpha = 0.72;
      }

      if (childDrawingState.tool === "marker") {
        ctx.lineWidth = 10;
        ctx.globalAlpha = 0.92;
      }
    }

    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    if (childDrawingState.tool === "eraser") {
      ctx.restore();
    }

    childDrawingState.lastX = point.x;
    childDrawingState.lastY = point.y;

    if (!childDrawingState.hasDrawn) {
      childDrawingState.hasDrawn = true;
      document.getElementById("doneButton").disabled = false;
    }
  });

  function stopDrawing(event) {
    if (!childDrawingState.drawing) return;

    childDrawingState.drawing = false;
    lineCtx.closePath();
    colorCtx.closePath();
    lineCtx.globalAlpha = 1;
    colorCtx.globalAlpha = 1;

    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer may already be released.
    }
  }

  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
}

function setupArtControls() {
  const toolButtons = document.querySelectorAll(".tool-button");
  const colorButtons = document.querySelectorAll(".color-button");
  const doneButton = document.getElementById("doneButton");

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toolButtons.forEach((item) => item.classList.remove("active"));

      button.classList.add("active");
      childDrawingState.tool = button.dataset.tool;
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      colorButtons.forEach((item) =>
        item.classList.remove("active-color")
      );

      button.classList.add("active-color");
      childDrawingState.color = button.dataset.color;
    });
  });

  doneButton.addEventListener("click", () => {
    if (doneButton.disabled) return;

    if (GuidedDraw.phase === "color-child") {
      GuidedDraw.finishArtwork();
      return;
    }

    GuidedDraw.childFinishedStep();
  });
}
