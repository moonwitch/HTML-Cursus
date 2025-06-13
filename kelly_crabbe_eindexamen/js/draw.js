// ===================================================================================
// GLOBAL VARIABLES & SETUP
// ===================================================================================

// Game State & Player Info
let gameState;
let playerName = "";
let score = 0;
let startScreenMessage = "";
let gameJustStarted = false; // Flag to prevent shooting on difficulty selection

// Game Modes
const gameModes = [
  {
    name: "Easy",
    type: "duck",
    description: "1 DUCK",
    speed: 2,
    points: 25,
    pointsLost: 10,
    startTargets: 1,
    winScore: 500,
    loseScore: -100,
  },
  {
    name: "Normal",
    type: "duck",
    description: "2 DUCKS",
    speed: 4,
    points: 50,
    pointsLost: 20,
    startTargets: 2,
    winScore: 750,
    loseScore: -200,
  },
  {
    name: "Hard",
    type: "clay",
    description: "CLAY SHOOTING",
    speed: 5,
    points: 100,
    pointsLost: 50,
    startTargets: 1,
    winScore: 500,
    loseScore: -250,
  },
];
let currentGameMode;

// UI Elements
let nameInput;
let difficultyButtons = [];
let titleElement, instructionsElement, restartButton;

// Game Objects
let targets = [];
let floatingScores = [];
let fragments = [];

// Bonus Gauge
let bonusGauge = 0;
const BONUS_GAUGE_MAX = 100;
let bonusReady = false;
let isBonusActive = false;
let bonusTimer = 0;

// Game Assets
let duck_down, duck_left, duck_right, gameFont, grass;
let shotSound, lostSound, winSound, duckHit, clayHit;
let scoreGainColor, scoreLossColor;

const GRASS_HEIGHT = 100;

// ===================================================================================
// P5.JS CORE FUNCTIONS
// ===================================================================================

function preload() {
  const assetPath = "./assets/";
  duck_down = loadImage(`${assetPath}duck_down.png`);
  duck_left = loadImage(`${assetPath}duck_left.png`);
  duck_right = loadImage(`${assetPath}duck_right.png`);
  grass = loadImage(`${assetPath}grass.png`);
  gameFont = loadFont(`${assetPath}PressStart2P-Regular.ttf`);
  shotSound = loadSound(`${assetPath}sounds/shot.wav`);
  lostSound = loadSound(`${assetPath}sounds/lost.wav`);
  winSound = loadSound(`${assetPath}sounds/win.wav`);
  duckHit = loadSound(`${assetPath}sounds/duck_hit.wav`);
  clayHit = loadSound(`${assetPath}sounds/clay_hit.wav`);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gameState = "start";
  scoreGainColor = color(100, 255, 100);
  scoreLossColor = color(255, 100, 100);
  createStartUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
}

function draw() {
  switch (gameState) {
    case "start":
      drawStartScreen();
      break;
    case "playing":
      drawGameScreen();
      break;
    case "gameOver":
      drawEndScreen("GAME OVER", scoreLossColor);
      break;
    case "win":
      drawEndScreen("YOU WIN!", scoreGainColor);
      break;
  }
}

// ===================================================================================
// UI & GAME STATE FUNCTIONS
// ===================================================================================

function createStartUI() {
  titleElement = createElement("h1", "Duck Hunt");
  titleElement.addClass("game-title");

  instructionsElement = createElement(
    "p",
    "Enter your name and choose a mode to begin!",
  );
  instructionsElement.addClass("game-instructions");

  nameInput = createInput();
  nameInput.attribute("placeholder", "Enter your name");
  nameInput.addClass("game-input");

  gameModes.forEach((mode) => {
    let btn = createButton(mode.description);
    btn.addClass("game-button");
    btn.mousePressed(() => startGame(mode));
    difficultyButtons.push(btn);
  });

  restartButton = createButton("Play Again");
  restartButton.addClass("game-button");
  restartButton.mousePressed(resetGame);
  restartButton.hide();

  positionUI();
}

function positionUI() {
  titleElement.position(width / 2, height / 3 - 50);
  instructionsElement.position(width / 2, height / 3 + 40);
  nameInput.position(width / 2, height / 2);

  const totalButtonWidth = 180 * gameModes.length + 10 * (gameModes.length - 1);
  let buttonX = width / 2 - totalButtonWidth / 2;
  difficultyButtons.forEach((btn) => {
    btn.position(buttonX, height / 2 + 70);
    buttonX += 190;
  });

  if (restartButton) {
    restartButton.position(
      width / 2 - restartButton.width / 2,
      height / 2 + 50,
    );
  }
}

