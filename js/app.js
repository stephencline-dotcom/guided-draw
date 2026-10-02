const homeScreen = document.querySelector(".home-screen");

document.querySelectorAll(".drawing-card").forEach((card) => {
  card.addEventListener("click", () => {
    const drawing = card.dataset.drawing;

    if (drawing === "fish") {
      openGuidedStudio("fish");
      return;
    }

    if (drawing === "flower") {
      openGuidedStudio("flower");
      return;
    }

    alert("We will build this drawing after the Fish prototype!");
  });
});

function openGuidedStudio(drawingName = "fish") {
  document.body.classList.add("studio-mode");

  homeScreen.innerHTML = `
    <section class="drawing-studio">

      <header class="studio-header">
        <div class="header-left-actions">
          <button class="back-button" id="backButton" aria-label="Go back">
            ←
          </button>

          <button
            class="skip-button"
            id="skipButton"
            type="button"
            disabled
          >
            ⏭ SKIP DIRECTIONS
          </button>
        </div>

        <div class="studio-title">
          <span class="studio-fish">${
            drawingName === "flower" ? "🌼" : "🐟"
          }</span>
          <div>
            <h1>${
              drawingName === "flower"
                ? "LET'S DRAW A FLOWER!"
                : "LET'S DRAW A FISH!"
            }</h1>
            <p id="stepText">Step 1 • Watch me draw!</p>
          </div>
        </div>

        <div class="header-actions">
          <button
            class="repeat-button"
            id="repeatButton"
            type="button"
            aria-label="Repeat directions"
            disabled
          >
            🔊 REPEAT
          </button>

          <div class="step-counter" id="stepCounter">
            1 / 6
          </div>
        </div>
      </header>

      <div class="canvas-area">

        <section class="canvas-side computer-side">
          <div class="side-label watch-label">
            <span>👀</span>
            WATCH ME
          </div>

          <div class="canvas-frame">
            <div class="computer-canvas-stack" id="computerCanvasStack">
              <canvas id="computerColorCanvas" class="computer-layer computer-color-layer"></canvas>
              <canvas id="computerCanvas" class="computer-layer computer-line-layer"></canvas>
            </div>

            <div class="canvas-message computer-message" id="computerMessage">
              <span class="message-icon">✏️</span>
              <strong>WATCH!</strong>
            </div>
          </div>
        </section>

        <div class="middle-divider">
          <div class="turn-arrow">➜</div>
        </div>

        <section class="canvas-side child-side">
          <div class="side-label your-label">
            <span>🎨</span>
            YOUR DRAWING
          </div>

          <div class="canvas-frame child-frame">
            <div class="child-canvas-stack" id="childCanvasStack">
              <canvas id="childColorCanvas" class="child-layer child-color-layer"></canvas>
              <canvas id="childCanvas" class="child-layer child-line-layer"></canvas>
            </div>

            <div class="canvas-message child-message" id="childMessage">
              <span class="message-icon">👀</span>
              <strong>WATCH FIRST!</strong>
            </div>
          </div>
        </section>

      </div>

      <footer class="drawing-toolbar">

        <div class="tool-group">
          <button class="tool-button active" data-tool="pencil">
            <span class="tool-icon">✏️</span>
            <span>PENCIL</span>
          </button>

          <button class="tool-button" data-tool="crayon">
            <span class="tool-icon">🖍️</span>
            <span>CRAYON</span>
          </button>

          <button class="tool-button" data-tool="marker">
            <span class="tool-icon">🖊️</span>
            <span>MARKER</span>
          </button>

          <button class="tool-button" data-tool="eraser">
            <span class="tool-icon">🧽</span>
            <span>ERASER</span>
          </button>

          <button
            class="undo-button"
            id="undoButton"
            type="button"
            disabled
            aria-label="Undo last mark"
          >
            <span class="tool-icon">↶</span>
            <span>UNDO</span>
          </button>

          <button class="tool-button" data-tool="bucket">
            <span class="tool-icon">🪣</span>
            <span>FILL</span>
          </button>
        </div>

        <div class="size-group" aria-label="Crayon size">
          <button class="size-button" data-size="thin">
            <span class="size-line size-line-thin"></span>
            <span>THIN</span>
          </button>

          <button class="size-button active-size" data-size="medium">
            <span class="size-line size-line-medium"></span>
            <span>MEDIUM</span>
          </button>

          <button class="size-button" data-size="thick">
            <span class="size-line size-line-thick"></span>
            <span>THICK</span>
          </button>
        </div>

        <div class="color-group" aria-label="Colors">
          <button class="color-button black active-color" data-color="#263238" aria-label="Black"></button>
          <button class="color-button red" data-color="#ef5350" aria-label="Red"></button>
          <button class="color-button orange" data-color="#ff9800" aria-label="Orange"></button>
          <button class="color-button yellow" data-color="#fdd835" aria-label="Yellow"></button>
          <button class="color-button green" data-color="#43a047" aria-label="Green"></button>
          <button class="color-button blue" data-color="#1e88e5" aria-label="Blue"></button>
          <button class="color-button purple" data-color="#8e5ac8" aria-label="Purple"></button>
          <button class="color-button pink" data-color="#ec6fa7" aria-label="Pink"></button>
        </div>

        <button class="done-button" id="doneButton" disabled>
          <span>✓</span>
          I'M DONE!
        </button>

      </footer>

    </section>
  `;

  document.getElementById("backButton").addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("repeatButton").addEventListener("click", () => {
    GuidedDraw.repeatCurrentDirections();
  });

  document.getElementById("skipButton").addEventListener("click", () => {
    GuidedDraw.skipCurrentDirections();
  });

  GuidedDraw.selectedDrawing =
    drawingName;

  setupDrawingCanvases();
}


