"use strict";
var bgColor = 0;
var showDebug = false;
var keepLooping = true;
var blendModeNum = 1;
var monsters = [];
var foodPositions = [];
var items = [];
var player = [];
var screenLogList = [];

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

  return function(c){
    push();
    rectMode(CENTER);
    stroke(0);
    strokeWeight(5);
    fill(c);
    rect(0, 0, 170, 200); 
    noStroke();
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  restart({});
}

function centre() {
  return newPos(width / 2, height / 2);
}
function screenLog(msg, p){
  screenLogList.push({text: msg, whenToDie: millis() + 4000, pos: p});
}
function drawScreenLog(){
  var nextList = [];
  for (var sli in screenLogList){
    var item = screenLogList[sli];
    textSize(20);
    fill(255);
    text(item.text, item.pos.x+30, item.pos.y+30);

    text(item.text, width - 300, 100 + sli*20);
    if (millis() < item.whenToDie){
      nextList.push(item);
    }
  }
  screenLogList = nextList;
}
function dropFoodAt(p){
  foodPositions.push(p);
}
function dropFoodsAt(p, n, rad){
  for (var i = 0; i < n ; i++) {
    foodPositions.push(randPosAround(p, rad));
  }
}

function spawnFood(amountOfFoodToDrop){
  foodPositions = [];
  var foodHoardPosns = []
  for(var x = 0; x < 2; x++){
    foodHoardPosns.push(randPosAwayFromWallsBy(150));
  }

  for (var hp of foodHoardPosns){
    dropFoodsAt(hp, amountOfFoodToDrop / foodHoardPosns.length, 70);
  }
}

function restart(config) {
  var amountOfMonsters = config.monsters || 20;
  var amountOfFoodToDrop = config.food || 30;

  bgColor = color(30);
  background(bgColor);
  screenLogList = [];

  player = new Player({
    pos: centre()
  });

  spawnFood(amountOfFoodToDrop);
  items = [];
  for (var k = 0; k < 10; k++) {
    items.push(randItem());
  }

  monsters = [];
  for (var j = 0; j < amountOfMonsters; j++) {

    var monster = new Monster({
      pos: randPos(),
      target: {
        pos: newPos(width / 2, height / 2),
        type: TType.PLACE
      },
      nickname: String.fromCharCode("a".charCodeAt(0) + j)
    });
    monsters.push(monster);
  }
}
function activateFoodWand(p){
  dropFoodsAt(p, randIntBetween(7,40), 40);
}

function randItem() {
  var item = pick([
  {
    title: 'torch',
    color1: randColor(),
    color2: randColor(),
    interactSelf: function(otherMonster) {},
    interactOther: function(otherMonster) {}

  }, {
    title: 'ball',
    color1: randColor(),
    color2: randColor(),
    interactOther: function(otherMonster) {
      console.log("playing ball with other monster");
    }
  }, {
    title: 'foodWand',
    color1: color('purple'),
    color2: color('yellow'),
    interactSelf: function() {
      console.log("food wand zapped!");

    }
  }, {
    title: 'hat',
    color1: randColor(),
    color2: randColor(),
    interactSelf: function(otherMonster) {},
    interactOther: function(otherMonster) {}
  }, ]);
  item.pos = randPos();
  return item;
}

var TType = {
  PLACE: 1,
  PLAYER: 2,
  MONSTER: 3,
  FOOD: 4
};

var State = {
  SLEEPING: 1,
  ANGRY: 2,
  HAPPY: 3,
  CURIOUS: 4,
  HUNGRY: 5,
  SCARED: 6,
  DRUNK: 7,
  LAST: 7
};

function foodAt(p) {
  var possible = foodPositions.find(function(foodPos) {
    return (dist(foodPos.x, foodPos.y, p.x, p.y) < 10);
  });
  return possible;
}

function removeFood(f) {
  foodPositions.splice(foodPositions.indexOf(f), 1);
}

var Player = function(config) {
  this.pos = config.pos;
  var stepSize = 10;

  this.moveLeft = function() {
    this.pos.x -= stepSize;
  };
  this.moveRight = function() {
    this.pos.x += stepSize;

  };
  this.moveUp = function() {
    this.pos.y -= stepSize;

  };
  this.moveDown = function() {
    this.pos.y += stepSize;

  };
  this.shout = function() {
    console.log("shout!");
    for (var m of monsters) {
      m.awakenByShout(player);
    }
  };

};

