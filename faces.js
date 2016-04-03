"use strict";
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function restart() {
  drawFaces();
  
}

function mousePressed() {
  restart();
}

function draw(){
  drawFaces();
}

function drawFaces(){
  background(102);
  noLoop();
  var faces = [];
  var attempts = 0;
  while(faces.length < 30 && attempts < 10000){
    attempts += 1;

    var x = random()*width;
    var y = random()*height;
    var sf = random()+ 0.5;

    var candidateFace = {pos: {x: x, y: y}, size: 200*sf};
    
    var overlap = function(f){
      var c = candidateFace;
      var d = dist(c.pos.x, c.pos.y, f.pos.x, f.pos.y);
      var spaceNeeded = (c.size + f.size);
      return (d < spaceNeeded);
    };
    
    if (faces.some(overlap)){
      //skip this one - overlapping...
    }else {
      push();
      scale(sf);
      translate(x, y);
      drawFace();
      pop();
      faces.push(candidateFace);
    }
  }

  console.log(faces);
}
function drawFace() {
  makeFaceMaker()();
}

function makeFaceMaker() {
  var eyeMaker =   makeEyeMaker();
  var cheekMaker = makeCheekMaker();
  var mouthMaker = makeMouthMaker();

  return function(){
    push();
    rectMode(CENTER);
    rect(0, 0, 170, 200); 
    eyeMaker();
    cheekMaker();
    mouthMaker();
    pop();    
  }
}

function makeMouthMaker(){
  return pick([
    function(){
      push();
      translate(0,40);
      fill(color(240));
      stroke(color(100))
      translate(60,0);      
      for(var i=0; i<5; i++){
        translate(-20,0);      
        rect(0,0,20,50);
      }
      pop();
    },
    function(){
      push();
      translate(0,40);
      fill(color(150));
      rect(0,0,30,50);
      pop();
    }

    ]);
}

function makeCheekMaker(){
  return pick([
    function(){
      push();
      noStroke();
      translate(40,40);
      fill(color(240, 180, 180, 50));
      ellipse(0,0,30,50);
      translate(-80,0);
      ellipse(0,0,30,50);
      pop();
    },
    function(){
    }
    ]);
}

function makeEyeMaker(){
  
  var cEyeGreen = color(150,255,150);
  var cEyeBlue = color(150,200, 255);
  var cEyeBrown = color(120,70, 70);

  function drawSquareEye(){
    fill(255);
    stroke(0);
    rect(0,0,50, 40);
    noStroke();
    fill(color(150,200,255));
    rect(0, 0, 40, 30);       
  }
  function drawOvalEye(c){
    fill(255);
    stroke(0);
    ellipse(0,0,30, 20);
    noStroke();
    fill(c);
    ellipse(0, 0, 20, 20);       
    fill(color(0));
    ellipse(0, 0, 10,10);       
  }
  function drawMangaEye(c){
    fill(255);
    stroke(0);
    ellipse(0,0,50, 70);
    noStroke();
    fill(c);
    translate(-10,0);
    ellipse(0, 0, 40, 40);
    fill(color(0));
    ellipse(0, 0, 20,20);       
  }

  
    return pick([
    function(){
      push();
      var eyeColor = color('orange');  
      translate(0, -30);
      fill(eyeColor);
      rect(0, 0, 130, 60); 
      pop();
    },
    function() {
      push();
      translate(0, -30);
      fill('black');
      rect(0, 0, 130, 60); 
      stroke(color('white'));
      line(-10,-30,60,30);
      line(-15,-30,55,30);
      pop();
    },
    function() {
      push();
      translate(0, -40);
      push();
      translate(-30, 0);
      drawSquareEye();
      pop();
      push();
      translate(40, 0);
      drawSquareEye();
      pop();
      pop();
    },
    function() {
      push();
      translate(0, -40);
      push();
      translate(-30, 0);
      drawOvalEye(cEyeGreen);
      pop();
      push();
      translate(40, 0);
      drawOvalEye(cEyeGreen);
      pop();
      pop();
    },
    function() {
      push();
      translate(0, -40);
      push();
      translate(-30, 0);
      drawMangaEye(cEyeBlue);
      pop();
      push();
      translate(40, 0);
      drawMangaEye(cEyeBlue);
      pop();
      pop();
    }

    ]);
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}
