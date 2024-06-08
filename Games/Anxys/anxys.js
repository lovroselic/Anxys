//console.clear();
/////////////////////////////////////////////////
/*
    
 to do:

 known bugs: 
 

 */
////////////////////////////////////////////////////
const DEBUG = {
  FRAME: 0,
  INF_LIVES: false,
  INF_LAMPS: false,
  FPS: true,
  GRID: true,
  COORD: true,
};

const INI = {
  titleHeight: 120,
  bottomHeight: 40,
  HERO_SPEED: 6,
  MINI_PIX: 5,
  LASER_SPEED_MIN: 16,
  LASER_SPEED_MAX: 32,
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

class Nest {
  constructor(homeGrid, angle) {
    this.homeGrid = homeGrid;
    this.angle = angle;
  }
  static toClass(obj) {
    return new Nest(obj.homeGrid, obj.angle);
  }
  same(grid) {
    if (grid.x === this.homeGrid.x && grid.y === this.homeGrid.y) {
      return true;
    } else return false;
  }
  getDir() {
    var x, y;
    switch (this.angle) {
      case 0:
        x = 0;
        y = -1;
        break;
      case 90:
        x = 1;
        y = 0;
        break;
      case 180:
        x = 0;
        y = 1;
        break;
      case 270:
        x = -1;
        y = 0;
        break;
    }
    return new Vector(x, y);
  }
}



class Gate {
  constructor(homeGrid) {
    this.homeGrid = homeGrid;
  }
  static toClass(obj) {
    return new Gate(obj.homeGrid);
  }
  same(grid) {
    if (grid.x === this.homeGrid.x && grid.y === this.homeGrid.y) {
      return true;
    } else return false;
  }
  value() {
    return 1000;
  }
}

class Key {
  constructor(homeGrid) {
    this.homeGrid = homeGrid;
  }
  static toClass(obj) {
    return new Key(obj.homeGrid);
  }
  same(grid) {
    if (grid.x === this.homeGrid.x && grid.y === this.homeGrid.y) {
      return true;
    } else return false;
  }
  value() {
    return 500;
  }
}

class Treasure {
  constructor(homeGrid) {
    this.homeGrid = homeGrid;
    Treasure.inc();
    this.id = Treasure.count - 1;
  }
  static toClass(obj) {
    return new Treasure(obj.homeGrid);
  }
  static inc() {
    this.count = this.getCount() + 1;
  }
  static dec() {
    this.count = this.getCount() - 1;
  }
  static getCount() {
    return this.count || 0;
  }
  static reset() {
    this.count = 0;
  }
  same(grid) {
    if (grid.x === this.homeGrid.x && grid.y === this.homeGrid.y) {
      return true;
    } else return false;
  }
  value() {
    return 500 * Math.pow(2, this.id);
  }
}

const PRG = {
  VERSION: "1.02.10",
  NAME: "Anxys",
  YEAR: "2018",
  CSS: "color: #239AFF;",
  INIT() {
    console.clear();
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
    //ENGINE.checkProximity = false;
    //ENGINE.checkIntersection = false;
    //ENGINE.INI.COLLISION_SAFE = 50;

    $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);
    ENGINE.addBOX("TITLE", ENGINE.gameWIDTH, ENGINE.titleHEIGHT, ["title", "minimap", "dynamic_map", "key", "score", "time"]);
    ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["background", "static", "hell", "hero", "animation", "enemy", "laser", "explosion", "text", "dyntext", "FPS", "button"]);
    ENGINE.addBOX("DOWN", ENGINE.gameWIDTH, ENGINE.bottomHEIGHT, ["bottom", "lives", "lamp", "bottomText"]);
    ENGINE.addBOX("LEVEL", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["floor", "wall", "nest", "template_static", "template_dynamic", "grid", "coord"]);

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

const HERO = {
  goto(grid) {
    this.moveState.reset(grid);
    HERO.moved = true;
    GRID.gridToSprite(this.moveState.startGrid, HERO.actor);
    ENGINE.VIEWPORT.check(HERO.actor);
    ENGINE.VIEWPORT.alignTo(HERO.actor);

  },
  useLamp() {
    if (!DEBUG.INF_LAMPS) HERO.lamp = false;
    TITLE.lamp();
    ENEMY.killAll();
  },
  manage(lapsedTime) {
    HERO.move(lapsedTime);

  },
  move(lapsedTime) {
    if (HERO.dead) return;
    if (HERO.moveState.moving) {
      GRID.translateMove(HERO, lapsedTime, HERO.moveState.gridArray, true);
      HERO.moved = true;
    }
  },
  changeDirection(dir) {
    if (HERO.moveState.moving) return;
    const nextGrid = HERO.moveState.endGrid.add(dir);

    if (HERO.moveState.gridArray.isEmpty(nextGrid)) {
      HERO.moveState.next(dir);
    } else {

      const valueNext = HERO.moveState.gridArray.getValue(nextGrid);
      const valueThis = HERO.moveState.gridArray.getValue(HERO.moveState.startGrid);
      console.log("value nextGrid", valueNext, "this grid", valueThis);

      if (valueNext === MAPDICT.WALL && valueThis === MAPDICT.WARP) {
        //warp: next 1, this 32
        const IA = MAP[GAME.level].map[BUMP2D.IA];
        const id = IA.unroll(HERO.moveState.startGrid);
        const warp = BUMP2D.show(id);
        const orientation = GRID.same(dir, warp.dir.mirror());
        if (orientation) HERO.goto(warp.destination.waypoint);
        console.warn("warp", id, warp, orientation);
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
    HERO.actor = new ACTOR("Ghosty", 0, 0, "front", ASSET.Ghosty);
    HERO.w2 = Math.floor(HERO.actor.width / 2);
    HERO.h2 = Math.floor(HERO.actor.height / 2);
    HERO.left = HERO.w2;
    HERO.right = MAP[GAME.level].pw - HERO.left;
    HERO.up = HERO.h2;
    HERO.down = MAP[GAME.level].ph - HERO.up;
    HERO.canShoot = false;
    HERO.dead = false;
    HERO.moved = true;
  },
  init() {
    GRID.gridToSprite(MAP[GAME.level].start, HERO.actor);
    HERO.moveState = new MoveState(MAP[GAME.level].start, DOWN, MAP[GAME.level].map.GA);
    ENGINE.VIEWPORT.check(HERO.actor);
    ENGINE.VIEWPORT.alignTo(HERO.actor);
    HERO.hasKey = false;
    //HERO.hasKey = true; //DEBUG

    HERO.moved = true;
    HERO.right = MAP[GAME.level].pw - HERO.left;
    HERO.down = MAP[GAME.level].ph - HERO.up;
    HERO.contMove = false; //
    HERO.canShoot = true;
    HERO.lamp = true;
  },
  shoot(dir) {
    if (!HERO.canShoot) return;
    var check = LASER.check(dir.x);
    if (check) return;
    var y = HERO.actor.y;
    var x = HERO.actor.x + ENGINE.INI.GRIDPIX / 4 * dir.x;
    LASER.pool.push(new Laser(new Point(x, y), dir.x, HERO.homeGrid));
  },
  die() {
    if (HERO.dead) return;
    ENGINE.GAME.stopAnimation = true;
    GAME.timeRemains = GAME.timeLeft;
    HERO.dead = true;
    HERO.canShoot = false;
    HERO.paintDeath();
    GAME.lives--;
    console.log("HERO died!", GAME.lives, "debug", DEBUG.INF_LIVES);
    if (GAME.lives < 0 && !DEBUG.INF_LIVES) {
      console.log("GAME OVER");
      TITLE.gameOver();
      GAME.end();
    } else {
      setTimeout(GAME.levelContinue, INI.DEATH_TIMEOUT);
    }
  },
  paintDeath() {
    ENGINE.clearLayer("hero");
    var CTX = LAYER.hero;
    ENGINE.spriteDraw("hero", HERO.actor.vx, HERO.actor.vy, SPRITE.skull);
    EXPLOSIONS.pool.push(
      new AnimationSPRITE(HERO.actor.x, HERO.actor.y, "ShipExp", 8)
    );
    ENGINE.GAME.stopAnimation = false;
    ENGINE.GAME.run(HERO.deadHeroAnimation);
  },
  deadHeroAnimation() {
    EXPLOSIONS.draw();
    if (EXPLOSIONS.pool.length === 0) {
      ENGINE.GAME.stopAnimation = true;
      ENGINE.clearLayer("explosion");
    }
  }
};

const LASER = {
  pool: [],
  check(dir) {
    var LPL = LASER.pool.length;
    var check = false;
    for (let q = 0; q < LPL; q++) {
      if (LASER.pool[q].direction === dir) {
        check = true;
        break;
      }
    }
    return check;
  },
  draw() {
    var LPL = LASER.pool.length;
    if (LPL === 0) return;
    ENGINE.layersToClear.add("laser");
    var CTX = LAYER.laser;
    CTX.strokeStyle = "#F00";
    for (let q = LPL - 1; q >= 0; q--) {
      LASER.pool[q].draw(CTX);
      if (LASER.pool[q].done) {
        LASER.pool.splice(q, 1);
        break;
      }
      LASER.pool[q].evolve();
    }
  }
};

class Laser {
  constructor(origin, direction, homeGrid) {
    this.origin = origin;
    this.direction = direction;
    this.homeGrid = homeGrid;
    this.speed = INI.LASER_SPEED_MAX;
    this.end = new Point(origin.x + INI.LASER_START * direction, origin.y);
    this.finalX = this.checkFinal();
    this.done = false;
  }
  checkFinal() {
    var gridX;
    var obstacle = false;
    for (let q = 1; q <= INI.LASER_GRID_LENGTH; q++) {
      gridX = q * this.direction + this.homeGrid.x;
      if (
        GRID.isBlock(gridX, this.homeGrid.y) ||
        GRID.isDoor(gridX, this.homeGrid.y)
      ) {
        if (this.direction === -1) gridX++;
        obstacle = true;
        break;
      }
      if (gridX < 0 || gridX > MAP[GAME.level].width - 1) break;
    }
    if (this.direction === 1 && !obstacle) gridX++;
    if (gridX < 0) gridX = 0;
    if (gridX > MAP[GAME.level].width) gridX = MAP[GAME.level].width;
    var piX = gridX * ENGINE.INI.GRIDPIX;
    if (this.direction === 1) piX--;
    return piX;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(
      this.origin.x - ENGINE.VIEWPORT.vx,
      this.origin.y - ENGINE.VIEWPORT.vy
    );
    ctx.lineTo(
      this.end.x - ENGINE.VIEWPORT.vx,
      this.end.y - ENGINE.VIEWPORT.vy
    );
    ctx.closePath();
    ctx.stroke();
  }
  evolve() {
    this.origin.x += this.direction * INI.LASER_SPEED_MIN;
    this.end.x += this.direction * INI.LASER_SPEED_MAX;
    switch (this.direction) {
      case -1:
        if (this.end.x < this.finalX) {
          this.end.x = this.finalX;
          this.done = true;
        }
        break;
      case 1:
        if (this.end.x > this.finalX) {
          this.end.x = this.finalX;
          this.done = true;
        }
        break;
      default:
        console.log(this, "evolve direction ERROR");
    }
  }
}
class MonsterClass {
  constructor(type, grid, sprite, dir, speed, foreSight, probability, score) {
    this.type = type;
    this.homeGrid = new Vector(grid.x, grid.y);
    this.dir = new Vector(dir.x, dir.y);
    this.prevDir = new Vector(0, 0);
    this.speed = speed;
    this.foreSight = foreSight;
    this.probability = probability;
    this.score = score;
    this.actor = new ACTOR(sprite, 0, 0, "front", ASSET[sprite]);
    GRID.gridToSprite(this.homeGrid, this.actor);
    this.actor.orientation = this.actor.getOrientation(this.dir);
    this.actor.animateMove(this.actor.orientation);
    this.moves = true;
    this.gotoGrid = new Vector(
      this.homeGrid.x + this.dir.x,
      this.homeGrid.y + this.dir.y
    );
    this.history = [];
    this.dirStack = [];
    this.nextGrid = this.gotoGrid;
  }
}

const NEST = {
  canSpawn: false,
  timeout() {
    NEST.canSpawn = false;
    setTimeout(function () {
      NEST.canSpawn = true;
    }, INI.SPAWN_DELAY);
  },
  manage() {
    if (ENEMY.pool.length >= INI.MAX_ENEMIES) return;
    if (!NEST.canSpawn) return;
    var nest = NEST.selectNest();
    if (nest) {
      var type = DEFINE[GAME.level].enemy.chooseRandom();
      ENEMY.pool.push(
        new MonsterClass(
          type,
          nest.homeGrid,
          type,
          nest.getDir(),
          EnemyList[type].speed,
          EnemyList[type].foreSight,
          EnemyList[type].probability,
          EnemyList[type].score
        )
      );
      NEST.timeout();
    }
  },
  selectNest() {
    var nests = NEST.findVisible();
    var NPL = nests.length;
    for (let q = NPL - 1; q >= 0; q--) {
      if (!NEST.isFree(nests[q])) {
        nests.splice(q, 1);
      }
    }
    NPL = nests.length;
    if (NPL > 1) {
      for (let q = 0; q < NPL; q++) {
        nests[q].distance = NEST.distance(nests[q]);
      }
      removeDistant(nests);
    }
    return nests.chooseRandom();

    function sortDistance(a, b) {
      return a.distance - b.distance;
    }
    function removeDistant(arr) {
      arr.sort(sortDistance);
      var min = NEST.distance(arr[0]);
      var q;
      for (q = 1; q < arr.length; q++) {
        if (arr[q].distance > min) break;
      }
      arr.length = q;
    }
  },
  distance(nest) {
    return (
      Math.abs(HERO.homeGrid.x - nest.homeGrid.x) +
      Math.abs(HERO.homeGrid.y - nest.homeGrid.y)
    );
  },
  findVisible() {
    var nest = MAP[GAME.level].nest;
    var visible = [];
    var NL = nest.length;
    var minX = Math.floor(ENGINE.VIEWPORT.vx / ENGINE.INI.GRIDPIX);
    var maxX = minX + ENGINE.gameWIDTH / ENGINE.INI.GRIDPIX - 1;
    for (let q = 0; q < NL; q++) {
      if (nest[q].homeGrid.x >= minX && nest[q].homeGrid.x <= maxX) {
        visible.push(nest[q]);
      }
    }
    return visible;
  },
  isFree(nest) {
    var free = true;
    var EPL = ENEMY.pool.length;
    for (let q = 0; q < EPL; q++) {
      if (nest.same(ENEMY.pool[q].homeGrid)) {
        free = false;
        break;
      }
    }
    return free;
  }
};

const ENEMY = {
  pool: [],
  collideHero() {
    var EPL = ENEMY.pool.length;
    for (let q = 0; q < EPL; q++) {
      let hit = ENGINE.collision(HERO.actor, ENEMY.pool[q].actor);
      if (hit) HERO.die();
    }
  },
  killAll() {
    var EPL = ENEMY.pool.length;
    for (let q = EPL - 1; q >= 0; q--) {
      let enemy = ENEMY.pool[q];
      EXPLOSIONS.pool.push(
        new AnimationSPRITE(enemy.actor.x, enemy.actor.y, "AlienExp", 6)
      );
      GAME.score += enemy.score;
    }
    ENEMY.pool.clear();
  },
  collideLaser() {
    var EPL = ENEMY.pool.length;
    if (EPL === 0) return;
    for (let q = EPL - 1; q >= 0; q--) {
      let enemy = ENEMY.pool[q];
      let tempActor = {
        name: enemy.actor.name,
        x: enemy.actor.x - ENGINE.VIEWPORT.vx,
        y: enemy.actor.y - ENGINE.VIEWPORT.vy,
        width: enemy.actor.width,
        height: enemy.actor.height
      };
      let hit = ENGINE.collisionToBackground(tempActor, LAYER.laser);
      if (hit) {
        EXPLOSIONS.pool.push(
          new AnimationSPRITE(enemy.actor.x, enemy.actor.y, "AlienExp", 6)
        );
        GAME.score += enemy.score;
        ENEMY.pool.splice(q, 1);
      }
    }
  },
  draw() {
    var EPL = ENEMY.pool.length;
    if (EPL === 0) return;
    var CXT = LAYER.enemy;
    ENGINE.layersToClear.add("enemy");
    for (let q = 0; q < EPL; q++) {
      ENGINE.spriteDraw(
        "enemy",
        ENEMY.pool[q].actor.x - ENGINE.VIEWPORT.vx,
        ENEMY.pool[q].actor.y - ENGINE.VIEWPORT.vy,
        ENEMY.pool[q].actor.sprite()
      );
    }
  },
  move() {
    var EPL = ENEMY.pool.length;
    if (EPL === 0) return;
    for (let q = EPL - 1; q >= 0; q--) {
      if (isInvisible(ENEMY.pool[q])) {
        ENEMY.pool.splice(q, 1);
      }
    }
    //
    EPL = ENEMY.pool.length;
    for (let q = 0; q < EPL; q++) {
      var enemy = ENEMY.pool[q];
      if (enemy.moves) {
        move(enemy);
      } else {
        if (enemy.dirStack && enemy.dirStack.length > 0) {
          let go = enemy.dirStack.shift();
          commitMove(enemy, new Direction(go, 1));
          return;
        } else {
          if (enemy.history.length >= 4) {
            if (checkHistory(enemy.history)) {
              enemy.dirStack = findPath(enemy.homeGrid, HERO.homeGrid);
              if (enemy.dirStack === null) {
              } else {
                let go = enemy.dirStack.shift();
                commitMove(enemy, new Direction(go, 1));
                return;
              }
            }
          }
          var directions = getDirections(enemy.homeGrid);
          if (directions.length > 1) {
            for (let w = 0; w < EPL; w++) {
              if (w === q) continue;
              var comrade = ENEMY.pool[w];
              var DL = directions.length;
              for (let dr = 0; dr < DL; dr++) {
                if (comrade.nextGrid) {
                  if (
                    enemy.homeGrid.x + directions[dr].dir.x ===
                    comrade.nextGrid.x &&
                    enemy.homeGrid.y + directions[dr].dir.y ===
                    comrade.nextGrid.y
                  ) {
                    directions[dr].weight++;
                  }
                }
              }
            }
            cullHeavy(directions);
          }
          var goal = enemy.homeGrid.directionSolutions(HERO.homeGrid);
          var index = -1;
          if (probable(enemy.probability)) {
            for (var i = 0; i < goal.length; i++) {
              index = goal[i].isInAt(directions);
              if (index !== -1) break;
            }
          }
          if (index === -1) {
            if (directions.length > 1) {
              var remove = enemy.prevDir.isInAt(directions);
              if (remove !== -1) {
                directions.splice(remove, 1);
              }
            }
            index = RND(0, directions.length - 1);
          }

          var len = Math.min(directions[index].len, RND(1, enemy.foreSight));
          directions[index].len = len;
          commitMove(enemy, directions[index]);
        }
      }
    }
    return;

    function findPath(start, finish) {
      var Q = new NodeQ();
      Q.list.push(new SearchNode(start, finish, [new Vector(0, 0)]));
      if (Q.list[0].dist === 0) return null;
      var round = 1;
      var perfect = Q.list[0].dist;
      var selected;
      while (Q.list.length > 0) {
        selected = Q.list.shift();
        let dirs = getDirections(selected.grid);
        let back = selected.prevDir[selected.prevDir.length - 1].mirror();
        let iB = back.isInAt(dirs);
        if (iB !== -1) {
          let waste = dirs.splice(iB, 1);
        }
        for (let q = 0; q < dirs.length; q++) {
          let HG = new Vector(
            selected.grid.x + dirs[q].dir.x,
            selected.grid.y + dirs[q].dir.y
          );
          let I_stack = [].concat(selected.prevDir);
          I_stack.push(dirs[q].dir);
          let node = new SearchNode(HG, finish, I_stack, selected.path + 1);
          if (node.dist === 0) {
            node.prevDir.splice(0, 1);
            return node.prevDir;
          }
          if (node.priority < perfect + INI.PATH_TOLERANCE) Q.queue(node);
        }
        round++;
        if (round > INI.PATH_ROUNDS) break;
      }
      if (Q.list.length > 0) {
        Q.list[0].prevDir.splice(0, 1);
        return Q.list[0].prevDir;
      } else {
        selected.prevDir.splice(0, 1);
        return selected.prevDir;
      }
    }

    function checkHistory(history) {
      let analysis = analyzeHistory(history);
      let stuck = isStuck(analysis);
      if (stuck) {
        history.clear();
      } else {
        var i = analysis.lastIndexOf("*");
        if (i > -1) {
          history.splice(0, i + 2);
        } else history.clear();
      }
      return stuck;
    }

    function isStuck(arr) {
      //return evaluateArray(arr, 3, "*");
      return evaluateArray(arr, 2, "*");

      function evaluateArray(arr, count, element) {
        var i = arr.indexOf(element);
        if (i === -1) return false;
        var j;
        var result = true;
        count--;
        while (count > 0) {
          j = arr.indexOf(element, i + 1);
          if (j !== i + 1) {
            result = false;
            break;
          }
          count--;
          i = j;
        }
        return result;
      }
    }

    function analyzeHistory(history) {
      var analysis = [];
      for (let q = 0; q < history.length - 1; q++) {
        let x =
          history[q].dir.x * history[q].len +
          history[q + 1].dir.x * history[q + 1].len;
        let y =
          history[q].dir.y * history[q].len +
          history[q + 1].dir.y * history[q + 1].len;
        if (x === 0 && y === 0) {
          analysis.push("*");
        } else analysis.push("OK");
      }
      return analysis;
    }

    function commitMove(enemy, direction) {
      enemy.gotoGrid = new Vector(
        enemy.homeGrid.x + direction.dir.x * direction.len,
        enemy.homeGrid.y + direction.dir.y * direction.len
      );
      enemy.nextGrid = new Vector(
        enemy.homeGrid.x + direction.dir.x,
        enemy.homeGrid.y + direction.dir.y
      );
      enemy.prevDir = enemy.dir;
      enemy.dir = new Vector(direction.dir.x, direction.dir.y);
      enemy.moves = true;
      enemy.history.push(direction);
    }

    function isInvisible(enemy) {
      var minX =
        Math.floor(ENGINE.VIEWPORT.vx / ENGINE.INI.GRIDPIX) -
        INI.ENEMY_VISIBILITY_TOLERANCE;
      var maxX =
        minX +
        ENGINE.gameWIDTH / ENGINE.INI.GRIDPIX -
        1 +
        INI.ENEMY_VISIBILITY_TOLERANCE;
      if (enemy.homeGrid.x < minX || enemy.homeGrid.x > maxX) {
        return true;
      } else return false;
    }

    function move(enemy) {
      enemy.actor.x += enemy.dir.x * enemy.speed;
      enemy.actor.y += enemy.dir.y * enemy.speed;
      enemy.actor.orientation = enemy.actor.getOrientation(enemy.dir);
      enemy.actor.animateMove(enemy.actor.orientation);
      if (arrived(enemy)) {
        enemy.moves = false;
        enemy.homeGrid = enemy.gotoGrid;
        enemy.gotoGrid = null;
        enemy.nextGrid = null;
      } else {
        var GRD = GRID.trueToGrid(enemy.actor);
        if (GRD !== null) {
          enemy.homeGrid = GRD;
          enemy.nextGrid = new Vector(
            enemy.homeGrid.x + enemy.dir.x,
            enemy.homeGrid.y + enemy.dir.y
          );
        }
      }
    }

    function arrived(enemy) {
      var goal = GRID.gridToCenterPX(enemy.gotoGrid);
      if (enemy.actor.x === goal.x && enemy.actor.y === goal.y) {
        return true;
      } else return false;
    }
    function getDirections(grid) {
      var directions = [];
      for (let D = 0; D < ENGINE.directions.length; D++) {
        var i;
        for (i = 0; i < INI.MAX_FORESIGHT; i++) {
          let x = grid.x + ENGINE.directions[D].x * (i + 1);
          let y = grid.y + ENGINE.directions[D].y * (i + 1);
          if (
            x < 0 ||
            y < 0 ||
            x >= MAP[GAME.level].width ||
            y >= MAP[GAME.level].height
          )
            break;
          if (GRID.isBlock(x, y)) break;
          if (GRID.isDoor(x, y)) break;
        }
        if (i > 0) directions.push(new Direction(ENGINE.directions[D], i));
      }
      return directions;
    }

    function cullHeavy(arr) {
      arr.sort(sortWeight);
      removeHeavy(arr);
    }

    function sortWeight(a, b) {
      return a.weight - b.weight;
    }

    function removeHeavy(arr) {
      let last = arr.length - 1;
      if (arr.length > 1 && arr[last].weight > arr[last - 1].weight)
        arr.splice(last, 1);
      if (arr.length > 1 && arr[0].weight < arr[1].weight) arr.splice(1, last);
    }
  }
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

    $("#pause").prop("disabled", false);
    $("#pause").off();
    GAME.paused = true;
    ENGINE.watchVisibility(GAME.lostFocus);
    ENGINE.GAME.start(16);
    GAME.fps = new FPS_short_term_measurement(300);
    GAME.extraLife = SCORE.extraLife.clone();
    GAME.prepareForRestart();                             //everything required for safe restart
    GAME.level = 1;                                       //default
    GAME.score = 0;
    GAME.lives = 4;                                       //DEFAULT

    HERO.startInit();
    GAME.levelStart(GAME.level);
  },
  prepareForRestart() {
    //everything required for safe restart
    let clear = ["background", "text", "FPS", "button", "bottomText"];
    ENGINE.clearManylayers(clear);
    MAP = $.extend(true, {}, BACKUP_MAP);
  },
  /* levelContinue() {
    console.log("LEVEL", GAME.level, "continues ...");
    HERO.dead = false;
    ENEMY.pool.clear();
    LASER.pool.clear();
    GRID.gridToSprite(HERO.homeGrid, HERO.actor);
    ENGINE.VIEWPORT.alignTo(HERO.actor);
    HERO.moved = true;
    GAME.firstFrameDraw(GAME.level);
    NEST.timeout();
    HERO.canShoot = true;
    ENGINE.GAME.stopAnimation = false;
    GAME.timeStart = Date.now();
    ENGINE.GAME.run(GAME.run);
  }, */
  async levelStart(level) {
    console.log("starting level", level);
    GAME.levelCompleted = false;
    ENGINE.VIEWPORT.reset();
    await GAME.initLevel(level);
    GAME.firstFrameDraw(level);
    GAME.timer = new CountDown("gameTime", DEFINE[GAME.level].time, GAME.timeIsUp);
    GAME.resume();

    /* HERO.init();
    NEST.timeout();
    ENEMY.pool.clear();
    LASER.pool.clear();
    HERO.canShoot = true;
    HERO.lamp = true;
    GAME.firstFrameDraw(GAME.level);
    GAME.timeRemains = DEFINE[GAME.level].time;
    GAME.levelCompleted = false;
    GAME.timeStart = Date.now();
    ENGINE.GAME.stopAnimation = false;
    ENGINE.GAME.run(GAME.run); */
  },
  timeIsUp() {
    console.error("TIME ENDS");
    HERO.canShoot = false;
  },
  nextLevel() {
    GAME.level++;
    console.log("creating next level: ", GAME.level);
    ENGINE.clearLayer("text");
    ENGINE.clearLayer("dyntext");
    if (GAME.level > INI.LAST_LEVEL) {
      ENGINE.GAME.stopAnimation = true;
      console.log("game have been won. please code the end you lazy bastard.");
      ENGINE.clearLayer("hero");
      TITLE.gameWon();
      GAME.end();
    } else GAME.levelStart();
  },
  levelEnd() {
    console.log("level ", GAME.level, " ended.");
    HERO.canShoot = false;
    ENGINE.GAME.stopAnimation = true;
    TITLE.levelEndTemplate();
    GAME.timeBonus = 0;

    setTimeout(function () {
      ENGINE.GAME.stopAnimation = false;
      ENGINE.GAME.run(TITLE.run);
    }, ENGINE.INI.ANIMATION_INTERVAL * 2);
  },
  async initLevel(level) {
    console.log("init level", level);
    console.time("init");

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
    //await BITMAP.store(LAYER.floor.canvas, "maze");

    HERO.init();
    BUMP2D.init(MAP[level].map);

    SPAWN.spawn(MAP[level]);
    BUMP2D.manage();

    //drawing of statics
    BUMP2D.draw();

    await ENGINE.flattenLayers("nest", "floor");


    await BITMAP.store(LAYER.floor.canvas, "maze");

    console.timeEnd("init");
    console.log("MAP", MAP[level]);
    /* 
        for (let z = 0; z <= MAP[level].nest.length - 1; z++) {
          MAP[level].nest[z] = Nest.toClass(MAP[level].nest[z]);
        }
        for (let z = 0; z <= MAP[level].warp.length - 1; z++) {
          MAP[level].warp[z] = Warp.toClass(MAP[level].warp[z]);
        }
    
        for (let z = 0; z <= MAP[level].door.length - 1; z++) {
          MAP[level].door[z] = Gate.toClass(MAP[level].door[z]);
        }
        for (let z = 0; z <= MAP[level].key.length - 1; z++) {
          MAP[level].key[z] = Key.toClass(MAP[level].key[z]);
        }
        Treasure.reset();
        for (let z = 0; z <= MAP[level].treasure.length - 1; z++) {
          MAP[level].treasure[z] = Treasure.toClass(MAP[level].treasure[z]);
        } */
  },
  updateVieport() {
    if (!ENGINE.VIEWPORT.changed) return;
    ENGINE.VIEWPORT.changeFromBitmap("maze", "background");
    //ENGINE.VIEWPORT.change("wall", "background");
    //ENGINE.clearLayer("static");
    //ENGINE.VIEWPORT.change("template_static", "static");
    ENGINE.VIEWPORT.changed = false;
  },
  updateStatic(level) {
    level = level || GAME.level;
    ENGINE.clearLayer("template_static");
    GRID.paintDoor(MAP[level].door, "template_static", false);
    GRID.paintKey(MAP[level].key, "template_static", false);
    GRID.paintTreasure(
      MAP[level].treasure,
      "template_static",
      false,
      TreasureList
    );
  },
  drawAnimation() {
    TEXTPOOL.draw("animation");
    SpritePOOL.draw("animation");
  },
  firstFrameDraw(level) {
    console.log("drawing first frame");
    ENGINE.clearLayerStack();
    ENGINE.VIEWPORT.changed = true;
    GAME.updateVieport();
    TITLE.main();


    if (DEBUG.GRID) GRID.grid();
    if (DEBUG.COORD) GRID.paintCoord("coord", MAP[GAME.level].map);
    /*     GRID.repaint(
          MAP[level].grid,
          SPRITE[MAP[level].floor],
          SPRITE[MAP[level].background]
        );
        GRID.paintNest(MAP[level].nest, "nest", true);
        GRID.paintWarp(MAP[level].warp, "nest", false);
        ENGINE.flattenLayers("wall", "floor");
        ENGINE.flattenLayers("nest", "floor");
        GAME.updateStatic(level);
        ENGINE.VIEWPORT.changed = true;
        GAME.updateVieport();
        TITLE.main();
        TITLE.lives();
        TITLE.lamp();
        HERO.draw();
        MINIMAP.draw(); */
  },
  wait() {
    if (ENGINE.GAME.stopAnimation) return;
    var map = ENGINE.GAME.keymap;
    if (map[ENGINE.KEY.map.enter]) {
      if (GAME.levelCompleted) {
        ENGINE.GAME.stopAnimation = true;
        GAME.levelCompleted = false;
        GAME.nextLevel();
      }
      ENGINE.GAME.keymap[ENGINE.KEY.map.enter] = false;
      return;
    }
  },
  run(lapsedTime) {
    //GAME.run() template
    if (ENGINE.GAME.stopAnimation) return;

    HERO.manage(lapsedTime);
    //do all game loop stuff here
    //GAME.respond();
    //HERO.update();
    //NEST.manage();
    // ENEMY.move();
    //ENEMY.collideLaser();
    //ENEMY.collideHero();
    GAME.respond();
    ENGINE.TIMERS.update();
    GAME.frameDraw(lapsedTime);
  },
  frameDraw(lapsedTime) {
    ENGINE.clearLayerStack();
    GAME.updateVieport();
    HERO.draw();
    TITLE.updateTime();
    //
    //
    //GAME.drawAnimation();
    //ENEMY.draw();
    //LASER.draw();
    //EXPLOSIONS.draw();
    //MINIMAP.refresh();
    //TITLE.score();
    //TITLE.updateTime();
    if (DEBUG.FPS) GAME.FPS(lapsedTime);
  },
  respond() {
    //GAME.respond() template
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

    /* if (HERO.contMove) HERO.move(HERO.dir);
    return; */
  },
  setup() {
    console.log("GAME SETUP started");
  },
  end() {
    console.log("GAME ENDED");
    //check score
    GAME.checkScore();
  },
  checkScore() {
    setTimeout(function () {
      SCORE.checkScore(GAME.score);
      SCORE.hiScore();
      TITLE.main();
      $("#startGame").removeClass("hidden");
      GAME.restarted = true;
    }, 1000);
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
};

const TITLE = {
  startTitle() {
    console.log("starting title");
    ENGINE.clearManylayers([]);
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
    var CTX = LAYER.key;
    var x = 432;
    var y = 32;
    var h = 60;
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
  run() {
    if (ENGINE.GAME.stopAnimation) return;
    TITLE.levelEndRefresh();
    if (GAME.timeLeft <= 0) {
      ENGINE.GAME.stopAnimation = true;

      setTimeout(function () {
        var CTX = LAYER.dyntext;
        var fs = 18;
        CTX.font = fs + "px Garamond";
        CTX.fillStyle = "#F00";
        CTX.shadowColor = "#A00";
        CTX.fillText(
          "Press ENTER to continue to the next level",
          TITLE.stack.x,
          TITLE.stack.y + 40
        );
        GAME.levelCompleted = true;
        GAME.score += GAME.timeBonus;
        TITLE.score();

        setTimeout(function () {
          ENGINE.GAME.stopAnimation = false;
          ENGINE.GAME.run(GAME.wait);
        }, ENGINE.INI.ANIMATION_INTERVAL * 2);
      }, ENGINE.INI.ANIMATION_INTERVAL * 2);
      return;
    }
    GAME.timeLeft--;
    GAME.timeBonus += INI.TIME_BONUS;
    TITLE.updateBonusTime();
  },
  updateBonusTime() {
    var CTX = LAYER.time;
    ENGINE.clearLayer("time");
    var x = 632;
    var y = 72;
    CTX.fillText(GAME.timeLeft.toString().padLeft(3, "0"), x, y);
  },
  levelEndRefresh() {
    var CTX = LAYER.dyntext;
    ENGINE.clearLayer("dyntext");
    var fs = 20;
    CTX.font = fs + "px Garamond";
    CTX.fillStyle = "#CCC";
    CTX.shadowColor = "yellow";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 0;
    CTX.textAlign = "left";
    CTX.fillText(
      "Time bonus: " + GAME.timeBonus.toString().padLeft(5, "0"),
      TITLE.stack.x,
      TITLE.stack.y
    );
  },
  levelEndTemplate() {
    var width = 350;
    var height = 200;
    var left = Math.floor((ENGINE.gameWIDTH - width) / 2);
    var top = Math.floor((ENGINE.gameHEIGHT - height) / 2);
    var CTX = LAYER.text;
    CTX.fillStyle = "#000";
    CTX.shadowColor = "#000";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.globalAlpha = 0.8;
    CTX.roundRect(
      left,
      top,
      width,
      height,
      {
        upperLeft: 15,
        upperRight: 15,
        lowerLeft: 15,
        lowerRight: 15
      },
      true,
      true
    );

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
    CTX.fillText("Level " + GAME.level + " complete", x, y);
    y += fs * 3;
    x = left + fs;
    CTX.textAlign = "left";
    let lampBonus = HERO.lamp * INI.LAMP_BONUS || 0;
    GAME.score += lampBonus;
    CTX.fillText("Lamp bonus: " + lampBonus.toString().padLeft(4, "0"), x, y);
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
    var width = 350;
    var height = 200;
    var left = Math.floor((ENGINE.gameWIDTH - width) / 2);
    var top = Math.floor((ENGINE.gameHEIGHT - height) / 2);
    var CTX = LAYER.text;
    CTX.fillStyle = "#000";
    CTX.shadowColor = "#000";
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.shadowBlur = 0;
    CTX.globalAlpha = 0.8;
    CTX.roundRect(
      left,
      top,
      width,
      height,
      {
        upperLeft: 15,
        upperRight: 15,
        lowerLeft: 15,
        lowerRight: 15
      },
      true,
      true
    );

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
    var xS = ENGINE.spreadAroundCenter(4, x, delta);
    for (var q = 0; q < 4; q++) {
      ENGINE.spriteDraw("text", xS[q], y, SPRITE[TreasureList[q]]);
    }
  },
  music() {
    AUDIO.Title.play();
  },
};

/* var MINIMAP = {
  x: 164,
  y: 32,
  draw() {
    var CTX = LAYER.minimap;
    ENGINE.clearLayer("minimap");
    CTX.fillStyle = "#666";
    var grid = MAP[GAME.level].grid;
    const height = grid.length;
    const width = grid[0].length;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        if (grid[y].charAt(x) === "1") {
          CTX.pixelAt(
            MINIMAP.x + x * INI.MINI_PIX,
            MINIMAP.y + y * INI.MINI_PIX,
            INI.MINI_PIX
          );
        }
      }
    }
  },
  refresh() {
    var CTX = LAYER.dynamic_map;
    ENGINE.clearLayer("dynamic_map");
    var EPL = ENEMY.pool.length;
    for (let q = 0; q < EPL; q++) {
      CTX.fillStyle = "#F00";
      CTX.pixelAt(
        MINIMAP.x + ENEMY.pool[q].homeGrid.x * INI.MINI_PIX,
        MINIMAP.y + ENEMY.pool[q].homeGrid.y * INI.MINI_PIX,
        INI.MINI_PIX
      );
    }
    CTX.fillStyle = "#00F";
    CTX.pixelAt(
      MINIMAP.x + HERO.homeGrid.x * INI.MINI_PIX,
      MINIMAP.y + HERO.homeGrid.y * INI.MINI_PIX,
      INI.MINI_PIX
    );
    CTX.strokeStyle = "yellow";
    var factor = INI.MINI_PIX / ENGINE.INI.GRIDPIX;
    CTX.strokeRect(
      MINIMAP.x + ENGINE.VIEWPORT.vx * factor - 1,
      MINIMAP.y + ENGINE.VIEWPORT.vy * factor - 1,
      ENGINE.gameWIDTH * factor + 1,
      ENGINE.gameHEIGHT * factor + 1
    );
  }
}; */

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