function startGame(selectedMode) {
  playerName = nameInput.value();
  if (playerName.trim() === "") {
    startScreenMessage = "Please enter a name to start!";
    return;
  }

  currentGameMode = selectedMode;
  gameState = "playing";
  gameJustStarted = true; // Set flag to prevent immediate shot

  nameInput.hide();
  titleElement.hide();
  instructionsElement.hide();
  difficultyButtons.forEach((b) => b.hide());

  for (let i = 0; i < currentGameMode.startTargets; i++) {
    spawnNewTarget();
  }
}

function resetGame() {
  score = 0;
  targets = [];
  floatingScores = [];
  fragments = [];
  resetBonusGauge();

  titleElement.show();
  instructionsElement.show();
  nameInput.show();
  difficultyButtons.forEach((b) => b.show());

  restartButton.hide();

  gameState = "start";
}

function checkGameState() {
  if (gameState !== "playing") return;

  if (score >= currentGameMode.winScore) {
    if (winSound.isLoaded() && !winSound.isPlaying()) {
      winSound.play();
    }
    gameState = "win";
    targets = [];
    fragments = [];
  } else if (score <= currentGameMode.loseScore) {
    if (lostSound.isLoaded() && !lostSound.isPlaying()) {
      lostSound.play();
    }
    gameState = "gameOver";
    targets = [];
    fragments = [];
  }
}

// ===================================================================================
// DRAWING FUNCTIONS
// ===================================================================================

function drawStartScreen() {
  background("lightblue");
  cursor("pointer");
  drawGrass();
  if (startScreenMessage) {
    textFont(gameFont);
    textAlign(CENTER, CENTER);
    fill("darkred");
    textSize(16);
    text(startScreenMessage, width / 2, height / 2 + 150);
  }
}

function drawGameScreen() {
  background("deepskyblue");
  drawGrass();

  if (isBonusActive) {
    bonusTimer--;
    if (bonusTimer <= 0) {
      deactivateBonus();
    }
  }

  handleTargets();
  handleParticles(fragments);
  handleParticles(floatingScores);
  drawGameUI();
  drawBonusGauge();
  drawCrosshair();
}

function drawEndScreen(message, color) {
  background("deepskyblue");
  drawGrass();
  drawGameUI();
  cursor();
  handleParticles(floatingScores);

  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  textFont(gameFont);
  textAlign(CENTER, CENTER);
  fill(color);
  textSize(64);
  text(message, width / 2, height / 2 - 50);

  restartButton.show();
}

function drawGameUI() {
  textFont(gameFont);
  textAlign(LEFT, CENTER);

  const boxMargin = 20;
  const boxWidth = 350;
  const boxHeight = 120;
  const boxX = boxMargin;
  const boxY = height - GRASS_HEIGHT - boxHeight - boxMargin;

  noStroke();
  fill(0, 0, 0, 100);
  rect(boxX, boxY, boxWidth, boxHeight, 15);

  const textPadding = 20;
  const textX = boxX + textPadding;
  const textY = boxY + textPadding;
  const lineHeight = 30;

  fill("white");
  textSize(16);
  text(`Player: ${playerName}`, textX, textY);
  text(`Score: ${score}`, textX, textY + lineHeight);
  text(`Mode: ${currentGameMode.name}`, textX, textY + lineHeight * 2);
}

function drawCrosshair() {
  noCursor();
  stroke(255);
  strokeWeight(2);
  noFill();
  ellipse(mouseX, mouseY, 30, 30);
  line(mouseX - 20, mouseY, mouseX + 20, mouseY);
  line(mouseX, mouseY - 20, mouseX, mouseY + 20);
}

function drawGrass() {
  if (!grass) return;
  for (let x = 0; x < width; x += grass.width) {
    image(grass, x, height - GRASS_HEIGHT, grass.width, GRASS_HEIGHT);
  }
}

// ===================================================================================
// CORE GAME MECHANICS
// ===================================================================================

function handleTargets() {
  for (let i = targets.length - 1; i >= 0; i--) {
    let target = targets[i];
    target.update();
    target.display();

    if (target.isOffScreen()) {
      if (target instanceof Duck && !target.isShot) {
        if (lostSound.isLoaded() && !lostSound.isPlaying()) lostSound.play();
        score -= currentGameMode.pointsLost;
        checkGameState(); // Check for loss after score change
        floatingScores.push(
          new FloatingScore(
            `-${currentGameMode.pointsLost}`,
            target.position.x,
            20,
            scoreLossColor,
          ),
        );
        spawnNewTarget();
        spawnNewTarget();
        resetBonusGauge();
      } else {
        spawnNewTarget();
      }
      targets.splice(i, 1);
    }
  }
}

