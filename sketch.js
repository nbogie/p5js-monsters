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
    var logItem = screenLogList[sli];
    textSize(20);
    fill(255);
    text(logItem.text, logItem.pos.x+30, logItem.pos.y+30);

    text(logItem.text, width - 300, 100 + sli*20);
    if (millis() < logItem.whenToDie){
      nextList.push(logItem);
    }
  }
  screenLogList = nextList;
}


function makeFoodAt(p){
  return {pos: p, 
          c: pick([
            randomColor({hue: 'green'}), 
            randomColor({hue: 'red'}) ])
          };  
}
function dropFoodAt(p){
  foodPositions.push(makeFoodAt(p));
}
function dropFoodsAt(p, n, rad){
  for (var i = 0; i < n ; i++) {
    foodPositions.push(makeFoodAt(randPosAround(p, rad)));
  }
}

function spawnFood(amountOfFoodToDrop){
  foodPositions = [];
  var foodHoardPosns = []
  for(var x = 0; x < 2; x++){
    foodHoardPosns.push(randPosAwayFromWallsBy(150));
  }

  for (var hp of foodHoardPosns){
    dropFoodsAt(hp, floor(amountOfFoodToDrop / foodHoardPosns.length), 70);
  }
}

function restart(config) {
  var amountOfMonsters = config.monsters || 5;
  var amountOfFoodToDrop = config.food || 5;

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
  var item = pickProb([
  [{
    title: 'torch',
    color1: randColor(),
    color2: randColor(),
    interactWith: function(agent, allMonsters) {}
  }, 0.1], [{
    title: 'ball',
    color1: randColor(),
    color2: randColor(),
    interactWith: function(agent, allMonsters) {
      console.log("playing ball with self or others");
    }
  }, 0.1], [{
    title: 'whistle',
    color1: randColor(),
    color2: randColor(),
    interactWith: function(agent, allMonsters) {
      console.log("blowing whistle at all monsters!");
      for(var m of allMonsters){
        m.frighten(agent.getPos());
      }
    }
  }, 2], [{
    title: 'foodWand',
    color1: color('purple'),
    color2: color('yellow'),
    interactWith: function(agent, allMonsters) {
      console.log("food wand zapped!");
      activateFoodWand(agent.getPos());
    }
  }, 0.95], [{
    title: 'hat',
    color1: randColor(),
    color2: randColor(),
    interactWith: function(agent, allMonsters) {}
  }, 0.1] ]);
  item.pos = randPos();
  return item;
}

var TType = {
  PLACE: 1,
  PLAYER: 2,
  MONSTER: 3,
  FOOD: 4,
  ITEM: 5
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
  return thingAt(p, foodPositions);
}

function itemAt(p) {
  return thingAt(p, items);
}

function thingAt(p, list){
  var possible = list.find(function(thing) {
    return (dist(thing.pos.x, thing.pos.y, p.x, p.y) < 10);
  });
  return possible;
}


function removeFood(f) {
  removeThing(f, foodPositions);
}