function mult(pos, scalar) {
  pos.x *= scalar;
  pos.y *= scalar;
  return pos;
}

var Monster = function(config) {
  var pos = config.pos;
  var target = config.target;
  var nickname = config.nickname;
  var state = State.HAPPY;
  var stateName = "unset state name";
  var tiredness = randBetween(0, 71);
  var boredom = randBetween(0, 60);
  var hunger = randBetween(0,50);
  var faceMaker = makeFaceMaker();
  var faceColor = function() { return color('blue');};

  var inventory = [];
  var that = this;

  this.getNickname = function() {
    return nickname;
  };
  this.addItem = function(item) {
    inventory.push(item);
  };
  this.hasItem = function() {
    return inventory.length > 0;
  };
  this.debugInfo = function() {
    return {
      tiredness: tiredness,
      boredom: boredom,
      stateName: stateName,
      pos: pos,
      target: target
    };
  };
  this.getPos = function() {
    return pos;
  };

  this.getStateName = function() {
    return stateName;
  };

  
  var distToTarget = function() {
    return dist(target.pos.x, target.pos.y, pos.x, pos.y);
  };

  var movementSpeed = function() {
    return 1;
  };

  this.nextState = function() {
    var v = 1;
    if (state === State.LAST) {
      v = 1;
    } else {
      v = state + 1;
    }
    changeState(v);
  };


  var meLog = function(msg){
    screenLog(that.getNickname() + ": " + msg, pos);
  }

  var changeState = function(next) {
    state = next;
    switch (state) {
      case State.SLEEPING:
      meLog("sleeping");
      break;
      case State.ANGRY:
      meLog("grr");
      break;
      case State.HAPPY:
      meLog("happy");

      break;
      case State.CURIOUS:
      target = {
        pos: randPos(),
        type: TType.PLACE
      };
      meLog("curious");

      break;
      case State.HUNGRY:
      meLog("becomes hungry");
      chooseAFoodTarget();
      break;
      case State.SCARED:
      meLog("scared!");
      break;
      case State.DRUNK:
      growTiredBy(-40);
      meLog("drunnnk!");
      break;
      default:
      console.log("ERROR: default switch case reached");
    }

  };

  var flee = function() {
    movementSpeed = function() {
      return -6;
    };
    moveTowardsTarget();
  };
  var spin = function() {
    movementSpeed = function() {
      return 4;
    };
    //var drunkStartPos = pos;
    var rad = 30;
    var phase = (that.getNickname().charCodeAt(0)*10) + frameCount*4;
    pos.x = width/2 + rad*sin(radians(phase));
    pos.y = height/2 + rad*cos(radians(phase));
  };

  var chaseTarget = function() {
    movementSpeed = function() {
      return 5;
    };
    moveTowardsTarget();
  };

  var moveTowardsTarget = function() {
    var stepSize = movementSpeed();
    var dx = target.pos.x - pos.x;
    var dy = target.pos.y - pos.y;
    var m = mag(dx, dy);
    var vel = mult(newPos(dx / m, dy / m), stepSize);
    pos.x += vel.x;
    pos.y += vel.y;
    pos.x = constrain(pos.x, 20, width - 20);
    pos.y = constrain(pos.y, 20, height - 20);
  };

  
  var idle = function() {};

  var movementFunction = idle;

  var chooseAFoodTarget = function() {

    if (foodPositions.length > 0) {
      target = {
        pos: pick(foodPositions),
        type: TType.FOOD
      };
    }
  };
  var FoodEffect = {
    NORMAL: 1,
    ENDRUNKEN: 2,
    SICKEN: 3
  }
  var seekFood = function() {
    var foodHere = foodAt(pos);
    movementSpeed = function() { return 10;};
    if (foodHere) {
      removeFood(foodHere);
      hunger = 0;
      meLog("ate food so hunger now: "+ hunger);
      var effect = pickProb([[FoodEffect.NORMAL, 95], 
        [FoodEffect.ENDRUNKEN, 5], 
        [FoodEffect.SICKEN, 0]]);
      switch (effect) {
        case FoodEffect.NORMAL:
        growTiredBy(random()*20);
        changeState(State.HAPPY);
        break;
        case FoodEffect.ENDRUNKEN:
        meLog("DRUNK!")
        changeState(State.DRUNK);
        break;
        case FoodEffect.SICKEN:
        meLog("sickened - unimpl")
        changeState(State.HAPPY);
        break;
        default: 
        console.log("ERROR: default in switch case - food effect");
        break;
      }
    } else {
      moveTowardsTarget();
    }
  };

  this.awakenByShout = function(culprit) {
    if (state === State.SLEEPING) {
      growTiredBy(-30);
      changeState(State.ANGRY);
      target = {
        pos: culprit.pos,
        type: TType.PLAYER
      };
    }
  };



  var explore = function() {
    movementSpeed = function() {
      if (distToTarget() < 10) {
        return 0;
      } else {
        return 6;
      }
    };
    if (false) { //if we find an item...
      console.log("found Item");
      growBoredBy(-30);
      state = State.HAPPY;
    }

    if (distToTarget() < 10) {
      target = {
        pos: randPos(),
        type: TType.PLACE
      };
    }
    moveTowardsTarget();
  };

  var growTiredBy = function(amt) {
    tiredness += amt;
    if (tiredness < 0) {
      tiredness = 0;
    }
  };

  var growBoredBy = function(amt) {
    boredom += amt;
    if (boredom < 0) {
      boredom = 0;
    }
  };

  this.growHungryBy = function(amt) {
    hunger += amt;
    if (hunger < 0) {
      hunger = 0;
    }
  };

  this.update = function() {
    switch (state) {
      case State.SLEEPING:
      faceColor = function() { return color(100, 200, 200); } 
      stateName = "Sleeping";
      movementFunction = idle;
      growTiredBy(-0.4);
      that.growHungryBy(0.01);
      
      if (tiredness <= 0) {
        changeState(State.HAPPY);
      }
      if (hunger > 80) {
        changeState(State.HUNGRY);
      }
      break;
      case State.ANGRY:
      faceColor = function() { return color('red'); } 
      stateName = "Angry";
      movementFunction = chaseTarget;
      boredom = 0;
      growTiredBy(1);
      that.growHungryBy(0.09);
      if (hunger > 90) {
        changeState(State.HUNGRY);
      }
      
      if (tiredness > 100) {
        changeState(State.SLEEPING);
      }
      break;
      case State.HAPPY:
      movementFunction = idle;
      stateName = "Happy";
      growTiredBy(0.1);
      growBoredBy(0.2);
      that.growHungryBy(0.03);
      faceColor = function() { return color('pink'); } 
      if (tiredness > 60) {
        changeState(State.SLEEPING);
      }
      if (boredom > 100) {
        changeState(State.CURIOUS);
      }
      if (hunger > 50) {
        changeState(State.HUNGRY);
      }

      break;
      case State.CURIOUS:
      stateName = "curious";
      growTiredBy(0.02);
      growBoredBy(-0.2);
      that.growHungryBy(0.07);
      faceColor = function() { return color('orange'); } 
      
      movementFunction = explore;
      if (tiredness > 70) {
        changeState(State.SLEEPING);
      }
      if (boredom < 5) {
        changeState(State.HAPPY);
      }
      if (hunger > 60) {
        changeState(State.HUNGRY);
      }

      break;
      case State.HUNGRY:
      stateName = "Hungry";
      movementFunction = seekFood;
      
      if (!target || target.type !== TType.FOOD || !foodAt(target.pos)){
        chooseAFoodTarget();
      }

      growTiredBy(0.1);
      growBoredBy(-0.1);
      that.growHungryBy(0.05);
      faceColor = function() { return color(150); } 
      if (hunger < 60 && tiredness > 80) {
        changeState(State.SLEEPING);
      }
      break;
      case State.SCARED:
      stateName = "Scared";
      growTiredBy(1.5);
      growBoredBy(-0.4);
      that.growHungryBy(0.1);
      faceColor = function() { return color(255); } 
      target = {
        pos: player.pos,
        type: TType.PLAYER
      };
      movementFunction = flee;
      if (tiredness > 130) {
        changeState(State.SLEEPING);
      }
      if (hunger > 90) {
        changeState(State.HUNGRY);
      }
      break;


      case State.DRUNK:
      stateName = "Drunk";
      growTiredBy(1);
      growBoredBy(-3);
      that.growHungryBy(0.2);
      faceColor = function() { return color('yellow'); } 
      movementFunction = spin;
      if (tiredness > 80) {
        changeState(State.SLEEPING);
      }
      if (hunger > 80) {
        changeState(State.HUNGRY);
      }
      break;


      default:
      console.log("ERROR: default switch case reached");
    }
    var drawPowerBar = function(v, maxV, x, y, w, h, c1, c2) {
      var c = lerpColor(c1, c2, map(v, 0, maxV, 0, 1));
      var yVal = map(v, 0, maxV, 0, h);
      noStroke();
      fill(c);
      strokeWeight(1);
      rect(x, y, w, yVal);
      textSize(8);
      text(round(v), x,y);
    };
    
    var drawTarget = function() {
      var c = color('purple');
      switch (target.type) {
        case TType.PLACE:
        c = color('orange');
        break;
        case TType.PLAYER:
        c = color('red');
        break;
        case TType.MONSTER:
        c = color('pink');
        break;
        case TType.FOOD:
        c = color('green');
        break;
        default:
        c = color('cyan');
        console.log("ERROR: no such TType: " + target.type);
        break;
      }
      var p = target.pos;
      stroke(c);
      fill(c);
      line(p.x - 10, p.y, p.x + 10, p.y);
      line(p.x, p.y - 10, p.x, p.y + 10);
      noStroke();
      text(target.type + " for " + that.getNickname(), p.x, p.y);
    };

    this.draw = function() {
      var w = 30;
      var h = 30;

      fill(255);
      push();
      translate(pos.x, pos.y);
      scale(0.2,0.2);
      faceMaker(faceColor());
      pop();


      noStroke();
      
      fill(255);
      
      drawPowerBar(boredom, 100,
        pos.x - w / 2 - 5, pos.y - h / 2,
        3, 30, color(100), color(255));
      
      drawPowerBar(tiredness, 100,
        pos.x - w / 2 - 10, pos.y - h / 2,
        3, 30, color(50, 50, 255), color(150, 150, 255));

      drawPowerBar(hunger, 100,
        pos.x - w / 2 - 15, pos.y - h / 2,
        3, 30, color('green'), color('red'));

      noStroke();
      fill(255);
      textSize(15);
      text(this.getNickname(), pos.x+20, pos.y-20);
      textSize(15);
      fill(255);
      text(stateName, pos.x + 20, pos.y);

      drawTarget();
    };

    movementFunction();
  };//FUNCTION-END: update()
}; //FUNCTION-END: Monster


