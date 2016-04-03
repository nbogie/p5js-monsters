"use strict";
var faces = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  restart();
}

function restart() {
  setupFaces();
}

function mousePressed() {
  restart();
}

function draw(){
  background(255);
  drawFaces();
}

function drawFaces(){
  for(var face of faces){
    push();
    scale(face.sf);
    translate(face.pos.x, face.pos.y);
    fill(255);
    face.maker();
    pop();
    face.pos.x = face.pos.x + 1;

  }

}

function setupFaces(){
  faces = [];
  var attempts = 0;
  while(faces.length < 50 && attempts < 50000){
    attempts += 1;

    var x = random()*width;
    var y = random()*height;
    var sf = random()+ 0.5;

    var candidateFace = {pos: {x: x, y: y}, size: 200*sf, sf: sf};
    
    var overlap = function(f){
      var c = candidateFace;
      var d = dist(c.pos.x, c.pos.y, f.pos.x, f.pos.y);
      var spaceNeeded = (c.size + f.size);
      return (d < spaceNeeded);
    };
    
    if (faces.some(overlap)){
      //skip this one - overlapping...
    }else {
      candidateFace.maker = makeFaceMaker();
      faces.push(candidateFace);
    }
  }
  console.log(faces);
}
function mouseTargetVector(){
  var orig = {x: mouseX - width/2, 
              y: mouseY - height/2};
  var m = mag(orig.x, orig.y);
  orig.x = orig.x/m;
  orig.y = orig.y/m;
  return orig;
}

function makeFaceMaker() {
  var eyeMaker =   makeEyeMaker();
  var cheekMaker = makeCheekMaker();
  var mouthMaker = makeMouthMaker();

  return function(){
    push();
    rectMode(CENTER);
    rect(0, 0, 170, 200); 
    eyeMaker(mouseTargetVector());
    cheekMaker();
    mouthMaker();
    pop();    
  };
}

function makeMouthMaker(){
  return pick([
    function(){
      push();
      translate(0,40);
      fill(color(240));
      stroke(color(100));
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

  function drawSquareEye(c, targetVector){
    fill(255);
    stroke(0);
    rect(0,0,50, 40);
    noStroke();
    fill(color(150,200,255));
    rect(0, 0, 40, 30);       
  }
  function drawOvalEye(c, targetVector){
    fill(255);
    stroke(0);
    ellipse(0,0,30, 20);
    noStroke();
    fill(c);
    translate(targetVector.x*7,0);
    ellipse(0, 0, 20, 20);       
    fill(color(0));
    ellipse(0, 0, 10,10);       
  }
  function drawMangaEye(c, targetVector){
    
    fill(255);
    stroke(0);
    ellipse(0,0,50, 70);
    noStroke();
    fill(c);
    translate(targetVector.x*10,targetVector.y*10);
    ellipse(0, 0, 40, 40);
    fill(color(0));
    ellipse(0, 0, 20,20);       
  }

  var eyeColor = pick([cEyeGreen, cEyeBlue, cEyeBrown]);
  var eyeMaker = pick([drawMangaEye, drawOvalEye, drawSquareEye]);
  
  return pick([
    function(targetVector){      
      push();
      translate(0, -30);
      fill(color('orange'));
      rect(0, 0, 130, 60); 
      pop();
    },
    function(targetVector) {
      push();
      translate(0, -30);
      fill('black');
      rect(0, 0, 130, 60); 
      stroke(color('white'));
      line(-10,-30,60,30);
      line(-15,-30,55,30);
      pop();
    },
    function(targetVector) {
      push();
      translate(0, -40);
      push();
      translate(-30, 0);
      eyeMaker(eyeColor, targetVector);
      pop();
      push();
      translate(40, 0);
      eyeMaker(eyeColor, targetVector);
      pop();
      pop();
    }
    ]);
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}