function removeItem(i) {
  removeThing(i, items);
}
function removeThing(t, list){
  list.splice(list.indexOf(t), 1);
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
  
  var addItemToInventory = function(item) {
    inventory.push(item);
  };
  var dropCurrentItem = function(){
    if (that.hasItem()){
      var item = inventory[0];
      removeInventoryItem(item);
      meLog("dropping prev item: "+ item.title);
      item.pos = newPos(pos.x, pos.y); //todo: clone, don't alias.
      items.push(item);
    } 
  };
  var removeInventoryItem = function(i){
    removeThing(i, inventory);
  }

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
  
  this.frighten = function(frightenerPos){
    //TODO: consider what state we might be in before doing this!
    //rather than directly and unconditionally changing state, 
    //consider queueing a frightening event to be consumed in the stateful update loop.
    target = makePlaceTarget(frightenerPos);
    changeState(State.SCARED);
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

  var makePlaceTarget = function(p){
    return {
      pos: p,
      type: TType.PLACE
    };
  }
  
  var randomPlaceTarget = function(){
    return makePlaceTarget(randPos());
  }

  var randomItemTargetIfAvailable = function(){
    if (items.length > 0){
      var item = pick(items);
      return {
        pos: item.pos, 
        type: TType.ITEM
      };
    } else {
      return randomPlaceTarget();
    }
  }

  var makeNewRandomExploreTarget = function(){
    return pick([randomPlaceTarget, randomItemTargetIfAvailable])();
  };

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
      if (that.hasItem() && random() > 0.1){
        var item = inventory[0];
        console.log("attempting to use item on self")
        item.interactWith(that, monsters);
      }
      target = makeNewRandomExploreTarget();

      meLog("curious");

      break;
      case State.HUNGRY:
      meLog("becomes hungry");
      chooseAFoodTarget();
      break;
      case State.SCARED:
      meLog("scared!");
      dropCurrentItem();
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
        pos: pick(foodPositions).pos,
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


  var exploreFn = function() {
    movementSpeed = function() {
      if (distToTarget() < 10) {
        return 0;
      } else {
        return 6;
      }
    };
    var itemMaybe = itemAt(pos);
    if (itemMaybe) { 
      //TODO: don't always pick it up
      if (that.hasItem()){
        dropCurrentItem();
      }
      meLog("found Item: "+ itemMaybe.title);
      that.growBoredBy(-40); 
      addItemToInventory(itemMaybe);
      removeItem(itemMaybe);
    }

    if (distToTarget() < 10) {
      target = makeNewRandomExploreTarget();
    }
    moveTowardsTarget();
  };

  var growTiredBy = function(amt) {
    tiredness += amt;
    if (tiredness < 0) {
      tiredness = 0;
    }
  };

  this.growBoredBy = function(amt) {
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
      that.growBoredBy(0.2);
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
      that.growBoredBy(-0.2);
      that.growHungryBy(0.07);
      faceColor = function() { return color('orange'); } 
      
      movementFunction = exploreFn;
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
      that.growBoredBy(-0.1);
      that.growHungryBy(0.05);
      faceColor = function() { return color(150); } 
      if (hunger < 60 && tiredness > 80) {
        changeState(State.SLEEPING);
      }
      break;
      case State.SCARED:
      stateName = "Scared";
      growTiredBy(1.5);
      that.growBoredBy(-0.4);
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
      that.growBoredBy(-3);
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
        case TType.ITEM:
        c = color('cyan');
        break;
        default:
        c = color('purple');
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

      if(that.hasItem()){
      textSize(15);
      fill(255);
        text(""+inventory.map(function(i){ return i.title;}), pos.x, pos.y + 40);
      }
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
function makeAllBoredBy(n) {
  for(var m of monsters){
    m.growBoredBy(n);
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
  } else if (key === "b") {
    makeAllBoredBy(50);
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

function drawFood(food){
  noStroke();
  fill(food.c);
  ellipse(food.pos.x, food.pos.y, 10, 10);
}
function drawItem(item){
    noStroke();
    strokeWeight(3);
    stroke(255);
    fill(item.color2);
    rectMode(CENTER);
    rect(item.pos.x, item.pos.y, 16, 30);
    stroke(color('red'));
    strokeWeight(1);
    line(item.pos.x, item.pos.y-15, item.pos.x, item.pos.y+15);
    line(item.pos.x-8, item.pos.y, item.pos.x+8, item.pos.y);
    text(item.title, item.pos.x, item.pos.y+20);
}




function draw() {
  background(bgColor);

  stroke(100);

  for (var food of foodPositions) {
    drawFood(food);
  }

  drawPlayer();


  for (var mIx in monsters) {
    var monster = monsters[mIx];
    monster.update();
    monster.draw();
  }

  for (var item of items) {
    drawItem(item);
  }


  if (showDebug) {
    textSize(20);
    strokeWeight(0);
    stroke(255);
    text("player: " + round(player.pos.x) + ", " + round(player.pos.y),
      600, windowHeight - 40);
    text("items remaining: " + items.length, 600, windowHeight - 20);

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