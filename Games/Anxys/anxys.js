//console.clear();
/////////////////////////////////////////////////
/*
    
 to do:

 known bugs: 
 

 */
////////////////////////////////////////////////////
const DEBUG = {
  FRAME: 0,
  INF_LIVES: true,
  INF_LAMPS: true,
  FPS: true,
  GRID: true,
  COORD: true,
  GOD: false,
};

const INI = {
  titleHeight: 120,
  bottomHeight: 40,
  HERO_SPEED: 6,
  MINI_PIX: 5,
  LASER_SPEED_MIN: 600,
  LASER_SPEED_MAX: 1200,
  LASER_GRID_LENGTH: 5,
  LASER_LENGTH: this.LASER_GRID_LENGTH * ENGINE.INI.GRIDPIX,
  LASER_START: 12,
  MAX_ENEMIES: 12,
  MAX_FORESIGHT: 4,
  SPAWN_DELAY: 2500,
  ENEMY_VISIBILITY_TOLERANCE: 3,
  PATH_ROUNDS: 50,
  PATH_TOLERANCE: 9,
  DEATH_TIMEOUT: 3000,
  LAMP_BONUS: 2000,
  TIME_BONUS: 250,
  LAST_LEVEL: 10
};

const PRG = {
  VERSION: "1.05.01",
  NAME: "Anxys",
  YEAR: "2018",
  CSS: "color: #239AFF;",
  INIT() {
    console.log("%c**************************************************************************************************************************************", PRG.CSS);
    console.log(`${PRG.NAME} ${PRG.VERSION} by Lovro Selic, (c) LaughingSkull ${PRG.YEAR} on ${navigator.userAgent}`);
    console.log("%c**************************************************************************************************************************************", PRG.CSS);
    $("#title").html(PRG.NAME);
    $("#version").html(`${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> LaughingSkull ${PRG.YEAR}`);
    $("input#toggleAbout").val("About " + PRG.NAME);
    $("#about fieldset legend").append(" " + PRG.NAME + " ");

    ENGINE.autostart = true;
    ENGINE.start = PRG.start;
    ENGINE.readyCall = GAME.setup;
    ENGINE.verbose = true;
    ENGINE.init();

  },
  setup() {
    $("#engine_version").html(ENGINE.VERSION);
    $("#grid_version").html(GRID.VERSION);
    $("#iam_version").html(IndexArrayManagers.VERSION);
    $("#lib_version").html(LIB.VERSION);

    $("#toggleHelp").click(function () {
      $("#help").toggle(400);
    });
    $("#toggleAbout").click(function () {
      $("#about").toggle(400);
    });
    $("#toggleVersion").click(function () {
      $("#debug").toggle(400);
    });

    ENGINE.gameWIDTH = 960;
    ENGINE.gameHEIGHT = 576;
    ENGINE.titleHEIGHT = INI.titleHeight;
    ENGINE.bottomHEIGHT = INI.bottomHeight;

    $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);
    ENGINE.addBOX("TITLE", ENGINE.gameWIDTH, ENGINE.titleHEIGHT, ["title", "minimap", "key", "score", "time"]);
    ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["background", "static", "hero", "deadhero", "animation", "enemy", "laser", "explosion", "text", "dyntext", "FPS", "button"]);
    ENGINE.addBOX("DOWN", ENGINE.gameWIDTH, ENGINE.bottomHEIGHT, ["bottom", "lives", "lamp", "bottomText"]);
    ENGINE.addBOX("LEVEL", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["floor", "wall", "nest", "template_static", "grid", "coord"]);

    //$("#LEVEL").addClass("hidden");
  },
  start() {
    console.log(PRG.NAME + " started.");

    $("#startGame").addClass("hidden");
    $(document).keypress(function (event) {
      if (event.which === 32 || event.which === 13) {
        event.preventDefault();
      }
    });


    //
    //GAME.start();
    TITLE.startTitle();
  }
};

/** classes */

class GeneralDestruction {
  constructor(point, assetstring) {
    this.point = point;
    this.layer = 'explosion';
    this.movable = true;
    this.actor = new ACTOR(assetstring, point.x, point.y, "linear", ASSET[assetstring]);
    ENGINE.VIEWPORT.alignTo(this.actor);

  }
  draw() {
    ENGINE.spriteDraw(this.layer, this.actor.vx, this.actor.vy, this.actor.sprite());
    ENGINE.layersToClear.add("explosion");
  }
  move() {
    ENGINE.VIEWPORT.alignTo(this.actor);
  }
}

class Destination {
  constructor(waypoint, origin) {
    this.waypoint = waypoint;
    this.origin = origin;
  }
}

class Warp {
  constructor(destination, spriteRotation, dir) {
    this.destination = destination;
    this.spriteRotation = spriteRotation;
    this.dir = dir;
    this.pos = GRID.gridToCoord(destination.origin);
    this.grid = this.destination.origin;

    if (spriteRotation !== 270) this.pos.x -= 12;
    if (spriteRotation !== 0) this.pos.y -= 12;
  }
  getSprite() {
    return SPRITE[`Warp_${this.spriteRotation}`];
  }
  draw() {
    ENGINE.draw('nest', this.pos.x, this.pos.y, this.getSprite());
  }
}

class Gate {
  constructor(grid, GA) {
    this.grid = grid;
    this.pos = GRID.gridToCoord(grid);
    this.GA = GA;
  }
  getSprite() {
    return SPRITE.door;
  }
  draw() {
    ENGINE.draw('template_static', this.pos.x, this.pos.y, this.getSprite());
  }
  open() {
    console.warn("open the door", this.id);
    this.GA.toEmpty(this.grid);
    BUMP2D.remove(this.id);
    BUMP2D.refresh();
    GAME.updateStatic();
    CHANGING_ANIMATION.add(new LiftingDoor(this.grid));
    VANISHING.add(new VanishingScore(this.grid, this.value()));
  }
  value() {
    return 1000;
  }
}

