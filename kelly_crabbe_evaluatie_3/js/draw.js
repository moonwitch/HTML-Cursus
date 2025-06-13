let astronautImage; // Will be loaded in preload

// Preload function to ensure the image is loaded before setup
function preload() {
  astronautImage = loadImage('img/astronaut.png');
}

let stars = [];
const maxStars = 100; // Maximum number of stars to display

let color1, color2;
let blackHoleSize; // Size of the black hole
let blackHoleGlowSize; // Size of the glow effect

let astronauts = [];
const minAstronautSize = 20; // Minimum size of the astronaut image
const maxAstronautSize = 160; // Maximum size of the astronaut image
const astronautSpeed = 2; // Speed at which astronauts move towards the black hole

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Set black hole size proportional to the screen size
  blackHoleSize = min(width, height) * 0.25;
  blackHoleGlowSize = blackHoleSize * 1.5;

  // Initialize stars
  for (let i = 0; i < maxStars; i++) {
    createStar();
  }

  // Create the first astronaut
  createAstronaut();
}

function draw() {
  drawGradientBackground();
  updateStars();
  displayStars();
  drawBlackHole();
  updateAndDisplayAstronauts();
}

function createStar() {
  // Create a new star with random properties - this should be a class/object :D But meh
  stars.push({
    x: random(width),
    y: random(height),
    size: random(1, 10),
    opacity: random(50, 255),
    twinkleSpeed: random(0.02, 0.05),
    twinkleOffset: random(0, TWO_PI),
  });
}

function updateStars() {
  // Small chance to replace a star - completely AI requested
  if (random() < 0.01) {
    let indexToReplace = floor(random(stars.length));
    stars[indexToReplace] = {
      x: random(width),
      y: random(height),
      size: random(1, 10),
      opacity: random(50, 255),
      twinkleSpeed: random(0.02, 0.05),
      twinkleOffset: random(0, TWO_PI),
    };
  }

  // Update star opacity for twinkling effect and randomly reposition stars
  for (let star of stars) {
    // If star doesn't have direction property, initialize it
    if (star.direction === undefined) {
      star.direction = 1; // 1 = getting brighter, -1 = getting dimmer
      star.fadeSpeed = random(1, 3); // How fast the star fades in/out
    }
    
    // Update opacity based on direction
    star.opacity += star.direction * star.fadeSpeed;
    
    // Reverse direction when reaching min/max opacity
    if (star.opacity >= 255) {
      star.opacity = 255;
      star.direction = -1;
    } else if (star.opacity <= 50) {
      star.opacity = 50;
      star.direction = 1;
      
      // When star reaches minimum brightness, chance to reposition it
      if (random() < 0.5) { // 50% chance to reposition when dimmest
        star.x = random(width);
        star.y = random(height);
        star.size = random(1, 10);
      }
    }
  }
}

function displayStars() {
  noStroke();
  for (let star of stars) {
    fill(255, 255, 255, star.opacity);
    ellipse(star.x, star.y, star.size, star.size);
  }
}

function drawGradientBackground() {
  // Gradient; source https://editor.p5js.org/evebdn/sketches/O9G35ueZv
  color1 = color(10, 52, 99);
  color2 = color(7, 22, 48);

  for (let y = 0; y < height; y++) {
    n = map(y, 0, height, 0, 1);
    let newc = lerpColor(color1, color2, n);
    stroke(newc);
    line(0, y, width, y);
  }
}

function drawBlackHole() {
  // Center position
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw glow effect
  noFill();
  for (let i = blackHoleGlowSize; i >= blackHoleSize; i -= 2) {
    const alpha = map(i, blackHoleSize, blackHoleGlowSize, 60, 0);
    stroke(30, 0, 60, alpha);
    strokeWeight(2);
    ellipse(centerX, centerY, i, i);
  }
  
  // Draw black hole
  noStroke();
  fill(0, 0, 0);
  ellipse(centerX, centerY, blackHoleSize, blackHoleSize);
  
  // Optional: Add an accretion disk effect
  noFill();
  stroke(100, 50, 200, 40); // Purple-ish glow
  strokeWeight(3);
  ellipse(centerX, centerY, blackHoleSize * 0.8, blackHoleSize * 0.4); // Elliptical ring
}

function createAstronaut() {
  // Add a new astronaut to the array with random starting position outside the canvas,
  // a random size, and a random rotation.
  console.log("Creating new astronaut");
  const currentAstronautSize = random(minAstronautSize, maxAstronautSize);
  
  // Determine which side the astronaut will come from (0=top, 1=right, 2=bottom, 3=left)
  let side = floor(random(4));
  let x, y;
  
  // Set initial position based on the chosen side (outside the viewport)
  switch(side) {
    case 0: // Top
      x = random(width);
      y = -currentAstronautSize; // Ensure it's fully off-screen
      break;
    case 1: // Right
      x = width + currentAstronautSize; // Ensure it's fully off-screen
      y = random(height);
      break;
    case 2: // Bottom
      x = random(width);
      y = height + currentAstronautSize; // Ensure it's fully off-screen
      break;
    case 3: // Left
      x = -currentAstronautSize; // Ensure it's fully off-screen
      y = random(height);
      break;
  }
  
  // Create new astronaut object
  astronauts.push({
    x: x,
    y: y,
    size: currentAstronautSize,
    rotation: random(TWO_PI), // Random initial rotation
    rotationSpeed: random(-0.05, 0.05) // Slow rotation as they move
  });
}

function updateAndDisplayAstronauts() {
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = astronauts.length - 1; i >= 0; i--) {
    let astro = astronauts[i];

    // Move astronaut towards the black hole (center)
    let directionX = centerX - astro.x;
    let directionY = centerY - astro.y;
    let distanceToCenter = dist(astro.x, astro.y, centerX, centerY);

    if (distanceToCenter > 0) { // Avoid division by zero if already at center
      astro.x += (directionX / distanceToCenter) * astronautSpeed;
      astro.y += (directionY / distanceToCenter) * astronautSpeed;
    }

    // Update rotation
    astro.rotation += astro.rotationSpeed;

    // Check if astronaut is inside the black hole
    // Considered "in" if its center is within the black hole's radius
    if (distanceToCenter < blackHoleSize / 2) {
      astronauts.splice(i, 1); // Remove the astronaut
      createAstronaut();       // Create a new one immediately
      continue;                // Skip drawing this removed astronaut
    }

    // Display astronaut
    push();
    translate(astro.x, astro.y);
    rotate(astro.rotation);
    imageMode(CENTER);
    image(astronautImage, 0, 0, astro.size, astro.size);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update black hole size based on new dimensions
  blackHoleSize = min(width, height) * 0.15;
  blackHoleGlowSize = blackHoleSize * 1.5;
  
  // Reposition stars when window is resized
  for (let star of stars) {
    star.x = random(width);
    star.y = random(height);
  }
}