function openBucketTestStudio() {
  document.body.classList.add("studio-mode");

  homeScreen.innerHTML = `
    <section class="drawing-studio">

      <header class="studio-header">
        <div class="header-left-actions">
          <button class="back-button" id="backButton" aria-label="Go back">
            ←
          </button>
        </div>

        <div class="studio-title">
          <span class="studio-fish">🌼</span>
          <div>
            <h1>PAINT BUCKET TEST</h1>
            <p>Draw a closed shape, then fill it!</p>
          </div>
        </div>

        <div class="step-counter">
          TEST
        </div>
      </header>

      <div class="canvas-area bucket-test-area">

        <section class="canvas-side computer-side">
          <div class="side-label watch-label">
            TRY THIS
          </div>

          <div class="canvas-frame bucket-example-frame">
            <canvas id="bucketExampleCanvas"></canvas>
          </div>
        </section>

        <div class="middle-divider">
          <div class="turn-arrow">➜</div>
        </div>

        <section class="canvas-side child-side">
          <div class="side-label your-label">
            YOUR TEST
          </div>

          <div class="canvas-frame child-frame">
            <div class="child-canvas-stack" id="childCanvasStack">
              <canvas
                id="childColorCanvas"
                class="child-layer child-color-layer"
              ></canvas>

              <canvas
                id="childCanvas"
                class="child-layer child-line-layer"
              ></canvas>
            </div>
          </div>
        </section>

      </div>

      <footer class="drawing-toolbar">

        <div class="tool-group">
          <button class="tool-button active" data-tool="pencil">
            <span class="tool-icon">✏️</span>
            <span>PENCIL</span>
          </button>

          <button class="tool-button" data-tool="crayon">
            <span class="tool-icon">🖍️</span>
            <span>CRAYON</span>
          </button>

          <button class="tool-button" data-tool="marker">
            <span class="tool-icon">🖊️</span>
            <span>MARKER</span>
          </button>

          <button class="tool-button" data-tool="eraser">
            <span class="tool-icon">🧽</span>
            <span>ERASER</span>
          </button>

          <button class="tool-button" data-tool="bucket">
            <span class="tool-icon">🪣</span>
            <span>FILL</span>
          </button>
        </div>

        <div class="size-group" aria-label="Crayon size">
          <button class="size-button" data-size="thin">
            <span class="size-line size-line-thin"></span>
            <span>THIN</span>
          </button>

          <button class="size-button active-size" data-size="medium">
            <span class="size-line size-line-medium"></span>
            <span>MEDIUM</span>
          </button>

          <button class="size-button" data-size="thick">
            <span class="size-line size-line-thick"></span>
            <span>THICK</span>
          </button>
        </div>

        <div class="color-group" aria-label="Colors">
          <button class="color-button black active-color" data-color="#263238"></button>
          <button class="color-button red" data-color="#ef5350"></button>
          <button class="color-button orange" data-color="#ff9800"></button>
          <button class="color-button yellow" data-color="#fdd835"></button>
          <button class="color-button green" data-color="#43a047"></button>
          <button class="color-button blue" data-color="#1e88e5"></button>
          <button class="color-button purple" data-color="#8e5ac8"></button>
          <button class="color-button pink" data-color="#ec6fa7"></button>
        </div>

        <button class="done-button" id="doneButton" disabled>
          <span>✓</span>
          DONE
        </button>

      </footer>

    </section>
  `;

  document.getElementById("backButton").addEventListener("click", () => {
    window.location.reload();
  });

  setupBucketTest();
}