class VanishingScore {
  constructor(grid, text) {
    this.grid = grid;
    this.pos = GRID.gridToCenterPX(grid);
    this.text = text;
    this.RD = new RenderData("Consolas", 10, "#FFF", "dyntext");
    this.time = 1000;
    this.mTime = this.time;
  }
  update(lapsedTime) {
    this.time -= lapsedTime;
    if (this.time <= 0) {
      VANISHING.remove(this.id);
    }
  }
  draw() {
    ENGINE.layersToClear.add("dyntext");
    ENGINE.TEXT.setRD(this.RD);
    const CTX = LAYER.dyntext;
    CTX.save();
    CTX.globalAlpha = Math.min(1.0, 1.5 * this.time / this.mTime);
    ENGINE.TEXT.text(this.text, this.pos.x - ENGINE.VIEWPORT.vx, this.pos.y - ENGINE.VIEWPORT.vy);
    CTX.restore();
  }
}

class LiftingDoor {
  constructor(grid) {
    this.grid = grid;
    this.pos = GRID.gridToCoord(grid);
    this.maxLine = SPRITE.door.height;
    this.line = 0;
    this.sprite = SPRITE.door;
  }
  draw() {
    ENGINE.layersToClear.add("animation");
    ENGINE.drawPart("animation", this.pos.x - ENGINE.VIEWPORT.vx, this.pos.y - ENGINE.VIEWPORT.vy, this.sprite, 0, 0, 0, this.line);
  }
  change() {
    this.line++;
  }
  complete() {
    return this.line >= this.maxLine;
  }
}

class Nest {
  constructor(grid, spriteRotation, dir) {
    this.grid = grid;
    this.pos = GRID.gridToCoord(grid);
    this.spriteRotation = spriteRotation;
    this.dir = dir;
    if (spriteRotation !== 270) this.pos.x -= 12;
    if (spriteRotation !== 0) this.pos.y -= 12;
    this.distance = null;
  }
  getSprite() {
    return SPRITE[`Nest_${this.spriteRotation}`];
  }
  draw() {
    ENGINE.draw('nest', this.pos.x, this.pos.y, this.getSprite());
  }
  outOfSight() {
    const minX = Math.floor(ENGINE.VIEWPORT.vx / ENGINE.INI.GRIDPIX) - INI.ENEMY_VISIBILITY_TOLERANCE;
    const maxX = minX + ENGINE.gameWIDTH / ENGINE.INI.GRIDPIX - 1 + INI.ENEMY_VISIBILITY_TOLERANCE;
    if (this.grid.x <= minX || this.grid.x >= maxX) return true;
    return false;
  }
}

class FloorItem {
  constructor(grid) {
    this.grid = grid;
    this.pos = GRID.gridToCenterPX(grid);
  }
  draw() {
    ENGINE.spriteDraw('template_static', this.pos.x, this.pos.y, this.getSprite());
  }
  touch() {
    if (this.pick()) {
      ENGINE.VIEWPORT.changed = false;
      FLOOR_OBJECT.remove(this.id);
      FLOOR_OBJECT.refresh();
      GAME.updateStatic();
      GAME.addScore(this.getValue());
      VANISHING.add(new VanishingScore(this.grid, this.getValue()));
    }
  }
}

class Key extends FloorItem {
  constructor(grid) {
    super(grid);
    this.value = 500;
  }
  getValue() {
    return this.value;
  }
  getSprite() {
    return SPRITE.key;
  }
  pick() {
    if (HERO.hasKey) return false;
    HERO.hasKey = true;
    TITLE.key();
    AUDIO.Keys.play();
    return true;
  }
}

class Treasure extends FloorItem {
  static count = -1;
  constructor(grid, sprite) {
    super(grid);
    this.sprite = sprite;
  }
  getValue() {
    return 500 * Math.pow(2, Treasure.count);
  }
  getSprite() {
    return SPRITE[this.sprite];
  }
  pick() {
    Treasure.inc();
    AUDIO.Pick.play();
    return true;
  }
  static reset() {
    Treasure.count = -1;
  }
  static inc() {
    Treasure.count++;
  }
}

class Enemy {
  constructor(grid, dir, type, name) {
    this.grid = grid;
    this.dir = dir;
    for (let prop in type) {
      this[prop] = type[prop];
    }
    this.name = name; //also sprite, asset name
    this.asset = ASSET[name];
    this.spriteClass = name;
    this.actor = new ACTOR(this.spriteClass, 0, 0, "front", this.asset);
    this.moveState = new MoveState(grid, this.dir, MAP[GAME.level].map.GA);
    GRID.gridToSprite(grid, this.actor);
    this.actor.orientation = this.actor.getOrientation(this.dir);
    this.actor.animateMove(this.actor.orientation);
    ENGINE.VIEWPORT.alignTo(this.actor);
    this.behaviour = new Behaviour(this.foreSight + 1, ["wanderer"], this.foreSight, ["advancer"]);
    this.distance = null;
    this.dirStack = [];
  }
  outOfSight() {
    const minX = Math.floor(ENGINE.VIEWPORT.vx / ENGINE.INI.GRIDPIX) - INI.ENEMY_VISIBILITY_TOLERANCE;
    const maxX = minX + ENGINE.gameWIDTH / ENGINE.INI.GRIDPIX - 1 + INI.ENEMY_VISIBILITY_TOLERANCE;
    if (this.moveState.homeGrid.x <= minX || this.moveState.homeGrid.x >= maxX) return true;
    return false;
  }
  manage(lapsedTime, IA, map, hero) {
    this.setDistanceFromNodeMap(map.GA.nodeMap);

    if (this.outOfSight()) {
      ENEMY_TG.remove(this.id);
      return;
    }

    //enemy translate position
    if (this.moveState.moving) {
      GRID.translateMove(this, lapsedTime);
      return;
    }

    //set behaviour
    this.behaviour.manage(this, this.distance, false);
    //set next move
    const ARG = {
      playerPosition: hero.moveState.homeGrid,
      currentPlayerDir: hero.moveState.dir,
      exactPlayerPosition: hero.moveState.homeGrid,
    };
    this.dirStack = AI[this.behaviour.strategy](this, ARG);
    this.makeMove();
  }
  makeMove() {
    this.moveState.next(this.dirStack.shift());
  }
  setDistanceFromNodeMap(nodemap) {
    if (!nodemap[this.moveState.homeGrid.x][this.moveState.homeGrid.y]) {
      ENEMY_TG.remove(this.id);
      return;
    }
    this.distance = nodemap[this.moveState.homeGrid.x][this.moveState.homeGrid.y].distance;
  }
  draw() {
    ENGINE.layersToClear.add("enemy");
    ENGINE.spriteDraw('enemy', this.actor.vx, this.actor.vy, this.actor.sprite());
  }
  die() {
    AUDIO.Explosion.play();
    DESTRUCTION_ANIMATION.add(new GeneralDestruction(new Point(this.actor.x, this.actor.y), "AlienExp"));
    GAME.addScore(this.score);
    ENEMY_TG.remove(this.id);
  }
}