Monster.prototype.say = function(m) {
  console.log(m);
};

Monster.prototype.emote = function() {
  this.say("emoting");
};

function toggleDebug() {
  showDebug = !showDebug;
}

function togglePause() {
  keepLooping = !keepLooping;
  if (keepLooping) {
    loop();
  } else {
    noLoop();
  }
}

function mousePressed() {
  var maybe = monsters.find(function(m) {
    return dist(m.getPos().x, m.getPos().y, mouseX, mouseY) < 50;
  });
  if (typeof maybe != 'undefined') {
    maybe.nextState();
  } else {
    dropFoodAt(mousePosAsInts());
  }
}

function mousePosAsInts(){
  return newPos(floor(mouseX), floor(mouseY));
}

function mouseReleased() {}

function pickProb(arr){
  var sum = arr.reduce(function(a, b) {
    return a + b[1];
  }, 0);
  arr = arr.map(function(v){ return [v[0], v[1]/sum]; });

  var fArr = [];
  var rt = 0;

  for(var pair of arr){
    rt += pair[1];
    fArr.push([pair[0], rt]);
  }
  var rnd = random();
  for(var resAndThresh of fArr){
    if (rnd < resAndThresh[1]){
      return resAndThresh[0];
    }
  }
}

function pickIx(arr) {
  return floor(random() * arr.length);
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}

