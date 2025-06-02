function setup() {
  createCanvas(400, 400);
  
  background(66, 66, 66);
}

function draw() {
  noStroke();  
  angleMode(DEGREES);
  
  // Make it easier on me
  let center_x = width/2; // Center x-coordinate
  let center_y = height/2; // Center y-coordinate
  let x = width/3;
  let y = height/3;
  let radius = width/2; // Radius of the mouth
  
  // Background Yellow
  fill(250,250,0);
  circle(center_x, center_y, width-50);
  
  // 2 eyes, I love that smiley with non-equal eyes ;)
  fill(0);
  circle(x, y, 50);
  circle(x*2, y, 75);
  
  // and fuck it - the mouth
  fill(225,0,0);
  arc(center_x, center_y, radius, radius, 0, 180); 

}