class Laser {
  constructor(point, dir, grid) {
    this.point = point;
    this.dir = dir.x;                 //one dimensional (x) direction!
    this.dirIndex = dir.toInt();
    this.speed = INI.LASER_SPEED_MAX;
    this.end = new Point(this.point.x + INI.LASER_START * this.dir, this.point.y);
    this.done = false;
    this.originGrid = grid;
    this.finalX = null;
  }
  setArea() {
    let x;
    if (this.dir === 1) {
      x = this.point.x;
    } else x = this.end.x;
    this.area = new Area(x, this.point.y, Math.abs(this.point.x - this.end.x), 1);
  }
  collision() {
    let grids = this.getGrids();
    const IA = this.parent.map[this.parent.enemyIA];
    const ids = IA.unrollArray(grids);
    if (ids.size) {
      for (let id of ids) {
        const enemy = ENEMY_TG.show(id);
        let hit = ENGINE.collisionRectangles(this, enemy.actor);
        if (hit) enemy.die();

      }
    }
  }
  getGrids() {
    const origin = GRID.pointToGrid(this.point);
    const end = GRID.pointToGrid(this.end);
    const grids = [end];
    for (let i = origin.x; i != end.x; i += this.dir) {
      grids.push(new Grid(i, origin.y));
    }
    return grids;
  }
  draw() {
    ENGINE.layersToClear.add("laser");
    const CTX = LAYER.laser;
    CTX.beginPath();
    CTX.moveTo(this.point.x - ENGINE.VIEWPORT.vx, this.point.y - ENGINE.VIEWPORT.vy);
    CTX.lineTo(this.end.x - ENGINE.VIEWPORT.vx, this.end.y - ENGINE.VIEWPORT.vy);
    CTX.closePath();
    CTX.stroke();
  }
  manage(lapsedTime) {
    if (!this.finalX) this.finalX = this.checkFinal();
    if (this.done) BALLISTIC_TG.remove(this.id);
    const deltaTime = lapsedTime / 1000;
    this.point.x += this.dir * INI.LASER_SPEED_MIN * deltaTime;
    this.end.x += this.dir * INI.LASER_SPEED_MAX * deltaTime;

    const finalXConditions = {
      '-1': () => this.end.x < this.finalX,
      '1': () => this.end.x > this.finalX
    };

    if (finalXConditions[this.dir]()) {
      this.end.x = this.finalX;
      this.done = true;
    }
  }
  checkFinal() {
    const GA = this.parent.map.GA;
    let gridX = this.originGrid.x;
    for (let q = 1; q <= INI.LASER_GRID_LENGTH; q++) {
      let nextX = q * this.dir + this.originGrid.x;
      const nextGrid = new Grid(nextX, this.originGrid.y);
      if (GA.isWall(nextGrid) || GA.isOutOfBounds(nextGrid)) break;
      gridX = nextX;
    }
    if (this.dir === 1) gridX++;
    let piX = gridX * ENGINE.INI.GRIDPIX;
    if (this.direction === 1) piX--;
    return piX;
  }
}

/** */