function pickOther(arr, notThisOne) {
  //TODO: handle case when array ONLY contains references to the one we don't want.  (Infinite loop.)
  var ix = arr.indexOf(notThisOne);
  if (ix === -1) {
    return arr[floor(random() * arr.length)];
  } else {
    var chosenIx = floor(random() * arr.length);
    while (chosenIx === ix) {
      chosenIx = floor(random() * arr.length);
    }
    return arr[chosenIx];
  }
}

function randColor() {
  var randomColorLibraryAvailable = true;
  if (randomColorLibraryAvailable){
  return randomColor(); // uses randomColor library.
  } else {
    if (random() > 0.5) {
      return pick([color('orange'),
        color('yellow'),
        color('red'),
        color('white'),
        color('blue'),
        color('pink'),
        color('purple'),
        ]);
    } else {
      return color(
        random(255),
        random(255),
        random(255),
        random(255));
    }
  }
}

function randBetween(a, b) {
  return random(b - a) + a;
}

function makeAllHungryBy(n) {
  for(var m of monsters){
    m.growHungryBy(n);
  }
}

function numberKeyTyped(n){
  console.log("number typed: " + n);
  restart({monsters: n});
}

function keyTyped() {
  var v = key.charCodeAt(0) - "0".charCodeAt(0);
  if (key === "s") {
    player.shout();
  } else if (key === "f") {
    //foo
  } else if (key === "z") {
    player.moveLeft();
  } else if (key === "x") {
    player.moveRight();
  } else if (key === "y") {
    player.moveUp();
  } else if (key === "g") {
    player.moveDown();
  } else if (key === "h") {
    makeAllHungryBy(50);
  } else if (key === "w") {
    activateFoodWand(mousePosAsInts());
  } else if (key === "p") {
    togglePause();
  } else if (key === "d") {
    toggleDebug();
  } else {
    numberKeyTyped(v);
  }
}