function handleParticles(particleArray) {
  for (let i = particleArray.length - 1; i >= 0; i--) {
    let p = particleArray[i];
    p.update();
    p.display();
    if (p.lifespan < 0) {
      particleArray.splice(i, 1);
    }
  }
}

function spawnNewTarget() {
  if (gameState !== "playing") return;
  if (currentGameMode.type === "duck") {
    targets.push(new Duck());
  } else if (currentGameMode.type === "clay") {
    targets.push(new ClayPigeon());
  }
}

function drawBonusGauge() {
  const gaugeWidth = 200;
  const gaugeHeight = 20;
  const x = width - gaugeWidth - 20;
  const y = height - GRASS_HEIGHT - gaugeHeight - 20;

  noStroke();
  fill(50, 50, 50, 150);
  rect(x, y, gaugeWidth, gaugeHeight, 5);

  const fillWidth = map(bonusGauge, 0, BONUS_GAUGE_MAX, 0, gaugeWidth, true);

  if (isBonusActive) {
    fill(100, 255, 100); // Green while active
  } else if (bonusReady) {
    let blinkAlpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
    fill(255, 255, 0, blinkAlpha);
  } else {
    fill(50, 150, 255);
  }
  rect(x, y, fillWidth, gaugeHeight, 5);

  stroke(255);
  strokeWeight(2);
  noFill();
  rect(x, y, gaugeWidth, gaugeHeight, 5);
}

function resetBonusGauge() {
  bonusGauge = 0;
  bonusReady = false;
  if (isBonusActive) {
    deactivateBonus();
  }
}

function activateBonus() {
  if (!bonusReady || gameState !== "playing") return;

  isBonusActive = true;
  bonusTimer = 600; // 10 seconds at 60fps

  targets.forEach((target) => {
    if (target instanceof Duck) {
      target.velocity.mult(0.5);
    }
  });

  bonusGauge = 0;
  bonusReady = false;
}

function deactivateBonus() {
  isBonusActive = false;
  targets.forEach((target) => {
    if (target instanceof Duck) {
      target.velocity.mult(2);
    }
  });
}

// ===================================================================================
// USER INPUT
// ===================================================================================

function keyPressed() {
  if (keyCode === 32) {
    // Spacebar
    activateBonus();
  }
}

function mousePressed() {
  // Consume the first click after starting a game
  if (gameJustStarted) {
    gameJustStarted = false;
    return;
  }

  if (gameState !== "playing") return;

  if (shotSound.isLoaded()) shotSound.play();

  let aTargetWasHit = false;
  for (let i = targets.length - 1; i >= 0; i--) {
    let target = targets[i];
    if (target.isHit(mouseX, mouseY)) {
      aTargetWasHit = true;
      let pointsGained = currentGameMode.points;
      floatingScores.push(
        new FloatingScore(
          `+${pointsGained}`,
          target.position.x,
          target.position.y,
          scoreGainColor,
        ),
      );
      target.shoot();
      score += pointsGained;

      if (!bonusReady && !isBonusActive) {
        bonusGauge += 25;
        if (bonusGauge >= BONUS_GAUGE_MAX) {
          bonusGauge = BONUS_GAUGE_MAX;
          bonusReady = true;
        }
      }

      if (target instanceof ClayPigeon) {
        if (clayHit.isLoaded()) clayHit.play();
        for (let j = 0; j < 15; j++) {
          fragments.push(new Fragment(target.position.x, target.position.y));
        }
        targets.splice(i, 1);
        spawnNewTarget(); // <<< Launch a new pigeon!
      }
      break;
    }
  }

  if (!aTargetWasHit) {
    let pointsLost = currentGameMode.pointsLost;
    score -= pointsLost;
    floatingScores.push(
      new FloatingScore(`-${pointsLost}`, mouseX, mouseY, scoreLossColor),
    );
    resetBonusGauge();

    for (let target of targets) {
      if (target instanceof Duck) {
        if (
          dist(mouseX, mouseY, target.position.x, target.position.y) <
          target.size * 2
        ) {
          target.scare(mouseX < target.position.x ? "right" : "left");
        }
      }
    }
  }

  checkGameState(); // Check for win/loss after every action
}

// ===================================================================================
// GAME OBJECT CLASSES
// ===================================================================================