const HERO = {
  goto(grid) {
    this.moveState.reset(grid);
    HERO.pos = HERO.moveState.homeGrid;
    HERO.moved = true;
    GRID.gridToSprite(this.moveState.startGrid, HERO.actor);
    ENGINE.VIEWPORT.check(HERO.actor);
    ENGINE.VIEWPORT.alignTo(HERO.actor);
  },
  useLamp() {
    if (!DEBUG.INF_LAMPS) HERO.lamp = false;
    TITLE.lamp();
    ENEMY_TG.performOnPool("die");
    AUDIO.KillAll.play();
  },
  manage(lapsedTime) {
    HERO.move(lapsedTime);
    HERO.checkItemColission();
    if (ENEMY_TG.POOL.length) HERO.checkEnemyCollision();
  },
  checkEnemyCollision() {
    const IA = MAP[GAME.level].map[ENEMY_TG.IA]
    const id = IA.unroll(HERO.moveState.homeGrid);
    if (id.length) {
      //console.warn("enemy collision to id", id);
      ENEMY_TG.remove(id);
      HERO.die();
    }
  },
  checkItemColission() {
    if (HERO.moveState.moving) return;
    if (!HERO.moved) return;
    const IA = MAP[GAME.level].map[FLOOR_OBJECT.IA]
    const id = IA.unroll(HERO.moveState.homeGrid);
    if (id.length) {
      const item = FLOOR_OBJECT.show(id);
      item.touch();
    }
  },
  move(lapsedTime) {
    if (HERO.dead) return;
    if (HERO.moveState.moving) {
      GRID.translateMove(HERO, lapsedTime, HERO.moveState.gridArray, true);
      HERO.moved = true;
      HERO.pos = HERO.moveState.homeGrid;       // compatibility with MINIMAP
    }
  },
  continueMove() {
    if (HERO.lastDir) {
      const nextGrid = HERO.moveState.endGrid.add(HERO.lastDir);
      const valueNext = HERO.moveState.gridArray.getValue(nextGrid);
      if (valueNext === MAPDICT.EMPTY) HERO.moveState.next(HERO.lastDir);
    }
    return;
  },
  changeDirection(dir) {
    if (HERO.moveState.moving) return;
    const nextGrid = HERO.moveState.endGrid.add(dir);

    if (HERO.moveState.gridArray.isOutOfBounds(nextGrid)) {
      if (GRID.same(MAP[GAME.level].exit, HERO.moveState.homeGrid)) {
        GAME.levelEnd();
      }
      return;
    }

    if (HERO.moveState.gridArray.isEmpty(nextGrid)) {
      HERO.moveState.next(dir);
      HERO.lastDir = dir;
    } else {
      const valueNext = HERO.moveState.gridArray.getValue(nextGrid);
      const valueThis = HERO.moveState.gridArray.getValue(HERO.moveState.startGrid);
      const IA = MAP[GAME.level].map[BUMP2D.IA];

      if (valueNext === MAPDICT.WALL && valueThis === MAPDICT.WARP) {
        //warp: next 1, this 32
        const id = IA.unroll(HERO.moveState.startGrid);
        const warp = BUMP2D.show(id);
        const orientation = GRID.same(dir, warp.dir.mirror());
        if (orientation) HERO.goto(warp.destination.waypoint);
        //console.warn("warp", id, warp, orientation);
        return;
      }
      if (valueNext === MAPDICT.WALL + MAPDICT.DOOR) {
        //door: next 5, this 0
        if (HERO.hasKey) {
          const id = IA.unroll(nextGrid);
          const door = BUMP2D.show(id);
          door.open();
          GAME.addScore(door.value());
          HERO.hasKey = false;
          ENGINE.clearLayer("key");
          AUDIO.OpenGate.play();
        }
      }
    }
  },
  draw() {
    if (!HERO.moved) return;
    ENGINE.clearLayer("hero");
    if (HERO.dead) return;
    //console.info("HERO draw", HERO, HERO.actor.vx, HERO.actor.vy, HERO.actor.sprite());
    //console.info("vp", ENGINE.VIEWPORT);
    ENGINE.spriteDraw("hero", HERO.actor.vx, HERO.actor.vy, HERO.actor.sprite());
    HERO.moved = false;
  },
  startInit() {
    HERO.speed = INI.HERO_SPEED;
    HERO.pos = null;
    HERO.hasKey = false;
    HERO.lamp = true;
    HERO.lastDir = null;
  },
  init() {
    ENGINE.clearLayer("deadhero");
    HERO.actor = new ACTOR("Ghosty", 0, 0, "front", ASSET.Ghosty);
    GRID.gridToSprite(MAP[GAME.level].start, HERO.actor);
    HERO.moveState = new MoveState(MAP[GAME.level].start, DOWN, MAP[GAME.level].map.GA);
    HERO.pos = HERO.moveState.homeGrid;
    ENGINE.VIEWPORT.check(HERO.actor);
    ENGINE.VIEWPORT.alignTo(HERO.actor);
    HERO.moved = true;
    HERO.canShoot = true;
    HERO.dead = false;
  },
  shoot(dir) {
    if (!HERO.canShoot) return;
    const laserExists = BALLISTIC_TG.find("dirIndex", dir.toInt());
    if (laserExists) return;

    const x = HERO.actor.x + ENGINE.INI.GRIDPIX / 4 * dir.x;
    const laser = new Laser(new Point(x, HERO.actor.y), dir, this.moveState.homeGrid);
    BALLISTIC_TG.add(laser);
    AUDIO.Buzz.play();
  },
  death() {
    console.warn("HERO DIES");
    ENGINE.GAME.ANIMATION.stop();
    GAME.lives--;
    TITLE.lives();

    if (GAME.lives < 0 && !DEBUG.INF_LIVES) {
      TITLE.gameOver();
      GAME.end();
    } else {
      AUDIO.EvilLaughter.onended = GAME.levelContinue;
      AUDIO.EvilLaughter.play();
    }
  },
  die() {
    if (HERO.dead) return;
    if (DEBUG.GOD) return;
    HERO.dead = true;
    HERO.canShoot = false;
    HERO.paintDeath();
    AUDIO.Explosion.play();
    ENGINE.TIMERS.stop();
    ENGINE.TIMERS.remove(NEST.timerID);
  },
  paintDeath() {
    ENGINE.clearLayer("hero");
    ENGINE.spriteDraw("deadhero", HERO.actor.vx, HERO.actor.vy, SPRITE.skull);
    DESTRUCTION_ANIMATION.add(new GeneralDestruction(new Point(HERO.actor.x, HERO.actor.y), "ShipExp"));
  },
};

