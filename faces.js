function setup() {
  createCanvas(640, 360);
}
function draw(){
  drawFace();

}

function drawFace() {
  background(102);
  var eyeColor = color('orange');  
  push();
  translate(width*0.5, height*0.5);
  rectMode(CENTER);
  rect(0, 0, 170, 200); 
  drawEyes();
  pop();
}

function drawEyes(){
  var eyeFns = [
    function(){
      push();
      translate(0, -30);
      fill(eyeColor);
      rect(0, 0, 130, 60); 
      pop();
    },
    function() {
      push();
      translate(0, -30);
      fill('gray');
      rect(0, 0, 130, 60); 
      pop();
    }
  ];
  eyeFn = pick(eyeFns);
  eyeFn();
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}