class Duck {
  constructor() {
    this.position = createVector(
      random(100, width - 100),
      height - GRASS_HEIGHT - 10,
    );
    this.size = 60;
    this.isAlive = true;
    this.isShot = false;
    this.velocity = p5.Vector.fromAngle(radians(random(210, 330))).mult(
      currentGameMode.speed,
    );
  }

  update() {
    if (this.isShot) {
      this.velocity.set(0, 8); // Fall down when shot
    } else if (this.position.x < 0 || this.position.x > width - this.size) {
      this.velocity.x *= -1; // Bounce off screen edges
    }
    this.position.add(this.velocity);
  }

  display() {
    let currentImage = this.isShot
      ? duck_down
      : this.velocity.x < 0
      ? duck_left
      : duck_right;
    image(currentImage, this.position.x, this.position.y, this.size, this.size);
  }

  isHit(x, y) {
    return (
      this.isAlive &&
      dist(
        x,
        y,
        this.position.x + this.size / 2,
        this.position.y + this.size / 2,
      ) <
        this.size / 2
    );
  }

  shoot() {
    if (this.isAlive) {
      if (duckHit.isLoaded()) duckHit.play();
      this.isAlive = false;
      this.isShot = true;
    }
  }

  scare(direction) {
    if (this.isShot) return;
    this.velocity.x = (direction === "left" ? -1 : 1) * abs(this.velocity.x);
  }

  isOffScreen() {
    // A duck is only "off-screen" if it flies away at the top, or falls off the bottom
    return this.position.y < -this.size || this.position.y > height;
  }
}

class ClayPigeon {
  constructor() {
    this.size = createVector(60, 20);
    this.isAlive = true;
    this.gravity = 0.2;
    let speedX, speedY;

    const spawnEdge = floor(random(3));

    if (spawnEdge === 0) {
      // From bottom
      this.position = createVector(random(width / 4, (width * 3) / 4), height);
      speedX =
        currentGameMode.speed * random(0.8, 1.2) * (random() < 0.5 ? 1 : -1);
      speedY = -currentGameMode.speed * 3.5; // Increased for more height
    } else if (spawnEdge === 1) {
      // From left
      this.position = createVector(
        -this.size.x,
        random(height * 0.4, height - GRASS_HEIGHT),
      );
      speedX = currentGameMode.speed * random(0.8, 1.2);
      speedY = -currentGameMode.speed * random(2.5, 3); // Increased for more height
    } else {
      // From right
      this.position = createVector(
        width + this.size.x,
        random(height * 0.4, height - GRASS_HEIGHT),
      );
      speedX = -currentGameMode.speed * random(0.8, 1.2);
      speedY = -currentGameMode.speed * random(2.5, 3); // Increased for more height
    }
    this.velocity = createVector(speedX, speedY);
  }

  update() {
    this.velocity.y += this.gravity;
    this.position.add(this.velocity);
  }

  display() {
    noStroke();
    fill(255, 87, 51); // Darker orange
    ellipse(this.position.x, this.position.y, this.size.x, this.size.y);
    fill(255, 150, 120); // Lighter highlight
    ellipse(
      this.position.x,
      this.position.y - 3,
      this.size.x * 0.9,
      this.size.y * 0.8,
    );
  }

  isHit(x, y) {
    return (
      this.isAlive &&
      x > this.position.x - this.size.x / 2 &&
      x < this.position.x + this.size.x / 2 &&
      y > this.position.y - this.size.y / 2 &&
      y < this.position.y + this.size.y / 2
    );
  }
  shoot() {
    this.isAlive = false;
  }
  isOffScreen() {
    return (
      this.position.y > height + this.size.y ||
      this.position.x < -this.size.x ||
      this.position.x > width + this.size.x
    );
  }
}

class Fragment {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(3, 8));
    this.lifespan = 60; // 1 second at 60fps
    this.gravity = 0.2;
  }
  update() {
    this.velocity.y += this.gravity;
    this.position.add(this.velocity);
    this.lifespan--;
  }
  display() {
    noStroke();
    fill(255, 87, 51, this.lifespan * 4);
    rect(this.position.x, this.position.y, 5, 5);
  }
}

class FloatingScore {
  constructor(text, x, y, p5color) {
    this.position = createVector(x, y);
    this.text = text;
    this.color = p5color;
    this.lifespan = 90; // 1.5 seconds at 60fps
  }
  update() {
    this.position.y -= 0.5;
    this.lifespan--;
  }
  display() {
    this.color.setAlpha(map(this.lifespan, 0, 90, 0, 255));
    fill(this.color);
    textFont(gameFont);
    textSize(24);
    textAlign(CENTER, CENTER);
    noStroke();
    text(this.text, this.position.x, this.position.y);
  }
}
