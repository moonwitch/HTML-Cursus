function setup() {
  createCanvas(600, 400);
 
  // background(255,255,255);
}

function draw() {
  noStroke();
  
  fill(0);
  rect(0, 0, width, height/3);
  
  fill(200, 0, 0);
  rect(0, height/3, width, height/3);
  
  fill(250, 200, 0);
  rect(0,(height/3)*2, width, height);

}
