"use strict";
var bgColor = 0;
var showDebug = true;
var keepLooping = true;
var blendModeNum = 1;
var monsters = [];
var foodPositions = [];
var items = [];
var player = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  restart();
}

function centre() {
  return newPos(width / 2, height / 2);
}

function restart() {
  bgColor = color(0);
  background(bgColor);
  player = new Player({
    pos: centre()
  });

  for (var i = 0; i < 2; i++) {
    foodPositions.push(randPos());
  }

  for (var k = 0; k < 10; k++) {
    items.push(randItem());
  }

  for (var j = 0; j < 10; j++) {

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

function randItem() {
  var item = pick([{
    title: 'torch',
    interactSelf: function(otherMonster) {},
    interactOther: function(otherMonster) {}
  }, {
    title: 'ball',
    interactOther: function(otherMonster) {
      console.log("playing ball with other monster");
    }
  }, {
    title: 'hat',
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
  LAST: 6
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

  var inventory = [];
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
    return dist(target.x, target.y, pos.x, pos.y);
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


  

  var changeState = function(next) {
    state = next;
    switch (state) {
      case State.SLEEPING:
      break;
      case State.ANGRY:
      break;
      case State.HAPPY:
      break;
      case State.CURIOUS:
      target = {
        pos: randPos(),
        type: TType.PLACE
      };
      break;
      case State.HUNGRY:
      break;
      case State.SCARED:
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

  var targetFood = function() {
    if (foodPositions.length > 0) {
      target = {
        pos: pick(foodPositions),
        type: TType.FOOD
      };
    }
  };

  var seekFood = function() {
    var possibleFood = foodAt(pos);
    if (possibleFood) {
      console.log("eating food");
      growTiredBy(30);
      removeFood(possibleFood);
      state = State.HAPPY;
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
        return 2.5;
      }
    };
    if (false) { //if we find an item...
      console.log("found Item");
      growBoredBy(-30);
      state = State.HAPPY;
    }

    if (dist(target.x, target.y, pos.x, pos.y) < 10) {
      target = {
        pos: newPos(randBetween(0, width), randBetween(0, height)),
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

  this.update = function() {
    switch (state) {
      case State.SLEEPING:
      fill(color(100, 200, 200));
      stateName = "Sleeping";
      movementFunction = idle;
      growTiredBy(-0.4);
      if (tiredness <= 0) {
        changeState(State.HAPPY);
      }
      break;
      case State.ANGRY:
      fill(color('red'));
      stateName = "Angry";
      movementFunction = chaseTarget;
      boredom = 0;
      growTiredBy(1);
      if (tiredness > 100) {
        changeState(State.SLEEPING);
      }
      break;
      case State.HAPPY:
      movementFunction = idle;
      stateName = "Happy";
      growTiredBy(0.1);
      growBoredBy(0.2);
      fill(color('pink'));
      if (tiredness > 60) {
        changeState(State.SLEEPING);
      }
      if (boredom > 100) {
        changeState(State.CURIOUS);
      }

      break;
      case State.CURIOUS:
      stateName = "curious";
      growTiredBy(0.2);
      growBoredBy(-0.2);
      fill(color('orange'));
      movementFunction = explore;
      if (tiredness > 70) {
        changeState(State.SLEEPING);
      }
      if (boredom < 5) {
        changeState(State.HAPPY);
      }

      break;
      case State.HUNGRY:
      stateName = "Hungry";
      movementFunction = seekFood;
      growTiredBy(0.1);
      growBoredBy(-0.1);
      fill(color(100, 100, 100, 200));
      if (tiredness > 80) {
        changeState(State.SLEEPING);
      }

      break;
      case State.SCARED:
      stateName = "Scared";
      growTiredBy(1.5);
      growBoredBy(-0.4);
      fill(color('white'));
      target = {
        pos: player.pos,
        type: TType.PLAYER
      };
      movementFunction = flee;
      if (tiredness > 130) {
        changeState(State.SLEEPING);
      }

      break;
      default:
      console.log("ERROR: default switch case reached");
    }
    var drawPowerBar = function(v, maxV, x, y, w, h, c1, c2) {
      noStroke();
      fill(lerpColor(c1, c2, map(v, 0, maxV, 0, 1)));
      var yVal = map(v, 0, maxV, 0, h);
      rect(x, y, w, yVal);
    };
    var that = this;

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
      text(target.type + " for " + that.getNickname(), p.x, p.y);
    };

    this.draw = function() {
      var w = 30;
      var h = 30;

      noStroke();
      rect(pos.x - w / 2, pos.y - h / 2, w, h);
      fill(255);
      rect(pos.x-1, pos.y-1, 2, 2);
      
      drawPowerBar(boredom, 100,
        pos.x - w / 2 - 5, pos.y - h / 2,
        2, 20, color(100), color(255));
      
      drawPowerBar(tiredness, 100,
        pos.x - w / 2 - 10, pos.y - h / 2,
        2, 20, color(50, 50, 255), color(150, 150, 255));

      fill(0);
      textSize(20);
      text(this.getNickname(), pos.x, pos.y);
      textSize(10);
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
  }
}

function mouseReleased() {}

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

function randBetween(a, b) {
  return random(b - a) + a;
}

function numberKeyTyped(n){
  console.log("number typed: " + n);
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

function randPos() {
  return newPos(randIntBetween(0, width - 30), randIntBetween(0, height - 30));
}

function draw() {
  background(bgColor);

  stroke(100);

  for (var foodPos of foodPositions) {
    noStroke();
    fill([color('red'), color('green')][foodPos.x % 2]);
    ellipse(foodPos.x, foodPos.y, 20, 20);
  }

  for (var item of items) {
    noStroke();
    fill([color('blue'), color('white'), color('gray'), color('orange')][item.pos.x % 4]);
    rect(item.pos.x, item.pos.y, 20, 20);
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
  }
}

function drawPlayer() {
  var x = player.pos.x;
  var y = player.pos.y;
  fill(color('orange'));
  ellipse(x, y, 30, 30);
}