let gridSize = 50;
let cols, rows;
let totalSquares;

let fillColor;
let mode = "row"; // 'row' or 'col'
let currentIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateGrid();
  frameRate(30);

  fillColor = getRandomColor();
  background(0);
}

function draw() {
  noStroke();
  fill(fillColor);

  if (currentIndex < totalSquares) {
    let x, y;

    if (mode === "row") {
      x = currentIndex % cols;
      y = floor(currentIndex / cols);
    } else {
      // col mode
      x = floor(currentIndex / rows);
      y = currentIndex % rows;
    }

    rect(x * gridSize, y * gridSize, gridSize, gridSize);
    currentIndex++;
  } else {
    // Switch mode and color when done
    mode = mode === "row" ? "col" : "row";
    currentIndex = 0;
    fillColor = getRandomColor();
  }

  drawGridLines();
}

function drawGridLines() {
  stroke(0);
  strokeWeight(2);

  // vertical lines
  for (let x = 0; x <= cols; x++) {
    line(x * gridSize, 0, x * gridSize, rows * gridSize);
  }

  // horizontal lines
  for (let y = 0; y <= rows; y++) {
    line(0, y * gridSize, cols * gridSize, y * gridSize);
  }
}

function getRandomColor() {
  return color(random(255), random(255), random(255));
}

function calculateGrid() {
  cols = ceil(width / gridSize);
  rows = ceil(height / gridSize);
  totalSquares = cols * rows;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateGrid();
  currentIndex = 0;
  background(0);
}
