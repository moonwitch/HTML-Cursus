// vars
let maple;

function preload(){
  maple = loadImage("https://upload.wikimedia.org/wikipedia/commons/c/c7/White_maple_leaf_symbol.png");
}

function setup() {
  createCanvas(600, 400);
}

function draw() {
  noStroke();
  background(255, 0, 0);
  
  fill(255, 255, 255);
  rect(width/4, 0, width/2, height);
  
  fill()
  image(maple, 0, 0);
}