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

  async showCloseShapeLesson() {
    const frame =
      document.querySelector(
        ".computer-side .canvas-frame"
      );

    if (!frame) {
      return true;
    }

    const oldTip =
      document.getElementById(
        "closeShapeTip"
      );

    if (oldTip) {
      oldTip.remove();
    }

    const tip =
      document.createElement("div");

    tip.id =
      "closeShapeTip";

    tip.className =
      "close-shape-tip";

    tip.innerHTML = `
      <div class="close-shape-title">
        CLOSE THE SHAPE!
      </div>

      <div class="close-shape-examples">

        <div class="close-shape-example good">
          <div class="shape-demo closed-shape"></div>
          <div class="shape-result">
            ✅ PAINT STAYS INSIDE
          </div>
        </div>

        <div class="close-shape-example bad">
          <div class="shape-demo open-shape"></div>
          <div class="shape-result">
            ❌ PAINT CAN SPILL OUT
          </div>
        </div>

      </div>
    `;

    frame.appendChild(tip);

    await this.teach(
      "Here is an important artist trick. When we want to use the Fill tool later, our shape has to be closed. That means the end of the line needs to touch the beginning."
    );

    if (
      !this.directionSectionActive
    ) {
      tip.remove();
      return false;
    }

    await this.teach(
      "Look at the closed shape. There is no opening, so the paint stays inside. If we leave a gap, the paint can spill out through the opening."
    );

    await this.wait(700);

    tip.classList.add(
      "tip-fade"
    );

    await this.wait(350);

    tip.remove();

    return true;
  },

  async showFishEraserLesson() {
    const canvas =
      document.getElementById("computerCanvas");

    if (!canvas) {
      return true;
    }

    const frame =
      canvas.closest(".canvas-frame");

    const ctx =
      canvas.getContext("2d");

    const w =
      canvas.clientWidth;

    const h =
      canvas.clientHeight;

    const introFinished =
      await this.teach(
        "Before we start, I want to show you something helpful. Sometimes artists make a mark they do not want. If that happens, we can use the eraser."
      );

    if (!introFinished) {
      return false;
    }

    /*
      Make sure Pencil is the active demonstration tool.
    */
    await this.demonstrateControls({
      tool: "pencil"
    });

    /*
      Draw a very obvious accidental zig-zag
      in the upper-right corner.
    */
    const mistake = [
      { x: w * 0.72, y: h * 0.17 },
      { x: w * 0.77, y: h * 0.10 },
      { x: w * 0.81, y: h * 0.20 },
      { x: w * 0.85, y: h * 0.11 }
    ];

    this.removeDemoTool();

    const pencil =
      document.createElement("div");

    pencil.className =
      "demo-pencil";

    pencil.textContent =
      "✏️";

    frame.appendChild(pencil);

    this.demoTool =
      pencil;

    ctx.save();
    ctx.globalCompositeOperation =
      "source-over";
    ctx.strokeStyle =
      "#30343b";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(
      mistake[0].x,
      mistake[0].y
    );

    for (
      let i = 1;
      i < mistake.length;
      i++
    ) {
      const from =
        mistake[i - 1];

      const to =
        mistake[i];

      const parts = 16;

      for (
        let j = 1;
        j <= parts;
        j++
      ) {
        const t =
          j / parts;

        const x =
          from.x +
          (to.x - from.x) * t;

        const y =
          from.y +
          (to.y - from.y) * t;

        pencil.style.left =
          `${x}px`;

        pencil.style.top =
          `${y}px`;

        ctx.lineTo(x, y);
        ctx.stroke();

        await this.wait(18);
      }
    }

    ctx.restore();

    /*
      Pause so the child clearly sees
      the mistake before it is erased.
    */
    await this.wait(650);

    this.removeDemoTool();

    const oopsFinished =
      await this.teach(
        "Oops! That is not where I wanted my line. Watch me choose the eraser and fix my mistake."
      );

    if (!oopsFinished) {
      return false;
    }

    await this.demonstrateControls({
      tool: "eraser"
    });

    this.removeDemoTool();

    const eraser =
      document.createElement("div");

    eraser.className =
      "demo-eraser";

    eraser.textContent =
      "🧽";

    frame.appendChild(eraser);

    this.demoTool =
      eraser;

    /*
      Erase along the same zig-zag,
      backwards.
    */
    for (
      let i = mistake.length - 1;
      i > 0;
      i--
    ) {
      const from =
        mistake[i];

      const to =
        mistake[i - 1];

      const parts = 16;

      for (
        let j = 0;
        j <= parts;
        j++
      ) {
        const t =
          j / parts;

        const x =
          from.x +
          (to.x - from.x) * t;

        const y =
          from.y +
          (to.y - from.y) * t;

        eraser.style.left =
          `${x}px`;

        eraser.style.top =
          `${y}px`;

        ctx.clearRect(
          x - 18,
          y - 18,
          36,
          36
        );

        await this.wait(14);
      }
    }

    /*
      Final cleanup around the demo area only.
    */
    ctx.clearRect(
      w * 0.68,
      h * 0.05,
      w * 0.22,
      h * 0.22
    );

    await this.wait(350);

    this.removeDemoTool();

    const explainFinished =
      await this.teach(
        "There we go! You might not need the eraser, but if you make a mistake, choose Eraser and rub the mark away."
      );

    if (!explainFinished) {
      return false;
    }

    /*
      Return visibly to Pencil before
      the real Fish drawing starts.
    */
    await this.demonstrateControls({
      tool: "pencil"
    });

    await this.wait(300);

    return true;
  },


  flowerGeometry(w, h) {
    const cx = w * 0.50;
    const cy = h * 0.36;

    const centerR =
      Math.min(w, h) * 0.085;

    const petalDistance =
      Math.min(w, h) * 0.175;

    const petalRx =
      Math.min(w, h) * 0.062;

    const petalRy =
      Math.min(w, h) * 0.095;

    const stemBottom =
      h * 0.82;

    return {
      cx,
      cy,
      centerR,
      petalDistance,
      petalRx,
      petalRy,
      stemBottom
    };
  },

  buildFlowerSteps() {
    this.drawingSteps = [
      {
        watch:
          "Little artist, we're starting with the middle of the flower. Watch carefully because I need to close my circle by bringing the line all the way back to where I started.",
        turn:
          "Your turn! Draw a big circle for the middle of your flower. Bring your line all the way back to where you started so there is no gap.",
        short:
          "Draw a closed circle for the flower's middle.",

        paths: (w, h) => {
          const g =
            this.flowerGeometry(w, h);

          return [
            this.ellipsePath(
              g.cx,
              g.cy,
              g.centerR,
              g.centerR
            )
          ];
        }
      },

      {
        watch:
          "Now I'm adding six big petals. Watch how every petal comes back and touches where it started so each petal is completely closed.",
        turn:
          "Your turn! Add big petals around your flower. Close every petal by making the end of your line touch the beginning.",
        short:
          "Add closed petals with no gaps.",

        paths: (w, h) => {
          const g =
            this.flowerGeometry(w, h);

          const paths = [];

          for (let i = 0; i < 6; i++) {
            const angle =
              -Math.PI / 2 +
              i * Math.PI / 3;

            const px =
              g.cx +
              Math.cos(angle) *
              g.petalDistance;

            const py =
              g.cy +
              Math.sin(angle) *
              g.petalDistance;

            /*
              Slightly simplified oval petals.
              Kindergarten-friendly rather than botanical.
            */
            paths.push(
              this.ellipsePath(
                px,
                py,
                g.petalRx,
                g.petalRy
              )
            );
          }

          return paths;
        }
      },

      {
        watch:
          "Next, I'm drawing one long stem down from the flower.",
        turn:
          "Your turn! Draw a long stem down from your flower.",
        short:
          "Draw the stem.",

        paths: (w, h) => {
          const g =
            this.flowerGeometry(w, h);

          return [
            this.polylinePath([
              {
                x: g.cx,
                y:
                  g.cy +
                  g.centerR
              },
              {
                x: g.cx,
                y:
                  g.stemBottom
              }
            ])
          ];
        }
      },

      {
        watch:
          "My flower needs leaves. I'm going to add one leaf on each side of the stem.",
        turn:
          "Your turn! Add two leaves to your stem.",
        short:
          "Add two leaves.",

        paths: (w, h) => {
          const g =
            this.flowerGeometry(w, h);

          const leftY =
            h * 0.60;

          const rightY =
            h * 0.70;

          return [
            this.curvePath([
              {
                x: g.cx,
                y: leftY
              },
              {
                x: g.cx - w * 0.12,
                y: leftY - h * 0.08
              },
              {
                x: g.cx - w * 0.16,
                y: leftY + h * 0.02
              }
            ]),

            this.curvePath([
              {
                x: g.cx - w * 0.16,
                y: leftY + h * 0.02
              },
              {
                x: g.cx - w * 0.08,
                y: leftY + h * 0.08
              },
              {
                x: g.cx,
                y: leftY
              }
            ]),

            this.curvePath([
              {
                x: g.cx,
                y: rightY
              },
              {
                x: g.cx + w * 0.12,
                y: rightY - h * 0.07
              },
              {
                x: g.cx + w * 0.16,
                y: rightY + h * 0.02
              }
            ]),

            this.curvePath([
              {
                x: g.cx + w * 0.16,
                y: rightY + h * 0.02
              },
              {
                x: g.cx + w * 0.08,
                y: rightY + h * 0.08
              },
              {
                x: g.cx,
                y: rightY
              }
            ])
          ];
        }
      },

      {
        watch:
          "Let's give our flower a happy face. I'm adding two eyes and a smile.",
        turn:
          "Your turn! Give your flower a happy face.",
        short:
          "Add two eyes and a smile.",

        paths: (w, h) => {
          const g =
            this.flowerGeometry(w, h);

          return [
            this.ellipsePath(
              g.cx - g.centerR * 0.35,
              g.cy - g.centerR * 0.15,
              g.centerR * 0.09,
              g.centerR * 0.13
            ),

            this.ellipsePath(
              g.cx + g.centerR * 0.35,
              g.cy - g.centerR * 0.15,
              g.centerR * 0.09,
              g.centerR * 0.13
            ),

            this.curvePath([
              {
                x:
                  g.cx -
                  g.centerR * 0.38,
                y:
                  g.cy +
                  g.centerR * 0.20
              },
              {
                x: g.cx,
                y:
                  g.cy +
                  g.centerR * 0.52
              },
              {
                x:
                  g.cx +
                  g.centerR * 0.38,
                y:
                  g.cy +
                  g.centerR * 0.20
              }
            ])
          ];
        }
      }
    ];
  },

  buildFlowerColorSteps() {
    this.colorSteps = [
      {
        watch:
          "Now I'm going to color the middle of the flower. This is a closed shape, so I can use the Fill tool.",
        turn:
          "Your turn! Use the Fill tool to color the middle of your flower.",
        short:
          "Fill the flower's middle.",
        tool: "bucket",
        color: "#fdd835",
        size: null,
        fillTargets(w, h) {
          const g =
            GuidedDraw.flowerGeometry(w, h);

          return [
            {
              type: "ellipse",
              x: g.cx,
              y: g.cy,
              rx: g.centerR - 6,
              ry: g.centerR - 6
            }
          ];
        }
      },

      {
        watch:
          "Next I'm going to fill the petals. Each petal is a closed shape, so I can use the Fill tool again.",
        turn:
          "Your turn! Fill your flower petals. You can choose any colors you like.",
        short:
          "Fill the petals.",
        tool: "bucket",
        color: "#ec6fa7",
        size: null,
        fillTargets(w, h) {
          const g =
            GuidedDraw.flowerGeometry(w, h);

          const targets = [];

          for (let i = 0; i < 6; i++) {
            const angle =
              -Math.PI / 2 +
              i * Math.PI / 3;

            targets.push({
              type: "ellipse",
              x:
                g.cx +
                Math.cos(angle) *
                g.petalDistance,
              y:
                g.cy +
                Math.sin(angle) *
                g.petalDistance,
              rx: g.petalRx - 5,
              ry: g.petalRy - 5
            });
          }

          return targets;
        }
      },

      {
        watch:
          "Now I'm switching back to a crayon to color the stem and leaves.",
        turn:
          "Your turn! Use a crayon to color the stem and leaves.",
        short:
          "Color the stem and leaves.",
        tool: "crayon",
        color: "#43a047",
        size: "medium",

        strokes(w, h) {
          const g =
            GuidedDraw.flowerGeometry(w, h);

          const strokes = [];

          /*
            Stem
          */
          for (let offset = -5; offset <= 5; offset += 5) {
            strokes.push([
              {
                x: g.cx + offset,
                y: g.cy + g.centerR + 8
              },
              {
                x: g.cx + offset,
                y: g.stemBottom - 5
              }
            ]);
          }

          /*
            Left leaf
          */
          strokes.push([
            {
              x: g.cx - 4,
              y: h * 0.60
            },
            {
              x: g.cx - w * 0.07,
              y: h * 0.59
            },
            {
              x: g.cx - w * 0.13,
              y: h * 0.61
            }
          ]);

          strokes.push([
            {
              x: g.cx - 4,
              y: h * 0.615
            },
            {
              x: g.cx - w * 0.07,
              y: h * 0.63
            },
            {
              x: g.cx - w * 0.13,
              y: h * 0.625
            }
          ]);

          /*
            Right leaf
          */
          strokes.push([
            {
              x: g.cx + 4,
              y: h * 0.70
            },
            {
              x: g.cx + w * 0.07,
              y: h * 0.69
            },
            {
              x: g.cx + w * 0.13,
              y: h * 0.71
            }
          ]);

          strokes.push([
            {
              x: g.cx + 4,
              y: h * 0.715
            },
            {
              x: g.cx + w * 0.07,
              y: h * 0.73
            },
            {
              x: g.cx + w * 0.13,
              y: h * 0.725
            }
          ]);

          return strokes;
        }
      }
    ];
  },


  start() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.speechQueue = Promise.resolve();

    this.drawingStep = 0;
    this.colorStep = 0;

    if (
      this.selectedDrawing === "flower"
    ) {
      this.buildFlowerSteps();
      this.buildFlowerColorSteps();
    }

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

    /*
      Once a direction sequence starts, Skip stays
      available until finishDirectionSection() is called.
    */
    this.directionSectionActive = true;
    this.currentRepeatText = text;

    this.setDirectionButtons({
      skip: true,
      repeat: false
    });

    await this.speak(text);

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

    /*
      DO NOT turn Skip off here.
      More directions may still be coming.
    */
    return true;
  },

  finishDirectionSection() {
    /*
      We have reached the point where the directions
      are finished and the child/computer can act.
    */
    this.directionSectionActive = false;

    this.setDirectionButtons({
      skip: false,
      repeat: Boolean(this.currentRepeatText)
    });
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

        this.finishDirectionSection();

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

        this.finishDirectionSection();

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
        this.finishDirectionSection();

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
        button.dataset.tool === "pencil" ||
        button.dataset.tool === "crayon" ||
        button.dataset.tool === "marker" ||
        button.dataset.tool === "eraser" ||
        button.dataset.tool === "bucket";

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

  async startDrawingWatch() {
    const step =
      this.drawingSteps[
        this.drawingStep
      ];

    if (!step) {
      this.beginColoring();
      return;
    }

    this.phase = "draw-watch";
    this.prepareChildForWatch();

    const childMessage =
      document.getElementById(
        "childMessage"
      );

    const computerMessage =
      document.getElementById(
        "computerMessage"
      );

    document.getElementById(
      "stepText"
    ).textContent =
      `Step ${this.drawingStep + 1} • Watch me draw!`;

    document.getElementById(
      "stepCounter"
    ).textContent =
      `${this.drawingStep + 1} / 8`;

    computerMessage.classList.add(
      "message-hidden"
    );

    childMessage.innerHTML = `
      <span class="message-icon">👀</span>
      <strong>WATCH!</strong>
    `;

    childMessage.classList.remove(
      "message-hidden"
    );

    /*
      =====================================================
      FLOWER STEP 1
      Teach why closed shapes matter before drawing.
      =====================================================
    */
    if (
      this.selectedDrawing === "flower" &&
      this.drawingStep === 0 &&
      typeof this.showCloseShapeLesson ===
        "function"
    ) {
      const closeLessonFinished =
        await this.showCloseShapeLesson();

      /*
        If Skip was used, just continue into
        the actual drawing demonstration.
      */
      if (!closeLessonFinished) {
        this.finishDirectionSection();
        this.animateDrawingStep();
        return;
      }
    }

    /*
      =====================================================
      FISH STEP 1
      Eraser lesson MUST completely finish before
      anything about the Fish body begins.
      =====================================================
    */
    if (
      this.selectedDrawing === "fish" &&
      this.drawingStep === 0 &&
      typeof this.showFishEraserLesson ===
        "function"
    ) {
      const eraserLessonFinished =
        await this.showFishEraserLesson();

      /*
        If the child used Skip during this optional
        lesson, go directly to the actual Fish demo.
      */
      if (!eraserLessonFinished) {
        this.finishDirectionSection();
        this.animateDrawingStep();
        return;
      }
    }

    /*
      =====================================================
      NOW begin the real step.
      Nothing above is running anymore.
      =====================================================
    */
    const openingFinished =
      await this.teach(
        step.watch
      );

    if (!openingFinished) {
      this.finishDirectionSection();
      this.animateDrawingStep();
      return;
    }

    /*
      Make sure Pencil is selected.
      If Fish Step 1 already returned to Pencil,
      demonstrateControls() will simply do nothing.
    */
    const controlsFinished =
      await this.demonstrateControls({
        tool: "pencil"
      });

    if (!controlsFinished) {
      this.finishDirectionSection();
      this.animateDrawingStep();
      return;
    }

    /*
      Picture-specific Step 1 explanation.
    */
    if (this.drawingStep === 0) {

      if (
        this.selectedDrawing === "flower"
      ) {
        const techniqueFinished =
          await this.teach(
            "Watch where my pencil starts. I'm going to draw one big closed circle for the flower's center. I will bring my line all the way back to where I started so there is no gap."
          );

        if (!techniqueFinished) {
          this.finishDirectionSection();
          this.animateDrawingStep();
          return;
        }

      } else {
        const techniqueFinished =
          await this.teach(
            "Watch where my pencil starts. I'm going to move slowly around to make one big round shape for the fish's body."
          );

        if (!techniqueFinished) {
          this.finishDirectionSection();
          this.animateDrawingStep();
          return;
        }
      }

    } else {
      const techniqueFinished =
        await this.teach(
          "Watch carefully as I draw the next part."
        );

      if (!techniqueFinished) {
        this.finishDirectionSection();
        this.animateDrawingStep();
        return;
      }
    }

    /*
      All instructions are finished.
      NOW the real drawing starts.
    */
    this.finishDirectionSection();
    this.animateDrawingStep();
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

      this.finishDirectionSection();

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
        tool: step.tool || "crayon",
        size: step.size || null,
        color: step.color
      });

      if (step.tool === "bucket") {
        await this.teach(
          "Watch what happens when I click inside a closed shape. The Fill tool colors the whole inside at once."
        );
      } else if (step.size === "thick") {
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

  animateBucketStep() {
    const colorCanvas =
      document.getElementById(
        "computerColorCanvas"
      );

    const lineCanvas =
      document.getElementById(
        "computerCanvas"
      );

    const frame =
      lineCanvas.closest(
        ".canvas-frame"
      );

    const ctx =
      colorCanvas.getContext("2d");

    const step =
      this.colorSteps[
        this.colorStep
      ];

    const targets =
      step.fillTargets(
        colorCanvas.clientWidth,
        colorCanvas.clientHeight
      );

    this.removeDemoTool();

    const bucket =
      document.createElement("div");

    bucket.className =
      "demo-crayon demo-bucket";

    bucket.textContent = "🪣";

    frame.appendChild(bucket);

    this.demoTool = bucket;

    let index = 0;

    const fillNext = () => {
      if (index >= targets.length) {
        this.removeDemoTool();
        this.finishColorWatch();
        return;
      }

      const target =
        targets[index];

      bucket.style.left =
        `${target.x}px`;

      bucket.style.top =
        `${target.y}px`;

      setTimeout(() => {
        ctx.save();

        ctx.globalAlpha = 1;
        ctx.fillStyle =
          step.color;

        if (
          target.type === "ellipse"
        ) {
          ctx.beginPath();

          ctx.ellipse(
            target.x,
            target.y,
            Math.max(
              1,
              target.rx
            ),
            Math.max(
              1,
              target.ry
            ),
            0,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        ctx.restore();

        bucket.classList.add(
          "bucket-pop"
        );

        setTimeout(() => {
          bucket.classList.remove(
            "bucket-pop"
          );

          index++;

          setTimeout(
            fillNext,
            350
          );
        }, 250);
      }, 550);
    };

    fillNext();
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

    if (
      step.tool === "bucket" &&
      typeof step.fillTargets === "function"
    ) {
      this.animateBucketStep();
      return;
    }

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

    const turnIcon =
      step.tool === "bucket"
        ? "🪣"
        : "🖍️";

    childMessage.innerHTML = `
      <span class="message-icon">${turnIcon}</span>
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
        tool: step.tool || "crayon",
        size: step.size || null,
        letChildChooseColor: true
      });

      const direction =
        `${step.turn} Take your time.`;

      await this.playDirectionSection(
        direction
      );

      this.finishDirectionSection();

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

    const drawingLabel =
      this.selectedDrawing === "flower"
        ? "Flower"
        : "Fish";

    document.getElementById("stepText").textContent =
      `${drawingLabel} complete!`;

    document.getElementById("stepCounter").textContent =
      "★";

    childMessage.innerHTML = `
      <span class="message-icon finish-star">🌟</span>
      <strong>AMAZING ARTIST!</strong>
      <span class="turn-help">You drew and colored a ${drawingLabel.toLowerCase()}!</span>
    `;

    childMessage.classList.remove("message-hidden");
    childMessage.classList.add("finished-message");

    this.setRepeatText(
      `Amazing artist! You drew and colored a ${drawingLabel.toLowerCase()}!`
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

    if (
      !colorCanvas ||
      !lineCanvas
    ) {
      return null;
    }

    const merged =
      document.createElement("canvas");

    merged.width =
      lineCanvas.width;

    merged.height =
      lineCanvas.height;

    const ctx =
      merged.getContext("2d");

    /*
      White paper first.
    */
    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      merged.width,
      merged.height
    );

    /*
      Color underneath.
    */
    ctx.drawImage(
      colorCanvas,
      0,
      0
    );

    /*
      Pencil lines on top.
    */
    ctx.drawImage(
      lineCanvas,
      0,
      0
    );

    /*
      Find the actual artwork bounds.

      A pixel counts as artwork if it is not
      close to plain white.
    */
    const image =
      ctx.getImageData(
        0,
        0,
        merged.width,
        merged.height
      );

    const data =
      image.data;

    let minX =
      merged.width;

    let minY =
      merged.height;

    let maxX = -1;
    let maxY = -1;

    for (
      let y = 0;
      y < merged.height;
      y++
    ) {
      for (
        let x = 0;
        x < merged.width;
        x++
      ) {
        const i =
          (y * merged.width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isWhite =
          r > 246 &&
          g > 246 &&
          b > 246;

        if (!isWhite) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);

          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    /*
      No artwork found: return the original.
    */
    if (
      maxX < minX ||
      maxY < minY
    ) {
      return merged.toDataURL(
        "image/png"
      );
    }

    const artWidth =
      maxX - minX + 1;

    const artHeight =
      maxY - minY + 1;

    /*
      Give the masterpiece some white space
      around the edges instead of cropping
      directly against the drawing.
    */
    const padding =
      Math.round(
        Math.max(
          artWidth,
          artHeight
        ) * 0.10
      );

    minX =
      Math.max(
        0,
        minX - padding
      );

    minY =
      Math.max(
        0,
        minY - padding
      );

    maxX =
      Math.min(
        merged.width - 1,
        maxX + padding
      );

    maxY =
      Math.min(
        merged.height - 1,
        maxY + padding
      );

    const cropWidth =
      maxX - minX + 1;

    const cropHeight =
      maxY - minY + 1;

    const cropped =
      document.createElement(
        "canvas"
      );

    /*
      Use a pleasant landscape paper ratio.
      The artwork gets centered and enlarged
      without stretching.
    */
    cropped.width = 1200;
    cropped.height = 760;

    const cropCtx =
      cropped.getContext("2d");

    cropCtx.fillStyle =
      "#ffffff";

    cropCtx.fillRect(
      0,
      0,
      cropped.width,
      cropped.height
    );

    const availableWidth =
      cropped.width * 0.88;

    const availableHeight =
      cropped.height * 0.84;

    const scale =
      Math.min(
        availableWidth / cropWidth,
        availableHeight / cropHeight
      );

    const drawWidth =
      cropWidth * scale;

    const drawHeight =
      cropHeight * scale;

    const drawX =
      (cropped.width - drawWidth) / 2;

    const drawY =
      (cropped.height - drawHeight) / 2;

    cropCtx.drawImage(
      merged,
      minX,
      minY,
      cropWidth,
      cropHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    return cropped.toDataURL(
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

    return await this.teach(
      text,
      250
    );
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