const GAME = {
  start() {
    console.log("GAME started");
    if (AUDIO.Title) {
      AUDIO.Title.pause();
      AUDIO.Title.currentTime = 0;
    }
    $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
    $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
    $(ENGINE.topCanvas).css("cursor", "");
    ENGINE.hideMouse();
    //AI.VERBOSE = true;
    AI.changeAdvancerToHuntImmediatelly();
    //MINIMAP.verbose();
    MINIMAP.quiet();

    $("#pause").prop("disabled", false);
    $("#pause").off();
    GAME.paused = true;
    ENGINE.watchVisibility(GAME.lostFocus);
    ENGINE.GAME.start(16);
    GAME.fps = new FPS_short_term_measurement(300);
    GAME.extraLife = SCORE.extraLife.clone();
    GAME.prepareForRestart();                             //everything required for safe restart
    GAME.level = 1;                                       //default
    //GAME.level = 10;                                       //debug
    GAME.score = 0;
    GAME.lives = 4;                                       //DEFAULT
    //GAME.lives = 1;                                     //debug

    LAYER.laser.strokeStyle = "#F00";
    HERO.startInit();
    GAME.levelStart(GAME.level);
  },
  prepareForRestart() {
    //everything required for safe restart
    let clear = ["background", "text", "FPS", "button", "bottomText", "deadhero"];
    ENGINE.clearManylayers(clear);
    MAP = $.extend(true, {}, BACKUP_MAP);
  },
  levelContinue() {
    console.log("LEVEL", GAME.level, "continues ...");
    HERO.init();
    ENEMY_TG.clearAll();
    BALLISTIC_TG.clearAll();
    ENGINE.TIMERS.start();
    NEST.start();
    GAME.resume();
  },
  async levelStart(level) {
    console.log("starting level", level);
    GAME.levelCompleted = false;
    ENGINE.VIEWPORT.reset();
    await GAME.initLevel(level);
    ENGINE.TIMERS.clear();
    GAME.firstFrameDraw(level);
    GAME.timer = new CountDown("gameTime", DEFINE[GAME.level].time, GAME.timeIsUp);
    NEST.start();
    AUDIO.StartLevel.play();
    GAME.resume();
  },
  canSpawn() {
    return ENEMY_TG.POOL.length < INI.MAX_ENEMIES;
  },
  spawn(id) {
    const typeName = DEFINE[GAME.level].enemy.chooseRandom();
    const type = EnemyList[typeName];
    const nest = NEST.show(id);
    const enemy = new Enemy(nest.grid, nest.dir, type, typeName);
    ENEMY_TG.add(enemy);
  },
  timeIsUp() {
    console.error("TIME ENDS");
    HERO.canShoot = false;
  },
  nextLevel() {
    GAME.level++;
    //console.error("creating next level: ", GAME.level);
    ENGINE.clearLayer("text");
    ENGINE.clearLayer("dyntext");
    //if (GAME.level > INI.LAST_LEVEL) {
    if (GAME.level > 1) {
      ENGINE.GAME.stopAnimation = true;
      console.log("game have been won. please code the end you lazy bastard.");
      ENGINE.clearLayer("hero");
      TITLE.gameWon();
      //GAME.end();
    } else GAME.levelStart(GAME.level);
  },
  levelEnd() {
    GAME.timeLeft = Math.floor(ENGINE.TIMERS.access("gameTime").remains());
    console.log("level ", GAME.level, " ended.", "GAME.timeLeft", GAME.timeLeft);
    HERO.canShoot = false;
    TITLE.levelEndTemplate();
    GAME.timeBonus = 0;
    AUDIO.ClearLevel.play();
    ENGINE.GAME.ANIMATION.next(TITLE.run);
  },
  async initLevel(level) {
    console.log("init level", level);
    console.time("init");
    ENGINE.clearManylayers(["wall", "floor", "nest", "template_static", "background", "static"]);

    MAP[level].binary = GRID.unpackIntegerMap(MAP[level]);
    MAP[level].map = FREE_MAP.create(MAP[level].width, MAP[level].height, null, 2);
    MAP[level].map.GA.importBinaryString(MAP[level].binary);
    MAP[level].pw = MAP[level].width * ENGINE.INI.GRIDPIX;
    MAP[level].ph = MAP[level].height * ENGINE.INI.GRIDPIX;
    ENGINE.VIEWPORT.setMax({ x: MAP[level].pw, y: MAP[level].ph });

    //setting grahic templates
    ENGINE.resizeBOX("LEVEL", MAP[level].pw, MAP[level].ph);
    ENGINE.TEXTUREGRID.configure("floor", "wall", MAP[level].floor, MAP[level].background);
    await ENGINE.TEXTUREGRID.draw(MAP[level].map);

    HERO.init();
    TITLE.key();
    BUMP2D.init(MAP[level].map);
    VANISHING.init(MAP[level].map);
    CHANGING_ANIMATION.init(MAP[level].map);
    NEST.init(MAP[level].map);
    NEST.setIA();
    NEST.configure(INI.SPAWN_DELAY, GAME.canSpawn, GAME.spawn, HERO);
    FLOOR_OBJECT.init(MAP[level].map);
    SPAWN.spawn(MAP[level]);
    BUMP2D.refresh();
    FLOOR_OBJECT.refresh();
    ENEMY_TG.init(MAP[level].map);
    BALLISTIC_TG.init(MAP[level].map);
    DESTRUCTION_ANIMATION.init(null);
    MINIMAP.setOffset(164, 32);
    MINIMAP.init(MAP[level].map, 500 - 164, ENGINE.titleHEIGHT - 2 * 32, HERO);

    //drawing of statics
    BUMP2D.draw();
    NEST.draw();
    await ENGINE.flattenLayers("nest", "floor");
    await BITMAP.store(LAYER.floor.canvas, "maze");

    console.timeEnd("init");
    //console.log("MAP", MAP[level]);
  },
  updateVieport() {
    if (!ENGINE.VIEWPORT.changed) return;
    ENGINE.VIEWPORT.changeFromBitmap("maze", "background");
    ENGINE.clearLayer("static");
    ENGINE.VIEWPORT.change("template_static", "static");
    ENGINE.VIEWPORT.changed = false;
  },
  updateStatic(level) {
    console.info("updated static");
    level = level || GAME.level;
    ENGINE.clearLayer("template_static");
    BUMP2D.draw();
    FLOOR_OBJECT.draw();

    ENGINE.VIEWPORT.changed = true;

  },
  firstFrameDraw(level) {
    console.log("drawing first frame");
    ENGINE.clearLayerStack();
    GAME.updateStatic(level);
    ENGINE.VIEWPORT.changed = true;
    GAME.updateVieport();
    TITLE.main();

    if (DEBUG.GRID) GRID.grid();
    if (DEBUG.COORD) GRID.paintCoord("coord", MAP[GAME.level].map);
  },
  run(lapsedTime) {
    if (ENGINE.GAME.stopAnimation) return;

    HERO.manage(lapsedTime);
    VANISHING.manage(lapsedTime);
    CHANGING_ANIMATION.manage(lapsedTime);
    ENEMY_TG.manage(lapsedTime, HERO);
    BALLISTIC_TG.manage(lapsedTime);
    DESTRUCTION_ANIMATION.manage(lapsedTime);
    GAME.respond();
    ENGINE.TIMERS.update();
    GAME.frameDraw(lapsedTime);
    if (HERO.dead) IAM.checkIfProcessesComplete([DESTRUCTION_ANIMATION, VANISHING, CHANGING_ANIMATION], HERO.death);
  },
  frameDraw(lapsedTime) {
    ENGINE.clearLayerStack();
    GAME.updateVieport();
    ENEMY_TG.draw();
    BALLISTIC_TG.draw();
    DESTRUCTION_ANIMATION.draw(lapsedTime);
    HERO.draw();
    VANISHING.draw();
    CHANGING_ANIMATION.draw();
    TITLE.updateTime();
    MINIMAP.draw(true, HERO, true);
    if (DEBUG.FPS) GAME.FPS(lapsedTime);
  },
  respond() {
    if (HERO.dead) return;
    const map = ENGINE.GAME.keymap;

    if (map[ENGINE.KEY.map.F4]) {
      $("#pause").trigger("click");
      ENGINE.TIMERS.display();
      ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
    }

    //fall throught section
    if (map[ENGINE.KEY.map.F9]) {
      console.log("DEBUG:", HERO);
      HERO.goto(new Grid(22, 9)); //exit
      HERO.hasKey = true; //DEBUG
    }

    if (map[ENGINE.KEY.map.A]) {
      HERO.shoot(LEFT);
      ENGINE.GAME.keymap[ENGINE.KEY.map.A] = false; //NO repeat
    }
    if (map[ENGINE.KEY.map.D]) {
      HERO.shoot(RIGHT);
      ENGINE.GAME.keymap[ENGINE.KEY.map.D] = false; //NO repeat
    }

    if (map[ENGINE.KEY.map.ctrl]) {
      //console.log("CTRL");
      ENGINE.GAME.keymap[ENGINE.KEY.map.ctrl] = false; //NO repeat
    }
    if (map[ENGINE.KEY.map.space]) {
      //console.log("SPACE");
      if (HERO.lamp) HERO.useLamp();
      ENGINE.GAME.keymap[ENGINE.KEY.map.space] = false; //NO repeat
    }

    //single key section
    if (map[ENGINE.KEY.map.left]) {
      HERO.changeDirection(LEFT);
      return;
    }
    if (map[ENGINE.KEY.map.right]) {
      HERO.changeDirection(RIGHT);
      return;
    }
    if (map[ENGINE.KEY.map.up]) {
      HERO.changeDirection(UP);
      return;
    }
    if (map[ENGINE.KEY.map.down]) {
      HERO.changeDirection(DOWN);
      return;
    }

    if (!HERO.moveState.moving) HERO.continueMove();

  },
  setup() {
    console.log("GAME SETUP started");
    AUDIO.OpenGate.rate = 2.0;
  },
  end() {
    ENGINE.showMouse();
    AUDIO.Death.onended = GAME.checkScore;
    AUDIO.Death.play();
  },
  checkScore() {
    SCORE.checkScore(GAME.score);
    SCORE.hiScore();
    TITLE.startTitle();
  },
  setTitle() {
    const text = GAME.generateTitleText();
    const RD = new RenderData("Annie", 16, "#0E0", "bottomText");
    const SQ = new RectArea(0, 0, LAYER.bottomText.canvas.width, LAYER.bottomText.canvas.height);
    GAME.movingText = new MovingText(text, 4, RD, SQ);
  },
  generateTitleText() {
    let text = `${PRG.NAME} ${PRG.VERSION
      }, a game by Lovro Selič, ${"\u00A9"} LaughingSkull ${PRG.YEAR
      }. 
             
            Music: 'Single Photon's Shadow' written and performed by LaughingSkull, ${"\u00A9"
      } 2017 Lovro Selič. `;
    text += "     ENGINE, GRID, IAM  and GAME code by Lovro Selič using JavaScript. ";
    text += "     Remastered and ported to ENGINE v4 in 2024. ";
    text = text.split("").join(String.fromCharCode(8202));
    return text;
  },
  runTitle() {
    if (ENGINE.GAME.stopAnimation) return;
    GAME.movingText.process();
    GAME.titleFrameDraw();
  },
  titleFrameDraw() {
    GAME.movingText.draw();
  },
  lostFocus() {
    if (GAME.paused) return;
    GAME.clickPause();
  },
  clickPause() {
    if (GAME.levelCompleted) return;
    $("#pause").trigger("click");
    ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
  },
  pause() {
    if (GAME.paused) return;
    //if (GAME.levelFinished) return;
    if (HERO.dead) return;
    //if (!SHIP.live) return;
    console.log("%cGAME paused.", PRG.CSS);
    let GameRD = new RenderData("Arcade", 48, "#DDD", "text", "#000", 2, 2, 2);
    ENGINE.TEXT.setRD(GameRD);
    $("#pause").prop("value", "Resume Game [F4]");
    $("#pause").off("click", GAME.pause);
    $("#pause").on("click", GAME.resume);
    ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.clickPause, "F4"));
    ENGINE.TEXT.centeredText("Game Paused", ENGINE.gameWIDTH, ENGINE.gameHEIGHT / 2);
    GAME.paused = true;
    ENGINE.TIMERS.stop();
  },
  resume() {
    console.log("%cGAME resumed.", PRG.CSS);
    $("#pause").prop("value", "Pause Game [F4]");
    $("#pause").off("click", GAME.resume);
    $("#pause").on("click", GAME.pause);
    ENGINE.clearLayer("text");
    ENGINE.TIMERS.start();
    ENGINE.GAME.ANIMATION.resetTimer();
    ENGINE.GAME.ANIMATION.next(GAME.run);
    GAME.paused = false;
  },
  FPS(lapsedTime) {
    let CTX = LAYER.FPS;
    CTX.fillStyle = "black";
    ENGINE.clearLayer("FPS");
    let fps = 1000 / lapsedTime || 0;
    GAME.fps.update(fps);
    CTX.fillText(GAME.fps.getFps(), 5, 10);
  },
  addScore(score) {
    GAME.score += score;
    TITLE.score();
  }
};

