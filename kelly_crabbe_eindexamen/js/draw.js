// ===================================================================================
// CONFIGURATION & CONSTANTS
// ===================================================================================
// Sources used
// - P5.js documentation: https://p5js.org/reference/
// - https://www.youtube.com/watch?v=uHNgkQsHLXQ
// - https://www.youtube.com/watch?v=Aw9kMrPktfc
// - Previous course :D

const CONSTANTS = {
  STATUS_BAR_HEIGHT_PERCENT: 0.1,
  GRASS_HEIGHT: 100,
  BONUS_GAUGE_MAX: 100,
  BONUS_ACTIVATION_POINTS: 25,
  BONUS_DURATION_FRAMES: 600, // 10 seconds at 60fps
  SPACEBAR_KEYCODE: 32,
  FLOATING_SCORE_LIFESPAN: 90, // 1.5 seconds at 60fps
  FRAGMENT_LIFESPAN: 60, // 1 second at 60fps
  DUCK_FALL_SPEED: 8,
  DUCK_SCARED_MULTIPLIER: 1.1,
};

const gameModes = [
  {
    name: "Easy",
    type: "duck",
    description: "1 DUCK",
    speed: 3,
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
    speed: 5,
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
    loseScore: -350,
  },
];

// ===================================================================================
// GLOBAL STATE MANAGEMENT
// ===================================================================================

// Grouping variables into objects for better organization
const game = {
  state: "start",
  playerName: "",
  score: 0,
  startScreenMessage: "",
  justStarted: false, // Flag to prevent shooting on difficulty selection
  currentMode: null,
  isMusicPlaying: true,
  statusBarHeight: 0,
};

const ui = {
  nameInput: null,
  difficultyButtons: [],
  titleElement: null,
  instructionsElement: null,
  restartButton: null,
  newPlayerButton: null,
  muteButton: null,
  changeDifficultyButton: null,
};

const assets = {
  images: { duck_down: null, duck_left: null, duck_right: null, grass: null },
  fonts: { game: null },
  sounds: {
    shot: null,
    lost: null,
    win: null,
    duckHit: null,
    clayHit: null,
    background: null,
  },
};

const gameElements = {
  targets: [],
  floatingScores: [],
  fragments: [],
};

const bonus = {
  gauge: 0,
  ready: false,
  active: false,
  timer: 0,
};

let colors = {
  scoreGain: null,
  scoreLoss: null,
};

// ===================================================================================
// P5.JS CORE FUNCTIONS (preload, setup, draw)
// ===================================================================================

function preload() {
  const assetPath = "./assets/";
  // Load images
  assets.images.duck_down = loadImage(`${assetPath}duck_down.png`);
  assets.images.duck_left = loadImage(`${assetPath}duck_left.png`);
  assets.images.duck_right = loadImage(`${assetPath}duck_right.png`);
  assets.images.grass = loadImage(`${assetPath}grass.png`);
  // Load font
  assets.fonts.game = loadFont(`${assetPath}PressStart2P-Regular.ttf`);
  // Load sounds
  assets.sounds.shot = loadSound(`${assetPath}sounds/shot.wav`);
  assets.sounds.lost = loadSound(`${assetPath}sounds/lost.wav`);
  assets.sounds.win = loadSound(`${assetPath}sounds/win.wav`);
  assets.sounds.duckHit = loadSound(`${assetPath}sounds/duck_hit.wav`);
  assets.sounds.clayHit = loadSound(`${assetPath}sounds/clay_hit.wav`);
  assets.sounds.background = loadSound(`${assetPath}sounds/hunt.wav`);
}

function setup() {
  createCanvas(window.innerWidth, windowHeight);
  frameRate(60);

  game.statusBarHeight = height * CONSTANTS.STATUS_BAR_HEIGHT_PERCENT;

  colors.scoreGain = color(100, 255, 100);
  colors.scoreLoss = color(255, 100, 100);

  createStartUI();
}

