let monster = null;
let size_mon = 190; // initial size of monster
let x_mon = 0;
let x_circle, y_circle;
let r_circle = 50; // radius of circle
let fps = 140;
let dir_mon = null;
let hasCollided = false;

function preload() {
  monster = loadImage("./monster-icon.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fps);
  // random x position for monster
  x_mon = random(0, width - monster.width);
  // random dir_mon
  dir_mon = random([-1, 1]);
  // Scale monster
  monster.resize(0, size_mon); // resize monster to initial size
  // Initial circle position
  y_circle = 0 - r_circle;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  x_mon = random(0, width - monster.width);
  dir_mon = random([-1, 1]); // random dir_mon
}

function makeSmaller() {
  size_mon -= 5; // decrease size of monster
  monster.resize(0, size_mon);
}

function draw() {
  background(210);

  // vAlign Monster
  image(monster, x_mon, height / 2 - monster.height / 2);
  // Animate Monster in dir_mon
  x_mon += dir_mon;
  // check if monster is out of bounds
  if (x_mon < 0 || x_mon > width - monster.width) {
    dir_mon *= -1; // reverse dir_mon
  }

  // Draw circle
  fill(255, 0, 0, 200); // semi-transparent red
  noStroke();
  circle(x_circle, y_circle, r_circle * 2, r_circle * 2);
  x_circle = width / 2; // center circle
  y_circle += 3; // move circle down

  // Collide
  let d = dist(
    x_mon + monster.width / 2, // center of monster
    height / 2 - monster.height / 2, // center of monster
    x_circle, // center of circle
    y_circle, // center of circle
  );

  if (d < monster.height / 2 && !hasCollided) {
    makeSmaller(); // make monster smaller
    hasCollided = true; // collision detected
  }
  if (d >= 120) {
    hasCollided = false; // reset collision state
  }

  // Check if circle is out of bounds
  if (y_circle >= height + r_circle) {
    y_circle = 0 - r_circle; // reset circle to top
  }
}