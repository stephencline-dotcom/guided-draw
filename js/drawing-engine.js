const GuidedDraw = {
  currentStep: 0,
  phase: "watching",
  pencilEl: null,

  fishSteps: [
    {
      name: "body",
      watchText: "Watch me draw the fish's body.",
      turnText: "Your turn! Draw the fish's body.",
      draw(width, height) {
        const cx = width * 0.47;
        const cy = height * 0.52;
        const rx = Math.min(width * 0.27, height * 0.38);
        const ry = Math.min(width * 0.16, height * 0.27);

        return [
          GuidedDraw.ellipsePath(cx, cy, rx, ry)
        ];
      }
    },

    {
      name: "tail",
      watchText: "Watch me add the tail.",
      turnText: "Your turn! Add the tail.",
      draw(width, height) {
        const cx = width * 0.47;
        const cy = height * 0.52;
        const rx = Math.min(width * 0.27, height * 0.38);

        const joinX = cx + rx * 0.90;
        const tailX = Math.min(width * 0.86, joinX + width * 0.17);
        const tailTop = cy - height * 0.19;
        const tailBottom = cy + height * 0.19;

        return [
          GuidedDraw.polylinePath([
            { x: joinX, y: cy - height * 0.07 },
            { x: tailX, y: tailTop },
            { x: tailX - width * 0.015, y: cy },
            { x: tailX, y: tailBottom },
            { x: joinX, y: cy + height * 0.07 }
          ])
        ];
      }
    },

    {
      name: "fins",
      watchText: "Watch me add the fins.",
      turnText: "Your turn! Add the fins.",
      draw(width, height) {
        const cx = width * 0.47;
        const cy = height * 0.52;

        return [
          GuidedDraw.curvePath([
            { x: cx - width * 0.06, y: cy - height * 0.22 },
            { x: cx - width * 0.01, y: cy - height * 0.37 },
            { x: cx + width * 0.08, y: cy - height * 0.23 }
          ]),

          GuidedDraw.curvePath([
            { x: cx - width * 0.02, y: cy + height * 0.05 },
            { x: cx + width * 0.08, y: cy + height * 0.19 },
            { x: cx + width * 0.12, y: cy + height * 0.02 }
          ])
        ];
      }
    },

    {
      name: "eye",
      watchText: "Watch me draw the eye.",
      turnText: "Your turn! Draw the eye.",
      draw(width, height) {
        const cx = width * 0.47;
        const cy = height * 0.52;

        return [
          GuidedDraw.ellipsePath(
            cx - width * 0.13,
            cy - height * 0.07,
            Math.max(8, width * 0.014),
            Math.max(8, width * 0.014)
          )
        ];
      }
    },

    {
      name: "face",
      watchText: "Watch me add a smile and bubbles.",
      turnText: "Your turn! Add a smile and some bubbles.",
      draw(width, height) {
        const cx = width * 0.47;
        const cy = height * 0.52;

        return [
          GuidedDraw.curvePath([
            { x: cx - width * 0.22, y: cy + height * 0.01 },
            { x: cx - width * 0.17, y: cy + height * 0.10 },
            { x: cx - width * 0.12, y: cy + height * 0.02 }
          ]),

          GuidedDraw.ellipsePath(
            cx - width * 0.31,
            cy - height * 0.11,
            width * 0.018,
            width * 0.018
          ),

          GuidedDraw.ellipsePath(
            cx - width * 0.35,
            cy - height * 0.20,
            width * 0.026,
            width * 0.026
          ),

          GuidedDraw.ellipsePath(
            cx - width * 0.39,
            cy - height * 0.31,
            width * 0.035,
            width * 0.035
          )
        ];
      }
    }
  ],

  start() {
    this.currentStep = 0;
    this.phase = "watching";
    this.setSketchMode();
    this.startComputerTurn();
  },

  setSketchMode() {
    document.querySelectorAll(".tool-button").forEach((button) => {
      const allowedDuringSketch =
        button.dataset.tool === "pencil" ||
        button.dataset.tool === "eraser";

      button.disabled = !allowedDuringSketch;
      button.classList.toggle("tool-locked", !allowedDuringSketch);
      button.classList.toggle(
        "active",
        button.dataset.tool === "pencil"
      );
    });

    document.querySelectorAll(".color-button").forEach((button) => {
      button.disabled = true;
      button.classList.add("color-locked");
    });

    if (typeof childDrawingState !== "undefined") {
      childDrawingState.tool = "pencil";
      childDrawingState.color = "#263238";
    }
  },

  startComputerTurn() {
    const step = this.fishSteps[this.currentStep];

    if (!step) {
      this.startColoringStage();
      return;
    }

    this.phase = "watching";

    const childCanvas = document.getElementById("childCanvas");
    const computerMessage = document.getElementById("computerMessage");
    const childMessage = document.getElementById("childMessage");
    const doneButton = document.getElementById("doneButton");
    const stepText = document.getElementById("stepText");
    const stepCounter = document.getElementById("stepCounter");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;

    if (typeof childDrawingState !== "undefined") {
      childDrawingState.hasDrawn = false;
      childDrawingState.drawing = false;
    }

    stepText.textContent =
      `Step ${this.currentStep + 1} • Watch me draw!`;

    stepCounter.textContent =
      `${this.currentStep + 1} / 6`;

    computerMessage.classList.add("message-hidden");

    childMessage.innerHTML = `
      <span class="message-icon">👀</span>
      <strong>WATCH!</strong>
    `;

    childMessage.classList.remove("message-hidden");

    this.speak(step.watchText);

    setTimeout(() => {
      this.animateCurrentStep();
    }, 550);
  },

  animateCurrentStep() {
    const canvas = document.getElementById("computerCanvas");
    const frame = canvas.closest(".canvas-frame");
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const step = this.fishSteps[this.currentStep];
    const paths = step.draw(width, height);

    ctx.strokeStyle = "#30343b";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;

    this.removeDemoPencil();

    const pencil = document.createElement("div");
    pencil.className = "demo-pencil";
    pencil.textContent = "✏️";
    frame.appendChild(pencil);

    this.pencilEl = pencil;

    let pathIndex = 0;

    const animatePath = () => {
      if (pathIndex >= paths.length) {
        this.finishComputerTurn();
        return;
      }

      const points = paths[pathIndex];

      if (!points || points.length < 2) {
        pathIndex++;
        animatePath();
        return;
      }

      let index = 0;
      let previousTime = 0;

      const drawFrame = (time) => {
        if (!previousTime) previousTime = time;

        if (time - previousTime >= 12) {
          previousTime = time;

          const point = points[index];

          if (index === 0) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }

          pencil.style.left = `${point.x}px`;
          pencil.style.top = `${point.y}px`;

          if (index < points.length - 1) {
            const next = points[index + 1];

            const angle =
              Math.atan2(
                next.y - point.y,
                next.x - point.x
              ) * 180 / Math.PI;

            pencil.style.transform =
              `translate(-12%, -88%) rotate(${angle + 45}deg)`;
          }

          index++;
        }

        if (index < points.length) {
          requestAnimationFrame(drawFrame);
        } else {
          ctx.closePath();
          pathIndex++;

          setTimeout(() => {
            animatePath();
          }, 180);
        }
      };

      requestAnimationFrame(drawFrame);
    };

    animatePath();
  },

  finishComputerTurn() {
    this.removeDemoPencil();

    const step = this.fishSteps[this.currentStep];
    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const stepText = document.getElementById("stepText");

    this.phase = "child";

    stepText.textContent =
      `Step ${this.currentStep + 1} • Your turn!`;

    childMessage.innerHTML = `
      <span class="message-icon">✏️</span>
      <strong>YOUR TURN!</strong>
      <span class="turn-help">${this.getChildInstruction()}</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("your-turn-pop");

    this.speak(step.turnText);

    setTimeout(() => {
      childMessage.classList.add("message-hidden");
      childMessage.classList.remove("your-turn-pop");
      childCanvas.classList.remove("canvas-locked");
    }, 1350);
  },

  getChildInstruction() {
    const instructions = [
      "Draw the fish's body.",
      "Add the tail.",
      "Add the fins.",
      "Draw the eye.",
      "Add a smile and bubbles."
    ];

    return instructions[this.currentStep] || "Draw this part.";
  },

  childFinishedStep() {
    if (this.phase !== "child") return;

    this.phase = "transition";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const doneButton = document.getElementById("doneButton");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;

    childMessage.innerHTML = `
      <span class="message-icon">⭐</span>
      <strong>NICE DRAWING!</strong>
    `;

    childMessage.classList.remove("message-hidden");

    this.speak("Nice drawing!");

    setTimeout(() => {
      childMessage.classList.add("message-hidden");

      this.currentStep++;

      if (this.currentStep < this.fishSteps.length) {
        this.startComputerTurn();
      } else {
        this.startColoringStage();
      }
    }, 900);
  },

  startColoringStage() {
    this.phase = "coloring";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const computerMessage = document.getElementById("computerMessage");
    const stepText = document.getElementById("stepText");
    const stepCounter = document.getElementById("stepCounter");
    const doneButton = document.getElementById("doneButton");

    stepText.textContent = "Step 6 • Time to color!";
    stepCounter.textContent = "6 / 6";

    document.querySelectorAll(".tool-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("tool-locked");
    });

    document.querySelectorAll(".color-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("color-locked");
    });

    if (typeof childDrawingState !== "undefined") {
      childDrawingState.hasDrawn = false;
      childDrawingState.drawing = false;
    }

    computerMessage.innerHTML = `
      <span class="message-icon">🎨</span>
      <strong>COLOR IT!</strong>
    `;

    computerMessage.classList.remove("message-hidden");

    childMessage.innerHTML = `
      <span class="message-icon">🎨</span>
      <strong>TIME TO COLOR!</strong>
      <span class="turn-help">Choose any colors you like!</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("color-celebration");

    doneButton.disabled = true;

    this.speak("Time to color! Choose any colors you like.");

    setTimeout(() => {
      computerMessage.classList.add("message-hidden");
      childMessage.classList.add("message-hidden");
      childMessage.classList.remove("color-celebration");
      childCanvas.classList.remove("canvas-locked");
    }, 1700);
  },

  finishArtwork() {
    this.phase = "finished";

    const childCanvas = document.getElementById("childCanvas");
    const childMessage = document.getElementById("childMessage");
    const doneButton = document.getElementById("doneButton");

    childCanvas.classList.add("canvas-locked");
    doneButton.disabled = true;

    childMessage.innerHTML = `
      <span class="message-icon finish-star">🌟</span>
      <strong>AMAZING ARTIST!</strong>
      <span class="turn-help">You drew a fish!</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("finished-message");

    this.speak("Amazing artist! You drew a fish!");
  },

  ellipsePath(cx, cy, rx, ry, count = 100) {
    const points = [];

    for (let i = 0; i <= count; i++) {
      const angle = Math.PI * 2 * i / count;

      points.push({
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry
      });
    }

    return points;
  },

  polylinePath(vertices) {
    const points = [];

    for (let i = 0; i < vertices.length - 1; i++) {
      const a = vertices[i];
      const b = vertices[i + 1];
      const segments = 24;

      for (let j = 0; j < segments; j++) {
        const t = j / segments;

        points.push({
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        });
      }
    }

    points.push(vertices[vertices.length - 1]);

    return points;
  },

  curvePath(controlPoints) {
    if (controlPoints.length !== 3) {
      return this.polylinePath(controlPoints);
    }

    const [a, b, c] = controlPoints;
    const points = [];
    const count = 70;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const oneMinusT = 1 - t;

      points.push({
        x:
          oneMinusT * oneMinusT * a.x +
          2 * oneMinusT * t * b.x +
          t * t * c.x,

        y:
          oneMinusT * oneMinusT * a.y +
          2 * oneMinusT * t * b.y +
          t * t * c.y
      });
    }

    return points;
  },

  removeDemoPencil() {
    if (this.pencilEl) {
      this.pencilEl.remove();
      this.pencilEl = null;
    }
  },

  speak(text) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
};
