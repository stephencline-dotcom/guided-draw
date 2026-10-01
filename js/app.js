const homeScreen = document.querySelector(".home-screen");

document.querySelectorAll(".drawing-card").forEach((card) => {
  card.addEventListener("click", () => {
    const drawing = card.dataset.drawing;

    if (drawing === "fish") {
      openFishStudio();
      return;
    }

    alert("We will build this drawing after the Fish prototype!");
  });
});

function openFishStudio() {
  document.body.classList.add("studio-mode");

  homeScreen.innerHTML = `
    <section class="drawing-studio">

      <header class="studio-header">
        <button class="back-button" id="backButton" aria-label="Go back">
          ←
        </button>

        <div class="studio-title">
          <span class="studio-fish">🐟</span>
          <div>
            <h1>LET'S DRAW A FISH!</h1>
            <p id="stepText">Step 1 • Watch me draw!</p>
          </div>
        </div>

        <div class="step-counter" id="stepCounter">
          1 / 6
        </div>
      </header>

      <div class="canvas-area">

        <section class="canvas-side computer-side">
          <div class="side-label watch-label">
            <span>👀</span>
            WATCH ME
          </div>

          <div class="canvas-frame">
            <canvas id="computerCanvas"></canvas>

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

          <button class="tool-button" data-tool="bucket">
            <span class="tool-icon">🪣</span>
            <span>FILL</span>
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

  setupDrawingCanvases();
}