function draw() {
  switch (game.state) {
    case "start":
      drawStartScreen();
      break;
    case "playing":
      drawGameScreen();
      break;
    case "gameOver":
      drawEndScreen("GAME OVER", colors.scoreLoss);
      break;
    case "win":
      drawEndScreen("YOU WIN!", colors.scoreGain);
      break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  game.statusBarHeight = height * CONSTANTS.STATUS_BAR_HEIGHT_PERCENT; // Recalculate on resize
  positionUI();
}

// ===================================================================================
// UI & GAME STATE FUNCTIONS
// ===================================================================================

function resetCoreGameState() {
  game.score = 0;
  gameElements.targets = [];
  gameElements.floatingScores = [];
  gameElements.fragments = [];
  resetBonusGauge();
}

function createStartUI() {
  ui.titleElement = createElement("h1", "Duck Hunt");
  ui.titleElement.addClass("game-title");

  ui.instructionsElement = createElement(
    "p",
    "Enter your name and choose a mode to begin!",
  );
  ui.instructionsElement.addClass("game-instructions");

  ui.nameInput = createInput();
  ui.nameInput.attribute("placeholder", "Enter your name");
  ui.nameInput.addClass("game-input");

  gameModes.forEach((mode) => {
    let btn = createButton(mode.description);
    btn.addClass("mode-" + mode.name);
    btn.mousePressed(() => startGame(mode));
    ui.difficultyButtons.push(btn);
  });

  ui.restartButton = createButton("Play Again");
  ui.restartButton.mousePressed(playAgain);
  ui.restartButton.hide();

  ui.changeDifficultyButton = createButton("Change Difficulty");
  ui.changeDifficultyButton.mousePressed(returnToStart);
  ui.changeDifficultyButton.hide();

  ui.newPlayerButton = createButton("New Player");
  ui.newPlayerButton.mousePressed(startAsNewPlayer);
  ui.newPlayerButton.hide();

  ui.muteButton = createButton("Mute");
  ui.muteButton.addClass("mute-button");
  ui.muteButton.mousePressed(toggleBackgroundMusic);

  positionUI();
}

function positionUI() {
  const cx = width / 2;
  const cy = height / 2;

  ui.titleElement.position(cx, height * 0.2);
  ui.instructionsElement.position(cx, height * 0.2 + 80);
  ui.nameInput.position(cx, cy - 20);

  const totalButtonWidth = 180 * gameModes.length + 10 * (gameModes.length - 1);
  let buttonX = cx - totalButtonWidth / 2;
  ui.difficultyButtons.forEach((btn) => {
    btn.position(buttonX, cy + 30);
    buttonX += 190;
  });

  if (ui.restartButton && ui.newPlayerButton && ui.changeDifficultyButton) {
    const buttonWidth = 180;
    const spacing = 20; // Reduced spacing to fit
    const totalEndButtonWidth = buttonWidth * 3 + spacing * 2;
    let startX = cx - totalEndButtonWidth / 2;

    ui.restartButton.position(startX, cy + 80);
    ui.restartButton.style("width", `${buttonWidth}px`);

    startX += buttonWidth + spacing;
    ui.newPlayerButton.position(startX, cy + 80);
    ui.newPlayerButton.style("width", `${buttonWidth}px`);

    startX += buttonWidth + spacing;
    ui.changeDifficultyButton.position(startX, cy + 80);
    ui.changeDifficultyButton.style("width", `${buttonWidth}px`);
  }
  
  if (ui.muteButton) {
    ui.muteButton.position(
      width - ui.muteButton.width - 40,
      height - game.statusBarHeight / 2 - ui.muteButton.height / 2,
    );
  }
}

function startGame(selectedMode) {
  if (game.playerName.trim() === "") game.playerName = ui.nameInput.value();
  if (game.playerName.trim() === "") {
    game.startScreenMessage = "Please enter a name to start!";
    return;
  }
  game.startScreenMessage = "";
  game.currentMode = selectedMode;
  game.state = "playing";
  game.justStarted = true;

  ui.nameInput.hide();
  ui.titleElement.hide();
  ui.instructionsElement.hide();
  ui.difficultyButtons.forEach((b) => b.hide());
  ui.restartButton.hide();
  ui.changeDifficultyButton.hide();

  for (let i = 0; i < game.currentMode.startTargets; i++) {
    spawnNewTarget();
  }

  if (game.isMusicPlaying) {
    userStartAudio().then(() => {
      if (!assets.sounds.background.isPlaying()) {
        assets.sounds.background.loop();
        assets.sounds.background.setVolume(0.2);
      }
    });
  }
}

function returnToStart() {
  resetCoreGameState();

  ui.titleElement.show();
  ui.instructionsElement.html("Choose difficulty");
  ui.instructionsElement.show();
  ui.difficultyButtons.forEach((b) => b.show());

  ui.restartButton.hide();
  ui.changeDifficultyButton.hide();
  ui.nameInput.hide();

  assets.sounds.background.stop();
  game.state = "start";
}

function startAsNewPlayer() {
  resetCoreGameState();

  ui.titleElement.show();
  ui.instructionsElement.html("Enter your name and choose a mode to begin!");
  ui.instructionsElement.show();
  ui.nameInput.show();
  ui.nameInput.value("");
  ui.difficultyButtons.forEach((b) => b.show());

  ui.restartButton.hide();
  ui.newPlayerButton.hide();
  ui.changeDifficultyButton.hide();

  game.playerName = "";
  assets.sounds.background.stop();
  game.state = "start";
}

function playAgain() {
  resetCoreGameState();

  ui.restartButton.hide();
  ui.newPlayerButton.hide();
  ui.changeDifficultyButton.hide();

  game.state = "playing";
  game.justStarted = true;

  for (let i = 0; i < game.currentMode.startTargets; i++) {
    spawnNewTarget();
  }

  if (game.isMusicPlaying) {
    if (!assets.sounds.background.isPlaying()) {
      assets.sounds.background.loop();
      assets.sounds.background.setVolume(0.2);
    }
  }
}

function checkGameState() {
  if (game.state !== "playing") return;

  if (game.score >= game.currentMode.winScore) {
    if (assets.sounds.win.isLoaded() && !assets.sounds.win.isPlaying())
      assets.sounds.win.play();
    assets.sounds.background.stop();
    game.state = "win";
    gameElements.targets = [];
    gameElements.fragments = [];
  } else if (game.score <= game.currentMode.loseScore) {
    if (assets.sounds.lost.isLoaded() && !assets.sounds.lost.isPlaying())
      assets.sounds.lost.play();
    assets.sounds.background.stop();
    game.state = "gameOver";
    gameElements.targets = [];
    gameElements.fragments = [];
  }
}

function toggleBackgroundMusic() {
  game.isMusicPlaying = !game.isMusicPlaying;
  if (game.isMusicPlaying) {
    if (game.state === "playing") {
      assets.sounds.background.loop();
      assets.sounds.background.setVolume(0.2);
    }
    ui.muteButton.html("Mute");
  } else {
    assets.sounds.background.stop();
    ui.muteButton.html("Play");
  }
}

// ===================================================================================
// DRAWING FUNCTIONS
// ===================================================================================

function drawStartScreen() {
  background("lightblue");
  // drawStatusBar();
  cursor(ARROW);

  if (game.startScreenMessage) {
    textFont(assets.fonts.game);
    textAlign(CENTER, CENTER);
    fill("darkred");
    textSize(16);
    text(game.startScreenMessage, width / 2, height / 2 + 120);
  }
}

function drawGameScreen() {
  background("deepskyblue");
  drawGrass();

  if (bonus.active) {
    bonus.timer--;
    if (bonus.timer <= 0) deactivateBonus();
  }

  handleTargets();
  handleParticles(gameElements.fragments);
  handleParticles(gameElements.floatingScores);
  drawStatusBar();
  drawCrosshair();
}

function drawEndScreen(message, color) {
  background("deepskyblue");
  drawStatusBar();
  handleParticles(gameElements.floatingScores);
  cursor(ARROW);

  fill(0, 0, 0, 150);
  rect(0, 0, width, height - game.statusBarHeight);

  textFont(assets.fonts.game);
  textAlign(CENTER, CENTER);
  fill(color);
  textSize(64);
  text(message, width / 2, (height - game.statusBarHeight) / 2);

  ui.restartButton.show();
  ui.newPlayerButton.show();
  ui.changeDifficultyButton.show();
}

function drawStatusBar() {
  fill(80, 70, 60);
  noStroke();
  rect(0, height - game.statusBarHeight, width, game.statusBarHeight);

  const labelY = height - game.statusBarHeight + 25;
  const valueY = height - game.statusBarHeight + 55;

  textFont(assets.fonts.game);
  textAlign(LEFT, CENTER);
  fill(200);
  textSize(12);
  text("PLAYER", 20, labelY);
  fill("white");
  textSize(16);
  text(game.playerName, 20, valueY);

  textAlign(LEFT, CENTER);
  fill(200);
  textSize(12);
  text("SCORE", width * 0.3, labelY);
  fill("white");
  textSize(16);
  text(game.score, width * 0.3, valueY);

  if (game.currentMode) {
    textAlign(LEFT, CENTER);
    fill(200);
    textSize(12);
    text("MODE", width * 0.5, labelY);
    fill("white");
    textSize(16);
    text(game.currentMode.name, width * 0.5, valueY);
  }

  drawBonusGauge();
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
  if (!assets.images.grass) return;
  const grassY = height - game.statusBarHeight - CONSTANTS.GRASS_HEIGHT;
  for (let x = 0; x < width; x += assets.images.grass.width) {
    image(
      assets.images.grass,
      x,
      grassY,
      assets.images.grass.width,
      CONSTANTS.GRASS_HEIGHT,
    );
  }
}

// ===================================================================================
// CORE GAME MECHANICS
// ===================================================================================

function handleTargets() {
  for (let i = gameElements.targets.length - 1; i >= 0; i--) {
    let target = gameElements.targets[i];
    target.update();
    target.display();

    if (target.isOffScreen()) {
      let penalize = false;
      let replacementCount = 1;

      if (target instanceof Duck && !target.isShot) {
        penalize = true;
        replacementCount = 2;
      }
      else if (target instanceof ClayPigeon) {
        penalize = true;
        replacementCount = 1;
      }

      if (penalize) {
        if (assets.sounds.lost.isLoaded() && !assets.sounds.lost.isPlaying()) {
          assets.sounds.lost.play();
        }
        game.score -= game.currentMode.pointsLost;
        gameElements.floatingScores.push(
          new FloatingScore(
            `-${game.currentMode.pointsLost}`,
            target.position.x,
            20,
            colors.scoreLoss,
          ),
        );
        resetBonusGauge();
      }

      for (let j = 0; j < replacementCount; j++) {
        spawnNewTarget();
      }

      gameElements.targets.splice(i, 1);
      checkGameState();
    }
  }
}

  function handleParticles(particleArray) {
  for (let i = particleArray.length - 1; i >= 0; i--) {
    let p = particleArray[i];
    p.update();
    p.display();
    if (p.lifespan < 0) particleArray.splice(i, 1);
  }
}

function spawnNewTarget() {
  if (game.state !== "playing") return;
  if (game.currentMode.type === "duck") {
    gameElements.targets.push(new Duck());
  } else if (game.currentMode.type === "clay") {
    gameElements.targets.push(new ClayPigeon());
  }
}

function drawBonusGauge() {
  const gaugeWidth = 200;
  const gaugeHeight = 20;
  const x = width * 0.7;

  const labelY = height - game.statusBarHeight + 25;
  const valueY = height - game.statusBarHeight + 55;

  textFont(assets.fonts.game);
  textAlign(LEFT, CENTER);
  fill(200);
  textSize(12);
  text("BONUS", x, labelY);

  noStroke();
  fill(50, 50, 50, 150);
  rect(x, valueY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 5);

  let fillWidth;
  if (bonus.active) {
    fill(100, 255, 100);
    fillWidth = map(
      bonus.timer,
      0,
      CONSTANTS.BONUS_DURATION_FRAMES,
      0,
      gaugeWidth,
    );
  } else if (bonus.ready) {
    let blinkAlpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
    fill(255, 255, 0, blinkAlpha);
    fillWidth = gaugeWidth;
  } else {
    fill(50, 150, 255);
    fillWidth = map(
      bonus.gauge,
      0,
      CONSTANTS.BONUS_GAUGE_MAX,
      0,
      gaugeWidth,
      true,
    );
  }

  if (fillWidth > 0) {
    rect(x, valueY - gaugeHeight / 2, fillWidth, gaugeHeight, 5);
  }

  stroke(255);
  strokeWeight(2);
  noFill();
  rect(x, valueY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 5);
}

function resetBonusGauge() {
  bonus.gauge = 0;
  bonus.ready = false;
  if (bonus.active) deactivateBonus();
}

function activateBonus() {
  if (!bonus.ready || game.state !== "playing") return;
  bonus.active = true;
  bonus.timer = CONSTANTS.BONUS_DURATION_FRAMES;
  gameElements.targets.forEach((target) => {
    target.velocity.mult(0.5);
  });
  bonus.gauge = 0;
  bonus.ready = false;
}

function deactivateBonus() {
  bonus.active = false;
  gameElements.targets.forEach((target) => {
    target.velocity.mult(2);
  });
}

// ===================================================================================
// USER INPUT
// ===================================================================================

function keyPressed() {
  if (keyCode === CONSTANTS.SPACEBAR_KEYCODE) activateBonus();
}

function mousePressed() {
  userStartAudio(); // Required for browsers to play audio on interaction

  if (game.justStarted || game.state !== "playing") {
    game.justStarted = false; // Allow shooting on next click
    return;
  }
  if (assets.sounds.shot.isLoaded()) assets.sounds.shot.play();

  // Refactored hit detection logic
  const hitTarget = findHitTarget(mouseX, mouseY);
  if (hitTarget) {
    handleHit(hitTarget);
  } else {
    handleMiss(mouseX, mouseY);
  }

  checkGameState();
}

function findHitTarget(x, y) {
  for (let i = gameElements.targets.length - 1; i >= 0; i--) {
    const target = gameElements.targets[i];
    if (target.isHit(x, y)) {
      return { target, index: i };
    }
  }
  return null;
}

function handleHit({ target, index }) {
  let pointsGained = game.currentMode.points;
  game.score += pointsGained;
  gameElements.floatingScores.push(
    new FloatingScore(
      `+${pointsGained}`,
      target.position.x,
      target.position.y,
      colors.scoreGain,
    ),
  );

  target.shoot(); // Mark the target as shot

  if (!bonus.ready && !bonus.active) {
    bonus.gauge = min(
      bonus.gauge + CONSTANTS.BONUS_ACTIVATION_POINTS,
      CONSTANTS.BONUS_GAUGE_MAX,
    );
    if (bonus.gauge >= CONSTANTS.BONUS_GAUGE_MAX) {
      bonus.ready = true;
    }
  }

  if (target instanceof ClayPigeon) {
    if (assets.sounds.clayHit.isLoaded()) assets.sounds.clayHit.play();
    for (let j = 0; j < 15; j++) {
      gameElements.fragments.push(
        new Fragment(target.position.x, target.position.y),
      );
    }
    gameElements.targets.splice(index, 1);
    spawnNewTarget();
  }
}

function handleMiss(x, y) {
  let pointsLost = game.currentMode.pointsLost;
  game.score -= pointsLost;
  gameElements.floatingScores.push(
    new FloatingScore(`-${pointsLost}`, x, y, colors.scoreLoss),
  );
  resetBonusGauge();

  // Scare any ducks that were nearby
  for (let target of gameElements.targets) {
    if (target instanceof Duck) {
      if (dist(x, y, target.position.x, target.position.y) < target.size * 2) {
        target.scare(x < target.position.x ? "right" : "left");
      }
    }
  }
}

// ===================================================================================
// GAME OBJECT CLASSES
// ===================================================================================

class Duck {
  constructor() {
    const playableHeight = height - game.statusBarHeight;
    this.position = createVector(
      random(100, width - 100),
      playableHeight - CONSTANTS.GRASS_HEIGHT,
    );
    this.size = 60;
    this.isAlive = true;
    this.isShot = false;

    let initialSpeed = game.currentMode.speed;
    if (bonus.active) {
      initialSpeed *= 0.5; // apply bonus speed reduction
    }
    this.velocity = p5.Vector.fromAngle(radians(random(210, 330))).mult(
      initialSpeed,
    );
  }

  update() {
    if (this.isShot) {
      this.velocity.set(0, CONSTANTS.DUCK_FALL_SPEED);
    } else if (this.position.x < 0 || this.position.x > width - this.size) {
      this.velocity.x *= -1;
    }
    this.position.add(this.velocity);
  }

  display() {
    let currentImage;
    if (this.isShot) {
      currentImage = assets.images.duck_down;
    } else if (this.velocity.x < 0) {
      currentImage = assets.images.duck_left;
    } else {
      currentImage = assets.images.duck_right;
    }
    image(currentImage, this.position.x, this.position.y, this.size, this.size);
  }

  isHit(x, y) {
    if (y > height - game.statusBarHeight) return false;
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
      if (assets.sounds.duckHit.isLoaded()) assets.sounds.duckHit.play();
      this.isAlive = false;
      this.isShot = true;
    }
  }

  scare(direction) {
    if (this.isShot) return;
    this.velocity.x =
      (direction === "left" ? -1 : 1) *
      abs(this.velocity.x) *
      CONSTANTS.DUCK_SCARED_MULTIPLIER;
    this.velocity.y *= 1.1;
  }

  isOffScreen() {
    const playableHeight = height - game.statusBarHeight;
    return this.position.y < -this.size || this.position.y > playableHeight;
  }
}