function changeBlendMode(v) {
  blendModeNum = v;
  if (v === 1) {
    blendMode(BLEND);
  } else if (v === 2) {
    blendMode(ADD);
  } else if (v === 3) {
    blendMode(DARKEST);
  } else if (v === 4) {
    blendMode(LIGHTEST);
  } else if (v === 5) {
    blendMode(DIFFERENCE);
  } else if (v === 6) {
    blendMode(EXCLUSION);
  } else if (v === 7) {
    //Don't use this with a black background
    //as it will paint nothing
    blendMode(MULTIPLY);
  } else if (v === 8) {
    blendMode(SCREEN);
  } else if (v === 9) {
    blendMode(REPLACE);
  } else if (v === 10) {
    blendMode(OVERLAY);
  } else if (v === 11) {
    blendMode(HARD_LIGHT);
  } else if (v === 12) {
    blendMode(SOFT_LIGHT);
  } else if (v === 13) {
    blendMode(DODGE);
  } else if (v === 14) {
    blendMode(BURN);
  }
}

function nextBlendMode() {
  blendModeNum = blendModeNum + 1;
  if (blendModeNum > 14) {
    blendModeNum = 1;
  }
  changeBlendMode(blendModeNum);
}

function randGray() {
  return floor(random() * 256);
}

function randIntBetween(a, b) {
  return floor(a + random() * (b - a));
}

function newPos(x, y) {
  return {
    x: x,
    y: y
  };
}

function randPosAwayFromWallsBy(margin) {
  return newPos(
    randIntBetween(margin, width - margin), 
    randIntBetween(margin, height - margin));
}

function randPos() {
  return randPosAwayFromWallsBy(50);
}

function randPosAround(ctr, rad){  
  var p = toCartesian(random(rad), random(radians(360)));
  var x = ctr.x + p.x;
  var y = ctr.y + p.y;
  return newPos(x, y);
}

function toCartesian(rad, ang) {
  var x = round(rad * cos(ang));
  var y = round(rad * sin(ang));
  return newPos(x, y);
}

function drawFood(p){
  noStroke();
  fill([color(255, 0, 0, 100), color(0,255,0,100)][(p.x+p.y) % 2]);
  ellipse(p.x, p.y, 20, 20);
}

function draw() {
  background(bgColor);

  stroke(100);

  for (var foodPos of foodPositions) {
    drawFood(foodPos);
  }

  for (var item of items) {
    noStroke();
    strokeWeight(5);
    stroke(item.color1);
    fill(item.color2);
    rect(item.pos.x, item.pos.y, 20, 40);
    //rect(item.pos.x, item.pos.y, 10, 20);
  }

  drawPlayer();

  for (var mIx in monsters) {
    var monster = monsters[mIx];
    monster.update();
    monster.draw();
  }

  if (showDebug) {
    textSize(20);
    strokeWeight(0);
    stroke(255);
    text("player: " + round(player.pos.x) + ", " + round(player.pos.y),
      600, windowHeight - 40);

    textSize(20);
    drawScreenLog();    
  }
}

function drawPlayer() {
  var x = player.pos.x;
  var y = player.pos.y;
  noStroke();
  fill(color('orange'));
  ellipse(x, y, 30, 30);
}