// vars
let  eagle;

function preload(){
  eagle = loadImage("./mexican_eagle.png");
}

function setup() {
  createCanvas(600, 350);
  eagle.resize(0, 150);
}

function draw() {
  noStroke();
  
  // green
  fill(0, 104, 71);
  rect(0, 0, width/3, height);
  
  //white
  fill(255, 255, 255);
  rect(width/3, 0, width/3, height);
  
  // red
  fill(206, 17, 38);
  rect((width/3)*2, 0, width/3, height);  
  
  // center that bird!
  image(eagle, (width/2)-(eagle.width/2), (height/2)-(eagle.height/2));
}