const TITLE = {
  startTitle() {
    console.log("starting title");
    ENGINE.clearManylayers(["text", "lives", "lamp", "title", "minimap", "key", "score", "time", "deadhero"]);
    //if (AUDIO.Title) TITLE.music();       //blocked for annoyance in devlopment
    TITLE.backs();
    ENGINE.draw("background", (ENGINE.gameWIDTH - TEXTURE.Title.width) / 2, (ENGINE.gameHEIGHT - TEXTURE.Title.height) / 2, TEXTURE.Title);
    TITLE.mainTitle();
    ENGINE.topCanvas = ENGINE.getCanvasName("ROOM");
    TITLE.drawButtons();
    $("#DOWN")[0].scrollIntoView();
    GAME.setTitle();
    ENGINE.GAME.start(16);
    ENGINE.GAME.ANIMATION.next(GAME.runTitle);
  },
  drawButtons() {
    ENGINE.clearLayer("button");
    FORM.BUTTON.POOL.clear();
    const w = 166;
    const h = 24;
    let x = 16;
    let y = ENGINE.gameHEIGHT - (3 * h);

    let startBA = new Area(x, y, w, h);
    const buttonColors = new ColorInfo("#F00", "#A00", "#222", "#666", 13);
    const musicColors = new ColorInfo("#0E0", "#090", "#222", "#666", 13);
    FORM.BUTTON.POOL.push(new Button("Start game", startBA, buttonColors, GAME.start));
    y += 1.8 * h;
    let music = new Area(x, y, w, h);
    FORM.BUTTON.POOL.push(new Button("Play title music", music, musicColors, TITLE.music));
    FORM.BUTTON.draw();
    $(ENGINE.topCanvas).on("mousemove", { layer: ENGINE.topCanvas }, ENGINE.mouseOver);
    $(ENGINE.topCanvas).on("click", { layer: ENGINE.topCanvas }, ENGINE.mouseClick);
  },
  stack: {
    x: 0,
    y: 0
  },
  main() {
    TITLE.title();
    TITLE.bottom();
    TITLE.stage();
    TITLE.time();
    TITLE.hiScore();
    TITLE.lives();
    TITLE.score();
    TITLE.lamp();
  },
  mainTitle() {
    const CTX = LAYER.title;
    const fs = 60;
    CTX.font = fs + "px Garamond";
    const txt = CTX.measureText(PRG.NAME);
    let x = Math.round((ENGINE.gameWIDTH - txt.width) / 2);
    let y = fs + 10;
    const gx = x - txt.width / 2;
    const gy = y - fs;
    const grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
    grad.addColorStop("0", "#CCC");
    grad.addColorStop("0.1", "#EEE");
    grad.addColorStop("0.2", "#DDD");
    grad.addColorStop("0.3", "#AAA");
    grad.addColorStop("0.4", "#999");
    grad.addColorStop("0.5", "#666");
    grad.addColorStop("0.6", "#888");
    grad.addColorStop("0.7", "#AAA");
    grad.addColorStop("0.8", "#BBB");
    grad.addColorStop("0.9", "#EEE");
    grad.addColorStop("1", "#CCC");
    GAME.grad = grad;
    CTX.fillStyle = grad;
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.fillText(PRG.NAME, x, y);
  },
  title() {
    const CTX = LAYER.title;
    TITLE.titleBack();
    const fs = 42;
    CTX.font = fs + "px Garamond";
    const txt = CTX.measureText(PRG.NAME);
    let x = 32;
    let y = fs + 10;
    const gx = x - txt.width / 2;
    const gy = y - fs;
    const grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
    grad.addColorStop("0", "#CCC");
    grad.addColorStop("0.1", "#EEE");
    grad.addColorStop("0.2", "#DDD");
    grad.addColorStop("0.3", "#AAA");
    grad.addColorStop("0.4", "#999");
    grad.addColorStop("0.5", "#666");
    grad.addColorStop("0.6", "#888");
    grad.addColorStop("0.7", "#AAA");
    grad.addColorStop("0.8", "#BBB");
    grad.addColorStop("0.9", "#EEE");
    grad.addColorStop("1", "#CCC");
    GAME.grad = grad;
    CTX.fillStyle = grad;
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.fillText(PRG.NAME, x, y);
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 5;
    CTX.shadowColor = "yellow";
    y += 24;
    CTX.font = "10px Consolas";
    CTX.fillText("Version " + PRG.VERSION, x, y);
    y += 14;
    CTX.fillText("by Lovro Selič", x, y);
  },
  backs() {
    TITLE.background();
    TITLE.bottom();
    TITLE.titleBack();
  },
  titleBack() {
    const CTX = LAYER.title;
    CTX.fillStyle = "#000";
    CTX.roundRect(0, 0, ENGINE.gameWIDTH, ENGINE.titleHEIGHT, { upperLeft: 20, upperRight: 20, lowerLeft: 0, lowerRight: 0 }, true, true);
  },
  background() {
    const CTX = LAYER.background;
    CTX.fillStyle = "#000";
    CTX.roundRect(0, 0, ENGINE.gameWIDTH, ENGINE.gameHEIGHT, { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 }, true, true);
  },
  bottom() {
    const CTX = LAYER.bottom;
    CTX.fillStyle = "#000";
    CTX.roundRect(0, 0, ENGINE.gameWIDTH, ENGINE.bottomHEIGHT, { upperLeft: 0, upperRight: 0, lowerLeft: 20, lowerRight: 20 }, true, true);
  },
  stage() {
    var CTX = LAYER.title;
    var x = 500;
    var y = 32;
    ENGINE.draw("title", x, y, SPRITE.stage);
    CTX.font = "18px Consolas";
    CTX.fillStyle = "#000";
    CTX.textAlign = "center";
    CTX.shadowColor = "#666";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 2;
    x = 534;
    y = 68;
    CTX.fillText(GAME.level.toString().padStart(2, "0"), x, y);
  },
  key() {
    if (!HERO.hasKey) return;
    const x = 432;
    const y = 32;
    const h = 60;
    ENGINE.draw("key", x, y + (h - SPRITE.key.height) / 2, SPRITE.key);
  },
  time() {
    var x = 584;
    var y = 32;
    ENGINE.draw("title", x, y, SPRITE.shield);
  },
  hiScore() {
    var CTX = LAYER.title;
    var fs = 16;
    CTX.font = fs + "px Garamond";
    CTX.fillStyle = GAME.grad;
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 2;
    CTX.textAlign = "left";
    var x = 700;
    var y = 32 + fs;
    var index = SCORE.SCORE.name[0].indexOf("&nbsp");
    var HS;
    if (index > 0) {
      HS = SCORE.SCORE.name[0].substring(
        0,
        SCORE.SCORE.name[0].indexOf("&nbsp")
      );
    } else {
      HS = SCORE.SCORE.name[0];
    }
    const text = `HISCORE: ${SCORE.SCORE.value[0].toString().padStart(8, "0")} by ${HS}`;
    CTX.fillText(text, x, y);
  },
  score() {
    ENGINE.clearLayer("score");
    var CTX = LAYER.score;
    var fs = 32;
    CTX.font = fs + "px Garamond";
    CTX.fillStyle = GAME.grad;
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.textAlign = "left";
    var x = 700;
    var y = 82;
    CTX.fillText("SCORE: " + GAME.score.toString().padStart(8, "0"), x, y);
    if (GAME.score >= GAME.extraLife[0]) {
      GAME.lives++;
      GAME.extraLife.shift();
      TITLE.lives();
    }
  },
  lamp() {
    if (HERO.lamp) {
      var CTX = LAYER.lamp;
      var y = CTX.canvas.height / 2;
      var x = 48;
      ENGINE.spriteDraw("lamp", x, y, SPRITE.lamp);
    } else ENGINE.clearLayer("lamp");
  },
  lives() {
    ENGINE.clearLayer("lives");
    var CTX = LAYER.lives;
    var x = CTX.canvas.width / 2;
    var y = CTX.canvas.height / 2;
    var spread = ENGINE.spreadAroundCenter(GAME.lives, x, 32);
    for (let q = 0; q < GAME.lives; q++) {
      ENGINE.spriteDraw("lives", spread[q], y, SPRITE.ghostLives);
    }
  },
  updateTime() {
    if (HERO.dead) return;
    var CTX = LAYER.time;
    ENGINE.clearLayer("time");
    CTX.font = "18px Consolas";
    CTX.fillStyle = "#000";
    CTX.textAlign = "center";
    CTX.shadowColor = "#666";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 2;
    var x = 632;
    var y = 72;
    const remains = Math.round(GAME.timer.remains()).toString().padStart(3, "0");
    CTX.fillText(remains, x, y);
  },
  run(lapsedTime) {
    if (ENGINE.GAME.stopAnimation) return;

    CHANGING_ANIMATION.manage(lapsedTime);
    BALLISTIC_TG.manage(lapsedTime);
    DESTRUCTION_ANIMATION.manage(lapsedTime);

    TITLE.levelEndRefresh();
    if (GAME.timeLeft === 0) {
      var CTX = LAYER.dyntext;
      var fs = 18;
      CTX.font = fs + "px Garamond";
      CTX.fillStyle = "#F00";
      CTX.shadowColor = "#A00";
      CTX.fillText("Press ENTER to continue to the next level", TITLE.stack.x, TITLE.stack.y + 40);
      GAME.levelCompleted = true;
      GAME.score += GAME.timeBonus;
      TITLE.score();
      ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.nextLevel, "enter"));
    }
    GAME.timeLeft--;
    GAME.timeLeft = Math.max(GAME.timeLeft, 0);
    GAME.timeBonus += INI.TIME_BONUS;
    TITLE.updateBonusTime();
    /** DRAW */
    ENGINE.clearLayerStack();
    CHANGING_ANIMATION.draw();
    BALLISTIC_TG.draw();
    DESTRUCTION_ANIMATION.draw(lapsedTime);
  },
  updateBonusTime() {
    var CTX = LAYER.time;
    ENGINE.clearLayer("time");
    var x = 632;
    var y = 72;
    CTX.fillText(GAME.timeLeft.toString().padStart(3, "0"), x, y);
  },
  levelEndRefresh() {
    const CTX = LAYER.dyntext;
    ENGINE.clearLayer("dyntext");
    const fs = 20;
    CTX.font = fs + "px Garamond";
    CTX.fillStyle = "#CCC";
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 0;
    CTX.textAlign = "left";
    CTX.fillText("Time bonus: " + GAME.timeBonus.toString().padStart(5, "0"), TITLE.stack.x, TITLE.stack.y);
  },
  levelEndTemplate() {
    const width = 350;
    const height = 200;
    const left = Math.floor((ENGINE.gameWIDTH - width) / 2);
    const top = Math.floor((ENGINE.gameHEIGHT - height) / 2);
    const CTX = LAYER.text;
    CTX.fillStyle = "#000";
    CTX.shadowColor = "#000";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.globalAlpha = 0.8;
    CTX.roundRect(left, top, width, height, { upperLeft: 15, upperRight: 15, lowerLeft: 15, lowerRight: 15 }, true, true);
    CTX.textAlign = "center";
    const fs = 20;
    CTX.font = fs + "px Garamond";
    let y = top + fs * 1.5;
    let x = ENGINE.gameWIDTH / 2;
    CTX.fillStyle = "#CCC";
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 0;
    CTX.fillText("Level " + GAME.level + " complete", x, y);
    y += fs * 3;
    x = left + fs;
    CTX.textAlign = "left";
    let lampBonus = HERO.lamp * INI.LAMP_BONUS || 0;
    GAME.score += lampBonus;
    CTX.fillText("Lamp bonus: " + lampBonus.toString().padStart(4, "0"), x, y);
    y += fs * 2;
    TITLE.stack.x = x;
    TITLE.stack.y = y;
  },
  gameOver() {
    ENGINE.clearLayer("text");
    var CTX = LAYER.text;
    CTX.textAlign = "center";
    var x = ENGINE.gameWIDTH / 2;
    var y = ENGINE.gameHEIGHT / 2;
    var fs = 64;
    CTX.font = fs + "px Garamond";
    var txt = CTX.measureText("GAME OVER");
    var gx = x - txt.width / 2;
    var gy = y - fs;
    var grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
    grad.addColorStop("0", "#DDD");
    grad.addColorStop("0.1", "#EEE");
    grad.addColorStop("0.2", "#DDD");
    grad.addColorStop("0.3", "#CCC");
    grad.addColorStop("0.4", "#BBB");
    grad.addColorStop("0.5", "#AAA");
    grad.addColorStop("0.6", "#BBB");
    grad.addColorStop("0.7", "#CCC");
    grad.addColorStop("0.8", "#DDD");
    grad.addColorStop("0.9", "#EEE");
    grad.addColorStop("1", "#DDD");
    CTX.fillStyle = grad;
    CTX.shadowColor = "#FFF";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 3;
    CTX.fillText("GAME OVER", x, y);
  },
  gameWon() {
    const width = 800;
    const height = 520;
    const left = Math.floor((ENGINE.gameWIDTH - width) / 2);
    const top = Math.floor((ENGINE.gameHEIGHT - height) / 2);
    const CTX = LAYER.text;
    CTX.fillStyle = "#000";
    CTX.shadowColor = "#000";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.globalAlpha = 0.85;
    CTX.roundRect(left, top, width, height, { upperLeft: 15, upperRight: 15, lowerLeft: 15, lowerRight: 15 }, true, true);

    CTX.textAlign = "center";
    var fs = 20;
    CTX.font = fs + "px Garamond";
    var y = top + fs * 1.5;
    var x = ENGINE.gameWIDTH / 2;
    CTX.fillStyle = "#CCC";
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 0;
    CTX.fillText("Congratulations!", x, y);
    y += fs * 1.5;
    CTX.fillText("You have completed Anxys.", x, y);
    var delta = 54;
    y += delta;
    const LN = TreasureList.length;
    var xS = ENGINE.spreadAroundCenter(LN, x, delta);
    for (var q = 0; q < LN; q++) {
      ENGINE.spriteDraw("text", xS[q], y, SPRITE[TreasureList[q]]);
    }
    // final image
    y += delta;
    console.log("y", y, 576 - top, 576 - top - y);
  },
  music() {
    AUDIO.Title.play();
  },
};

$(document).ready(function () {
  PRG.INIT();
  PRG.setup();
  ENGINE.LOAD.preload();
  SCORE.init("SC", "Anxys", 10, 25000);
  SCORE.loadHS();
  SCORE.hiScore();
  SCORE.extraLife = [50000, 100000, 200000, 500000, 1000000, Infinity];
  BACKUP_MAP = $.extend(true, {}, MAP);
});
