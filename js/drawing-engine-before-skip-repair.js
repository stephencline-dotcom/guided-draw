const GuidedDraw = {
  drawingStep: 0,
  colorStep: 0,
  phase: "idle",
  demoTool: null,

  demonstratedControls: {
    tool: null,
    size: null,
    color: null
  },

  childSelectedControls: {
    tool: null,
    size: null
  },

  speechQueue: Promise.resolve(),

  currentRepeatText: "",

  directionSectionActive: false,
  activeSpeechResolve: null,
  directionToken: 0,

  drawingSteps: [
    {
      watch: "Little artist, we're going to start with the fish's body.",
      turn: "Your turn! Let's draw the fish's body.",
      short: "Draw the fish's body.",
      paths(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          GuidedDraw.ellipsePath(g.cx, g.cy, g.rx, g.ry)
        ];
      }
    },

    {
      watch: "Next, I'm going to add the tail.",
      turn: "Your turn! Add the tail to your fish.",
      short: "Add the tail.",
      paths(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          GuidedDraw.polylinePath([
            { x: g.joinX, y: g.cy - h * 0.07 },
            { x: g.tailX, y: g.tailTop },
            { x: g.tailX - w * 0.015, y: g.cy },
            { x: g.tailX, y: g.tailBottom },
            { x: g.joinX, y: g.cy + h * 0.07 }
          ])
        ];
      }
    },

    {
      watch: "Now I'm going to add the fins.",
      turn: "Your turn! Add the fins to your fish.",
      short: "Add the fins.",
      paths(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          GuidedDraw.curvePath([
            { x: g.cx - w * 0.06, y: g.cy - h * 0.22 },
            { x: g.cx - w * 0.01, y: g.cy - h * 0.36 },
            { x: g.cx + w * 0.08, y: g.cy - h * 0.23 }
          ]),

          GuidedDraw.curvePath([
            { x: g.cx - w * 0.02, y: g.cy + h * 0.05 },
            { x: g.cx + w * 0.08, y: g.cy + h * 0.19 },
            { x: g.cx + w * 0.12, y: g.cy + h * 0.02 }
          ])
        ];
      }
    },

    {
      watch: "Next, my fish needs an eye.",
      turn: "Your turn! Give your fish an eye.",
      short: "Draw the eye.",
      paths(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          GuidedDraw.ellipsePath(
            g.cx - w * 0.13,
            g.cy - h * 0.07,
            Math.max(8, w * 0.014),
            Math.max(8, w * 0.014)
          )
        ];
      }
    },

    {
      watch: "Let's finish the drawing with a smile and some bubbles.",
      turn: "Your turn! Add a smile and some bubbles.",
      short: "Add a smile and bubbles.",
      paths(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          GuidedDraw.curvePath([
            { x: g.cx - w * 0.22, y: g.cy + h * 0.01 },
            { x: g.cx - w * 0.17, y: g.cy + h * 0.10 },
            { x: g.cx - w * 0.12, y: g.cy + h * 0.02 }
          ]),

          GuidedDraw.ellipsePath(
            g.cx - w * 0.31,
            g.cy - h * 0.11,
            w * 0.018,
            w * 0.018
          ),

          GuidedDraw.ellipsePath(
            g.cx - w * 0.35,
            g.cy - h * 0.20,
            w * 0.026,
            w * 0.026
          ),

          GuidedDraw.ellipsePath(
            g.cx - w * 0.39,
            g.cy - h * 0.31,
            w * 0.035,
            w * 0.035
          )
        ];
      }
    }
  ],

  colorSteps: [
    {
      watch: "Now we're ready to color the fish's body.",
      turn: "Your turn! Color the fish's body.",
      short: "Color the fish's body.",
      color: "#ff9800",
      size: "thick",
      strokes(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return GuidedDraw.ellipseFillStrokes(
          g.cx,
          g.cy,
          g.rx - 12,
          g.ry - 12,
          8
        );
      }
    },

    {
      watch: "Next, I'm going to color the tail and fins.",
      turn: "Your turn! Color the tail and fins.",
      short: "Color the tail and fins.",
      color: "#fdd835",
      size: "medium",
      strokes(w, h) {
        const g = GuidedDraw.geometry(w, h);

        const tail = GuidedDraw.polygonFillStrokes([
          { x: g.joinX + 5, y: g.cy - h * 0.06 },
          { x: g.tailX - 8, y: g.tailTop + 10 },
          { x: g.tailX - w * 0.02, y: g.cy },
          { x: g.tailX - 8, y: g.tailBottom - 10 },
          { x: g.joinX + 5, y: g.cy + h * 0.06 }
        ], 6);

        const topFin = GuidedDraw.polygonFillStrokes([
          { x: g.cx - w * 0.05, y: g.cy - h * 0.22 },
          { x: g.cx - w * 0.01, y: g.cy - h * 0.33 },
          { x: g.cx + w * 0.065, y: g.cy - h * 0.23 }
        ], 5);

        const sideFin = GuidedDraw.polygonFillStrokes([
          { x: g.cx, y: g.cy + h * 0.05 },
          { x: g.cx + w * 0.075, y: g.cy + h * 0.15 },
          { x: g.cx + w * 0.105, y: g.cy + h * 0.03 }
        ], 5);

        return [...tail, ...topFin, ...sideFin];
      }
    },

    {
      watch: "Let's finish by adding color to the bubbles.",
      turn: "Your turn! Color the bubbles and add any finishing touches you like.",
      short: "Color the bubbles and add finishing touches.",
      color: "#1e88e5",
      size: "thin",
      strokes(w, h) {
        const g = GuidedDraw.geometry(w, h);

        return [
          ...GuidedDraw.ellipseFillStrokes(
            g.cx - w * 0.31,
            g.cy - h * 0.11,
            w * 0.014,
            w * 0.014,
            4
          ),

          ...GuidedDraw.ellipseFillStrokes(
            g.cx - w * 0.35,
            g.cy - h * 0.20,
            w * 0.021,
            w * 0.021,
            4
          ),

          ...GuidedDraw.ellipseFillStrokes(
            g.cx - w * 0.39,
            g.cy - h * 0.31,
            w * 0.029,
            w * 0.029,
            4
          )
        ];
      }
    }
  ],

  start() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.speechQueue = Promise.resolve();

    this.drawingStep = 0;
    this.colorStep = 0;

    this.childSelectedControls = {
      tool: null,
      size: null
    };

    this.setSketchTools();
    this.startDrawingWatch();
  },

  wait(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  },

  async teach(text, pauseAfter = 450) {
    const myToken =
      this.directionToken;

    this.directionSectionActive = true;
    this.currentRepeatText = text;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    await this.speak(text);

    /*
      If Skip was pressed while speaking,
      this direction block is no longer valid.
    */
    if (
      myToken !== this.directionToken ||
      !this.directionSectionActive
    ) {
      return false;
    }

    await this.wait(pauseAfter);

    if (
      myToken !== this.directionToken ||
      !this.directionSectionActive
    ) {
      return false;
    }

    this.directionSectionActive = false;

    this.setDirectionButtons({
      skip: false,
      repeat: true
    });

    return true;
  },


  async demoTap(selector) {
    const myToken =
      this.directionToken;

    const target =
      document.querySelector(selector);

    if (!target) return false;

    let hand =
      document.querySelector(
        ".tutorial-hand"
      );

    if (!hand) {
      hand =
        document.createElement("div");

      hand.className =
        "tutorial-hand";

      hand.textContent =
        "👆";

      document.body.appendChild(
        hand
      );
    }

    const rect =
      target.getBoundingClientRect();

    hand.classList.add(
      "visible"
    );

    hand.style.left =
      `${rect.left + rect.width / 2}px`;

    hand.style.top =
      `${rect.top + rect.height / 2 - 6}px`;

    await this.wait(600);

    if (myToken !== this.directionToken) {
      hand.classList.remove(
        "visible",
        "tap"
      );
      return false;
    }

    hand.classList.add("tap");
    target.classList.add(
      "demo-selected"
    );

    await this.wait(300);

    if (myToken !== this.directionToken) {
      hand.classList.remove(
        "visible",
        "tap"
      );

      target.classList.remove(
        "demo-selected"
      );

      return false;
    }

    hand.classList.remove("tap");

    await this.wait(280);

    target.classList.remove(
      "demo-selected"
    );

    return myToken === this.directionToken;
  },


  async demonstrateControls({
    tool = null,
    size = null,
    color = null
  } = {}) {
    if (
      tool &&
      this.demonstratedControls.tool !== tool
    ) {
      if (tool === "pencil") {
        await this.teach(
          "First I need my pencil. Watch me choose it from the tool menu."
        );
      }

      if (tool === "crayon") {
        await this.teach(
          "For coloring, I need a crayon. Watch me choose it from the tool menu."
        );
      }

      if (tool === "marker") {
        await this.teach(
          "For this part, I want a marker. Watch me choose it."
        );
      }

      if (tool === "eraser") {
        await this.teach(
          "I want to fix something, so I'm choosing the eraser."
        );
      }

      await this.demoTap(
        `.tool-button[data-tool="${tool}"]`
      );

      this.demonstratedControls.tool = tool;

      await this.wait(350);
    }

    if (
      size &&
      this.demonstratedControls.size !== size
    ) {
      if (size === "thin") {
        await this.teach(
          "This is a small space, so I'm choosing a thin crayon. Thin lines help me color carefully."
        );
      }

      if (size === "medium") {
        await this.teach(
          "This space is in the middle, so I'm choosing a medium crayon."
        );
      }

      if (size === "thick") {
        await this.teach(
          "This is a big space, so I'm choosing a thick crayon. Thick lines help cover big spaces."
        );
      }

      await this.demoTap(
        `.size-button[data-size="${size}"]`
      );

      this.demonstratedControls.size = size;

      await this.wait(350);
    }

    if (
      color &&
      this.demonstratedControls.color !== color
    ) {
      const colorNames = {
        "#263238": "black",
        "#ef5350": "red",
        "#ff9800": "orange",
        "#fdd835": "yellow",
        "#43a047": "green",
        "#1e88e5": "blue",
        "#8e5ac8": "purple",
        "#ec6fa7": "pink"
      };

      const colorName =
        colorNames[color] || "a color";

      await this.teach(
        `Now I'm choosing ${colorName}. When it's your turn, you can choose any color you like.`
      );

      await this.demoTap(
        `.color-button[data-color="${color}"]`
      );

      this.demonstratedControls.color = color;

      await this.wait(350);
    }

    const hand =
      document.querySelector(".tutorial-hand");

    if (hand) {
      await this.wait(250);
      hand.classList.remove("visible");
    }
  },


  waitForChildClick(element) {
    return new Promise((resolve) => {
      const handleClick = () => {
        element.removeEventListener(
          "click",
          handleClick
        );

        resolve();
      };

      element.addEventListener(
        "click",
        handleClick
      );
    });
  },

  async prepareChildControls({
    tool = null,
    size = null,
    letChildChooseColor = false
  } = {}) {
    document.querySelectorAll(
      ".child-tool-ready, .child-tool-waiting"
    ).forEach((item) => {
      item.classList.remove(
        "child-tool-ready",
        "child-tool-waiting"
      );
    });

    /*
      Only teach/select the tool if we are changing
      to a different tool.
    */
    if (
      tool &&
      this.childSelectedControls.tool !== tool
    ) {
      const toolButton =
        document.querySelector(
          `.tool-button[data-tool="${tool}"]`
        );

      if (toolButton) {
        document.querySelectorAll(
          ".tool-button"
        ).forEach((button) => {
          button.classList.remove("active");
        });

        await this.teach(
          `Choose the ${tool}. When that button starts flashing, click it.`
        );

        await this.demoTap(
          `.tool-button[data-tool="${tool}"]`
        );

        const hand =
          document.querySelector(
            ".tutorial-hand"
          );

        if (hand) {
          hand.classList.remove(
            "visible",
            "tap"
          );
        }

        await this.wait(250);

        toolButton.classList.add(
          "child-tool-waiting"
        );

        await this.waitForChildClick(
          toolButton
        );

        toolButton.classList.remove(
          "child-tool-waiting"
        );

        this.childSelectedControls.tool =
          tool;

        /*
          Changing tools means we may need to teach
          its size again.
        */
        this.childSelectedControls.size =
          null;

        await this.wait(300);
      }
    }

    /*
      Only teach/select size if this tool needs a size
      AND the size changed.
    */
    if (
      size &&
      this.childSelectedControls.size !== size
    ) {
      const sizeButton =
        document.querySelector(
          `.size-button[data-size="${size}"]`
        );

      if (sizeButton) {
        document.querySelectorAll(
          ".size-button"
        ).forEach((button) => {
          button.classList.remove(
            "active-size"
          );
        });

        await this.teach(
          `For this part, choose ${size}. Click it when the button starts flashing.`
        );

        await this.demoTap(
          `.size-button[data-size="${size}"]`
        );

        const hand =
          document.querySelector(
            ".tutorial-hand"
          );

        if (hand) {
          hand.classList.remove(
            "visible",
            "tap"
          );
        }

        await this.wait(250);

        sizeButton.classList.add(
          "child-tool-waiting"
        );

        await this.waitForChildClick(
          sizeButton
        );

        sizeButton.classList.remove(
          "child-tool-waiting"
        );

        this.childSelectedControls.size =
          size;

        await this.wait(300);
      }
    }

    if (letChildChooseColor) {
      await this.teach(
        "Choose any color you like from the color circles."
      );

      const colorGroup =
        document.querySelector(
          ".color-group"
        );

      const colorButtons =
        Array.from(
          document.querySelectorAll(
            ".color-button:not(:disabled)"
          )
        );

      if (
        colorGroup &&
        colorButtons.length
      ) {
        colorGroup.classList.add(
          "child-choice-highlight"
        );

        await new Promise((resolve) => {
          const handlers = [];

          const finish = () => {
            handlers.forEach(
              ([button, handler]) => {
                button.removeEventListener(
                  "click",
                  handler
                );
              }
            );

            colorGroup.classList.remove(
              "child-choice-highlight"
            );

            resolve();
          };

          colorButtons.forEach((button) => {
            const handler = () => {
              finish();
            };

            handlers.push([
              button,
              handler
            ]);

            button.addEventListener(
              "click",
              handler
            );
          });
        });
      }
    }
  },


  geometry(w, h) {
    const cx = w * 0.47;
    const cy = h * 0.52;
    const rx = Math.min(w * 0.27, h * 0.38);
    const ry = Math.min(w * 0.16, h * 0.27);

    const joinX = cx + rx * 0.90;
    const tailX = Math.min(
      w * 0.86,
      joinX + w * 0.17
    );

    return {
      cx,
      cy,
      rx,
      ry,
      joinX,
      tailX,
      tailTop: cy - h * 0.19,
      tailBottom: cy + h * 0.19
    };
  },

  setSketchTools() {
    document.querySelectorAll(".tool-button").forEach((button) => {
      const allowed =
        button.dataset.tool === "pencil" ||
        button.dataset.tool === "eraser";

      button.disabled = !allowed;
      button.classList.toggle("tool-locked", !allowed);
      button.classList.toggle(
        "active",
        button.dataset.tool === "pencil"
      );
    });

    document.querySelectorAll(".color-button").forEach((button) => {
      button.disabled = true;
      button.classList.add("color-locked");
    });

    document.querySelectorAll(".size-button").forEach((button) => {
      button.disabled = true;
      button.classList.add("size-locked");
    });

    childDrawingState.tool = "pencil";
    childDrawingState.color = "#263238";
  },

  setColorTools() {
    document.querySelectorAll(".tool-button").forEach((button) => {
      const allowed =
        button.dataset.tool === "crayon" ||
        button.dataset.tool === "marker" ||
        button.dataset.tool === "eraser";

      button.disabled = !allowed;
      button.classList.toggle("tool-locked", !allowed);
      button.classList.toggle(
        "active",
        button.dataset.tool === "crayon"
      );
    });

    document.querySelectorAll(".color-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("color-locked");
    });

    document.querySelectorAll(".size-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("size-locked");
    });

    childDrawingState.tool = "crayon";
    childDrawingState.size = "medium";
    childDrawingState.hasDrawn = false;
  },

  prepareChildForWatch() {
    const childCanvas = document.getElementById("childCanvas");
    const doneButton = document.getElementById("doneButton");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;
    doneButton.classList.remove("done-ready");

    childDrawingState.drawing = false;
    childDrawingState.hasDrawn = false;
    childDrawingState.activeCtx = null;
  },

  startDrawingWatch() {
    const step = this.drawingSteps[this.drawingStep];

    if (!step) {
      this.beginColoring();
      return;
    }

    this.phase = "draw-watch";
    this.prepareChildForWatch();

    const childMessage = document.getElementById("childMessage");
    const computerMessage = document.getElementById("computerMessage");

    document.getElementById("stepText").textContent =
      `Step ${this.drawingStep + 1} • Watch me draw!`;

    document.getElementById("stepCounter").textContent =
      `${this.drawingStep + 1} / 8`;

    computerMessage.classList.add("message-hidden");

    childMessage.innerHTML = `
      <span class="message-icon">👀</span>
      <strong>WATCH!</strong>
    `;

    childMessage.classList.remove("message-hidden");

    this.currentRepeatText = step.watch;

    this.directionSectionActive = true;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    this.speak(step.watch).then(() => {
      if (!this.directionSectionActive) {
        return;
      }

      this.directionSectionActive = false;

      this.setDirectionButtons({
        skip: false,
        repeat: true
      });
    });

    setTimeout(async () => {
      await this.demonstrateControls({
        tool: "pencil"
      });

      if (this.drawingStep === 0) {
        await this.teach(
          "Watch where my pencil starts. I'm going to move slowly around to make one big round shape for the fish's body."
        );
      } else {
        await this.teach(
          "Watch carefully as I draw the next part."
        );
      }

      this.animateDrawingStep();
    }, 500);
  },

  animateDrawingStep() {
    const canvas = document.getElementById("computerCanvas");
    const frame = canvas.closest(".canvas-frame");
    const ctx = canvas.getContext("2d");

    const step = this.drawingSteps[this.drawingStep];
    const paths = step.paths(
      canvas.clientWidth,
      canvas.clientHeight
    );

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#30343b";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    this.removeDemoTool();

    const pencil = document.createElement("div");
    pencil.className = "demo-pencil";
    pencil.textContent = "✏️";

    frame.appendChild(pencil);
    this.demoTool = pencil;

    this.animatePaths(ctx, paths, pencil, () => {
      this.finishDrawingWatch();
    });
  },

  finishDrawingWatch() {
    this.removeDemoTool();

    const step =
      this.drawingSteps[
        this.drawingStep
      ];

    const childCanvas =
      document.getElementById(
        "childCanvas"
      );

    const childMessage =
      document.getElementById(
        "childMessage"
      );

    this.phase = "child";

    document.getElementById(
      "stepText"
    ).textContent =
      `Step ${this.drawingStep + 1} • Your turn!`;

    childMessage.innerHTML = `
      <span class="message-icon">✏️</span>
      <strong>YOUR TURN!</strong>
      <span class="turn-help">${step.short}</span>
    `;

    childMessage.classList.remove(
      "message-hidden"
    );

    childMessage.classList.add(
      "your-turn-pop"
    );

    /*
      Don't speak the task here and then speak
      it again later. We wait until the child
      has handled any NEW tool selection.
    */
    setTimeout(async () => {
      childMessage.classList.add(
        "message-hidden"
      );

      childMessage.classList.remove(
        "your-turn-pop"
      );

      await this.prepareChildControls({
        tool: "pencil"
      });

      let direction;

      if (this.drawingStep === 0) {
        direction =
          `${step.turn} Take your time. ` +
          `When you make your first mark, ` +
          `the green I'm done button will light up. ` +
          `Click it when you're finished and ready ` +
          `for the next step.`;
      } else {
        direction =
          `${step.turn} Take your time.`;
      }

      await this.playDirectionSection(
        direction
      );

      childCanvas.classList.remove(
        "canvas-locked"
      );
    }, 700);
  },


  childFinishedStep() {
    if (
      this.phase !== "child" &&
      this.phase !== "color-child"
    ) {
      return;
    }

    const finishedColorTurn =
      this.phase === "color-child";

    this.phase = "transition";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const doneButton = document.getElementById("doneButton");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;

    childMessage.innerHTML = `
      <span class="message-icon">⭐</span>
      <strong>NICE WORK!</strong>
    `;

    childMessage.classList.remove("message-hidden");

    setTimeout(() => {
      childMessage.classList.add("message-hidden");

      if (finishedColorTurn) {
        this.colorStep++;

        if (this.colorStep < this.colorSteps.length) {
          this.startColorWatch();
        } else {
          this.finishArtwork();
        }

        return;
      }

      this.drawingStep++;

      if (this.drawingStep < this.drawingSteps.length) {
        this.startDrawingWatch();
      } else {
        this.beginColoring();
      }
    }, 700);
  },

  beginColoring() {
    this.colorStep = 0;
    this.setColorTools();
    this.phase = "color-intro";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");

    childCanvas.classList.add("canvas-locked");

    childMessage.innerHTML = `
      <span class="message-icon">🎨</span>
      <strong>TIME TO COLOR!</strong>
      <span class="turn-help">Watch me first!</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("color-celebration");

    this.currentRepeatText =
      "Time to color!";

    this.directionSectionActive = true;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    this.speak("Time to color!").then(() => {
      if (!this.directionSectionActive) {
        return;
      }

      this.directionSectionActive = false;

      this.setDirectionButtons({
        skip: false,
        repeat: true
      });
    });

    setTimeout(() => {
      childMessage.classList.add("message-hidden");
      childMessage.classList.remove("color-celebration");
      this.startColorWatch();
    }, 1400);
  },

  startColorWatch() {
    const step = this.colorSteps[this.colorStep];

    this.phase = "color-watch";
    this.prepareChildForWatch();

    const childMessage = document.getElementById("childMessage");
    const computerMessage = document.getElementById("computerMessage");

    const stepNumber =
      this.drawingSteps.length +
      this.colorStep +
      1;

    document.getElementById("stepText").textContent =
      `Step ${stepNumber} • Watch me color!`;

    document.getElementById("stepCounter").textContent =
      `${stepNumber} / 8`;

    computerMessage.classList.add("message-hidden");

    childMessage.innerHTML = `
      <span class="message-icon">👀</span>
      <strong>WATCH ME COLOR!</strong>
    `;

    childMessage.classList.remove("message-hidden");

    this.currentRepeatText = step.watch;

    this.directionSectionActive = true;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    this.speak(step.watch).then(() => {
      if (!this.directionSectionActive) {
        return;
      }

      this.directionSectionActive = false;

      this.setDirectionButtons({
        skip: false,
        repeat: true
      });
    });

    setTimeout(async () => {
      await this.demonstrateControls({
        tool: "crayon",
        size: step.size,
        color: step.color
      });

      if (step.size === "thick") {
        await this.teach(
          "Watch how I move my thick crayon back and forth to cover the white space while staying inside my lines."
        );
      } else if (step.size === "thin") {
        await this.teach(
          "This is a smaller area. Watch how I use the thin crayon carefully near the lines."
        );
      } else {
        await this.teach(
          "Watch how I move my crayon back and forth while staying inside my drawing lines."
        );
      }

      this.animateColorStep();
    }, 500);
  },

  animateColorStep() {
    const canvas =
      document.getElementById("computerColorCanvas");

    const lineCanvas =
      document.getElementById("computerCanvas");

    const frame =
      lineCanvas.closest(".canvas-frame");

    const ctx =
      canvas.getContext("2d");

    const step =
      this.colorSteps[this.colorStep];

    const strokes =
      step.strokes(
        canvas.clientWidth,
        canvas.clientHeight
      );

    const demonstrationWidths = {
      thin: 9,
      medium: 17,
      thick: 26
    };

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.90;
    ctx.strokeStyle = step.color;
    ctx.lineWidth =
      demonstrationWidths[step.size] || 17;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    this.removeDemoTool();

    const crayon =
      document.createElement("div");

    crayon.className = "demo-crayon";
    crayon.textContent = "🖍️";

    frame.appendChild(crayon);
    this.demoTool = crayon;

    this.animateColorStrokes(
      ctx,
      strokes,
      crayon,
      () => {
        ctx.globalAlpha = 1;
        this.finishColorWatch();
      }
    );
  },

  finishColorWatch() {
    this.removeDemoTool();

    const step =
      this.colorSteps[
        this.colorStep
      ];

    const childCanvas =
      document.getElementById(
        "childCanvas"
      );

    const childMessage =
      document.getElementById(
        "childMessage"
      );

    const stepNumber =
      this.drawingSteps.length +
      this.colorStep +
      1;

    this.phase = "color-child";

    document.getElementById(
      "stepText"
    ).textContent =
      `Step ${stepNumber} • Your turn!`;

    childMessage.innerHTML = `
      <span class="message-icon">🖍️</span>
      <strong>YOUR TURN!</strong>
      <span class="turn-help">${step.short}</span>
    `;

    childMessage.classList.remove(
      "message-hidden"
    );

    childMessage.classList.add(
      "your-turn-pop"
    );

    setTimeout(async () => {
      childMessage.classList.add(
        "message-hidden"
      );

      childMessage.classList.remove(
        "your-turn-pop"
      );

      /*
        This only teaches Crayon or a new size
        when that control actually changes.
      */
      await this.prepareChildControls({
        tool: "crayon",
        size: step.size,
        letChildChooseColor: true
      });

      const direction =
        `${step.turn} Take your time.`;

      await this.playDirectionSection(
        direction
      );

      childCanvas.classList.remove(
        "canvas-locked"
      );
    }, 700);
  },


  finishArtwork() {
    this.phase = "finished";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const doneButton = document.getElementById("doneButton");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;

    document.getElementById("stepText").textContent =
      "Fish complete!";

    document.getElementById("stepCounter").textContent =
      "★";

    childMessage.innerHTML = `
      <span class="message-icon finish-star">🌟</span>
      <strong>AMAZING ARTIST!</strong>
      <span class="turn-help">You drew and colored a fish!</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("finished-message");

    this.setRepeatText(
      "Amazing artist! You drew and colored a fish!"
    );

    this.speak(
      "Amazing artist! You drew and colored a fish!"
    );

    setTimeout(() => {
      this.showFinishedGallery();
    }, 900);
  },

  makeFinishedArtworkImage() {
    const colorCanvas =
      document.getElementById("childColorCanvas");

    const lineCanvas =
      document.getElementById("childCanvas");

    if (!colorCanvas || !lineCanvas) {
      return null;
    }

    const merged =
      document.createElement("canvas");

    merged.width = lineCanvas.width;
    merged.height = lineCanvas.height;

    const ctx =
      merged.getContext("2d");

    /*
      Give printed artwork a clean white paper background,
      then place the child's coloring underneath the outline.
    */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      merged.width,
      merged.height
    );

    ctx.drawImage(
      colorCanvas,
      0,
      0
    );

    ctx.drawImage(
      lineCanvas,
      0,
      0
    );

    return merged.toDataURL(
      "image/png"
    );
  },

  showFinishedGallery() {
    const imageUrl =
      this.makeFinishedArtworkImage();

    if (!imageUrl) return;

    const oldGallery =
      document.getElementById(
        "finishedArtGallery"
      );

    if (oldGallery) {
      oldGallery.remove();
    }

    const gallery =
      document.createElement("div");

    gallery.id =
      "finishedArtGallery";

    gallery.className =
      "art-gallery-overlay";

    gallery.innerHTML = `
      <div class="gallery-celebration">
        <div class="gallery-stars">
          ✨ 🌟 ✨
        </div>

        <h2>AMAZING ARTIST!</h2>

        <p>Look what you made!</p>
      </div>

      <div class="art-frame-wrap">
        <div class="art-frame">
          <div class="art-frame-inner">
            <img
              id="finishedArtImage"
              class="finished-art-image"
              src="${imageUrl}"
              alt="Finished student artwork"
            >
          </div>

          <div class="frame-nameplate">
            MY MASTERPIECE
          </div>
        </div>
      </div>

      <div class="gallery-actions">
        <button
          type="button"
          id="printArtButton"
          class="gallery-button gallery-print-button"
        >
          <span class="gallery-button-icon">🖨️</span>
          PRINT MY ART
        </button>

        <button
          type="button"
          id="drawAnotherButton"
          class="gallery-button gallery-another-button"
        >
          <span class="gallery-button-icon">🎨</span>
          DRAW ANOTHER
        </button>
      </div>
    `;

    document.body.appendChild(
      gallery
    );

    const printButton =
      document.getElementById(
        "printArtButton"
      );

    const anotherButton =
      document.getElementById(
        "drawAnotherButton"
      );

    printButton.addEventListener(
      "click",
      () => {
        window.print();
      }
    );

    anotherButton.addEventListener(
      "click",
      () => {
        window.location.reload();
      }
    );

    requestAnimationFrame(() => {
      gallery.classList.add(
        "gallery-visible"
      );
    });
  },

  animatePaths(ctx, paths, tool, done) {
    let pathIndex = 0;

    const runPath = () => {
      if (pathIndex >= paths.length) {
        done();
        return;
      }

      const points = paths[pathIndex];

      if (!points || points.length < 2) {
        pathIndex++;
        runPath();
        return;
      }

      let pointIndex = 0;

      const frame = () => {
        const point = points[pointIndex];

        if (pointIndex === 0) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        tool.style.left = `${point.x}px`;
        tool.style.top = `${point.y}px`;

        pointIndex++;

        if (pointIndex < points.length) {
          requestAnimationFrame(frame);
        } else {
          ctx.closePath();
          pathIndex++;
          setTimeout(runPath, 120);
        }
      };

      requestAnimationFrame(frame);
    };

    runPath();
  },

  animateColorStrokes(ctx, strokes, tool, done) {
    let strokeIndex = 0;

    const runStroke = () => {
      if (strokeIndex >= strokes.length) {
        done();
        return;
      }

      const stroke = strokes[strokeIndex];

      if (!stroke || stroke.length < 2) {
        strokeIndex++;
        runStroke();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      let pointIndex = 1;

      const frame = () => {
        const point = stroke[pointIndex];

        ctx.lineTo(point.x, point.y);
        ctx.stroke();

        tool.style.left = `${point.x}px`;
        tool.style.top = `${point.y}px`;

        pointIndex++;

        if (pointIndex < stroke.length) {
          requestAnimationFrame(frame);
        } else {
          ctx.closePath();
          strokeIndex++;
          setTimeout(runStroke, 18);
        }
      };

      requestAnimationFrame(frame);
    };

    runStroke();
  },

  ellipsePath(cx, cy, rx, ry, count = 100) {
    const points = [];

    for (let i = 0; i <= count; i++) {
      const angle =
        Math.PI * 2 * i / count;

      points.push({
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry
      });
    }

    return points;
  },

  curvePath(controlPoints) {
    const [a, b, c] = controlPoints;
    const points = [];

    for (let i = 0; i <= 70; i++) {
      const t = i / 70;
      const m = 1 - t;

      points.push({
        x:
          m * m * a.x +
          2 * m * t * b.x +
          t * t * c.x,

        y:
          m * m * a.y +
          2 * m * t * b.y +
          t * t * c.y
      });
    }

    return points;
  },

  polylinePath(vertices) {
    const points = [];

    for (let i = 0; i < vertices.length - 1; i++) {
      const a = vertices[i];
      const b = vertices[i + 1];

      for (let j = 0; j < 24; j++) {
        const t = j / 24;

        points.push({
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        });
      }
    }

    points.push(vertices[vertices.length - 1]);

    return points;
  },

  ellipseFillStrokes(cx, cy, rx, ry, spacing = 10) {
    const strokes = [];
    let reverse = false;

    for (
      let y = cy - ry + spacing;
      y <= cy + ry - spacing;
      y += spacing
    ) {
      const normalized =
        (y - cy) / ry;

      const inside =
        Math.max(
          0,
          1 - normalized * normalized
        );

      const half =
        rx * Math.sqrt(inside);

      const left = cx - half + 5;
      const right = cx + half - 5;

      if (right <= left) continue;

      const stroke = [];

      for (let i = 0; i <= 12; i++) {
        const t = i / 12;

        const x = reverse
          ? right - (right - left) * t
          : left + (right - left) * t;

        stroke.push({ x, y });
      }

      strokes.push(stroke);
      reverse = !reverse;
    }

    return strokes;
  },

  polygonFillStrokes(vertices, spacing = 8) {
    const strokes = [];

    const minY =
      Math.min(...vertices.map((v) => v.y));

    const maxY =
      Math.max(...vertices.map((v) => v.y));

    let reverse = false;

    for (
      let y = minY + spacing;
      y <= maxY - spacing;
      y += spacing
    ) {
      const hits = [];

      for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b =
          vertices[(i + 1) % vertices.length];

        if (
          (a.y <= y && b.y > y) ||
          (b.y <= y && a.y > y)
        ) {
          const t =
            (y - a.y) / (b.y - a.y);

          hits.push(
            a.x + (b.x - a.x) * t
          );
        }
      }

      hits.sort((a, b) => a - b);

      for (let i = 0; i < hits.length - 1; i += 2) {
        const left = hits[i] + 4;
        const right = hits[i + 1] - 4;

        if (right <= left) continue;

        const stroke = [];

        for (let p = 0; p <= 10; p++) {
          const t = p / 10;

          const x = reverse
            ? right - (right - left) * t
            : left + (right - left) * t;

          stroke.push({ x, y });
        }

        strokes.push(stroke);
        reverse = !reverse;
      }
    }

    return strokes;
  },

  removeDemoTool() {
    if (this.demoTool) {
      this.demoTool.remove();
      this.demoTool = null;
    }
  },

  setDirectionButtons({
    skip = false,
    repeat = false
  } = {}) {
    const skipButton =
      document.getElementById("skipButton");

    const repeatButton =
      document.getElementById("repeatButton");

    if (skipButton) {
      skipButton.disabled = !skip;
    }

    if (repeatButton) {
      repeatButton.disabled = !repeat;
      repeatButton.classList.toggle(
        "repeat-ready",
        repeat
      );
    }
  },

  async playDirectionSection(text) {
    this.currentRepeatText = text;
    this.directionSectionActive = true;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    await this.speak(text);

    this.directionSectionActive = false;

    this.setDirectionButtons({
      skip: false,
      repeat: true
    });
  },

  skipCurrentDirections() {
    if (!this.directionSectionActive) {
      return;
    }

    /*
      Invalidate every async tutorial step
      that belongs to the current direction block.
    */
    this.directionToken++;

    this.directionSectionActive = false;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (this.activeSpeechResolve) {
      const resolve =
        this.activeSpeechResolve;

      this.activeSpeechResolve = null;
      resolve();
    }

    this.speechQueue =
      Promise.resolve();

    const hand =
      document.querySelector(
        ".tutorial-hand"
      );

    if (hand) {
      hand.classList.remove(
        "visible",
        "tap"
      );
    }

    document.querySelectorAll(
      ".child-tool-waiting, .child-tool-ready, .demo-selected"
    ).forEach((item) => {
      item.classList.remove(
        "child-tool-waiting",
        "child-tool-ready",
        "demo-selected"
      );
    });

    this.setDirectionButtons({
      skip: false,
      repeat: true
    });
  },


  repeatCurrentDirections() {
    if (
      this.directionSectionActive ||
      !this.currentRepeatText
    ) {
      return;
    }

    this.playDirectionSection(
      this.currentRepeatText
    );
  },

  setRepeatText(text) {
    this.currentRepeatText =
      text || "";
  },

  speak(text) {
    this.speechQueue =
      this.speechQueue.then(() => {
        return new Promise((resolve) => {
          this.activeSpeechResolve =
            resolve;

          if (
            !("speechSynthesis" in window)
          ) {
            resolve();
            return;
          }

          const utterance =
            new SpeechSynthesisUtterance(
              text
            );

          utterance.rate = 0.88;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onend = () => {
            this.activeSpeechResolve = null;
            resolve();
          };

          utterance.onerror = () => {
            this.activeSpeechResolve = null;
            resolve();
          };

          window.speechSynthesis.speak(
            utterance
          );
        });
      });

    return this.speechQueue;
  }
};