class ClayPigeon {
  constructor() {
    const playableHeight = height - game.statusBarHeight;
    this.position = createVector(
      random(100, width - 100),
      playableHeight - CONSTANTS.GRASS_HEIGHT,
    );
    this.size = createVector(60, 20);
    this.isAlive = true;

    let initialSpeed = game.currentMode.speed;
    if (bonus.active) {
      initialSpeed *= 0.5; // apply bonus speed reduction
    }
    this.velocity = p5.Vector.fromAngle(radians(random(210, 330))).mult(
      initialSpeed,
    );
  }

  update() {
    if (this.position.x < 0 || this.position.x > width - this.size.x) {
      this.velocity.x *= -1;
    }
    this.position.add(this.velocity);
  }

  display() {
    noStroke();
    fill(255, 87, 51);
    ellipse(this.position.x, this.position.y, this.size.x, this.size.y);
    fill(255, 150, 120);
    ellipse(
      this.position.x,
      this.position.y - 3,
      this.size.x * 0.9,
      this.size.y * 0.8,
    );
  }

  isHit(x, y) {
    if (y > height - game.statusBarHeight) return false;
    let dx = x - this.position.x;
    let dy = y - this.position.y;
    return (
      this.isAlive &&
      (dx * dx) / (((this.size.x / 2) * this.size.x) / 2) +
        (dy * dy) / (((this.size.y / 2) * this.size.y) / 2) <
        1
    );
  }

  shoot() {
    this.isAlive = false;
  }

  isOffScreen() {
    return this.position.y < -this.size.y;
  }
}

class Fragment {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(3, 8));
    this.lifespan = CONSTANTS.FRAGMENT_LIFESPAN;
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
    this.lifespan = CONSTANTS.FLOATING_SCORE_LIFESPAN;
  }

  update() {
    this.position.y -= 0.5;
    this.lifespan--;
  }

  display() {
    this.color.setAlpha(
      map(this.lifespan, 0, CONSTANTS.FLOATING_SCORE_LIFESPAN, 0, 255),
    );
    fill(this.color);
    textFont(assets.fonts.game);
    textSize(24);
    textAlign(CENTER, CENTER);
    noStroke();
    text(this.text, this.position.x, this.position.y);
  }
}
