//////////////////engine.js/////////////////////////
//  ENGINE version 1.50 by LS
//  MAP renderer from Princess, CastleHaunt
//  removed: --> LEVEL renderer version 1.00 from ScramblyX by LS
//  PATTERN generator from SramblyX LS
//  MATERIAL generator from The Princess Wants Everything by LS
//  used by ScramblyX, CastleHunt; backwards incompatible changed ENGINE.alert functions
//  used by Anxys
//
///////////////////////////////////////////////////
var ENGINE = {
  VERSION: "1.50.01",
  INI: {
    STDW: 360,
    STDH: 72,
    STC: 64,
    DOORW: 60,
    DOORH: 54,
    DOORC: 12,
    ANIMATION_INTERVAL: 17,
    SPRITESHEET_HEIGHT: 48,
    SPRITESHEET_DEFAULT_WIDTH: 48,
    sprite_maxW: 300,
    sprite_maxH: 100,
    GRIDPIX: 48,
    FADE_FRAMES: 30,
    COLLISION_SAFE: 64
  },
  readyCall: null,
  SOURCE: "/Games/AA/",
  checkIntersection: true, //use linear intersection collision method after pixelperfect collision; set to false to exclude
  checkProximity: true, //check proximity before pixel perfect evaluation of collision to background
  SRC_rel: "/Games/AA/",
  LOAD_W: 202,
  LOAD_H: 22,
  gameWindowId: "#game",
  gameWIDTH: 960,
  gameHEIGHT: 768,
  mapWIDTH: 512,
  statusWIDTH: 312,
  currentTOP: 0,
  currentLEFT: 0,
  directions: [LEFT, UP, RIGHT, DOWN],
  layersToClear: new Set(),
  disableKey: function(key){
    $(document).keypress(function(event) {
      if (event.which === ENGINE.KEY.map[key]) {
        event.preventDefault();
      }
    });
    $(document).keydown(function(event) {
      if (event.which === ENGINE.KEY.map[key]) {
        event.preventDefault();
      }
    });
    $(document).keyup(function(event) {
      if (event.which === ENGINE.KEY.map[key]) {
        event.preventDefault();
      }
    });
  },
  disableArrows: function() {
    ENGINE.disableKey("up");
    ENGINE.disableKey("down");
  },
  preLoadImages: function() {
    console.log("loading images ...");
    ENGINE.count = 0;
    ENGINE.spriteCount = 0;
    ENGINE.tileGraphics = [];
    var fileNames = getImgFileNames();
    ENGINE.HMI = fileNames.length;
    for (var ix = 0; ix < ENGINE.HMI; ix++) {
      ENGINE.tileGraphics[ix] = new Image();
      ENGINE.tileGraphics[ix].onload = cnt;
      ENGINE.tileGraphics[ix].crossOrigin = "Anonymous";
      ENGINE.tileGraphics[ix].src = fileNames[ix].filename;
      $("#preload").append(
        "<img id='" +
          fileNames[ix].id +
          "' src='" +
          fileNames[ix].filename +
          "' crossOrigin='Anonymous'/>"
      );
    }
    return;

    function cnt() {
      ENGINE.count++;
      ENGINE.drawLoadingGraph(ENGINE.count, ENGINE.HMI, "Loading");

      if (ENGINE.count === ENGINE.HMI) {
        ENGINE.imagesLoaded = true;
        ENGINE.tileToImage(); //Creates generic SPRITE.tileName objects
        ENGINE.expandSprites(); //Creates SPRITEs from spriteSheets
        ENGINE.createSprites(); //Creates special rotated SPRITEs
        //ENGINE.expandSprites(); //Creates SPRITEs from spriteSheets
        ASSETS.build();
      }
    }

    function getImgFileNames() {
      var fileNames = [];
      for (var prop in World) {
        var LN = World[prop].length;
        if (LN) {
          for (var ix = 0; ix < LN; ix++) {
            var name =
              ENGINE.SOURCE + World[prop][ix].id + "." + World[prop][ix].type;
            fileNames.push({
              id: World[prop][ix].id,
              filename: name
            });
          }
        }
      }
      return fileNames;
    }
  },
  expandSprites: function() {
    var spriteSheet;
    for (var prop in World) {
      var LN = World[prop].length;
      if (LN) {
        for (var ix = 0; ix < LN; ix++) {
          if (World[prop][ix].sheet) {
            spriteSheet = $("#" + World[prop][ix].id)[0];
            var CTX = LAYER.temp;
            var NTX = LAYER.temp2;
            CTX.canvas.width = spriteSheet.width;
            CTX.canvas.height = spriteSheet.height;
            ENGINE.draw("temp", 0, 0, spriteSheet);
            var x;
            var data, imgDATA;
            var newName;
            for (var q = 0; q < World[prop][ix].no; q++) {
              x = q * ENGINE.INI.SPRITESHEET_DEFAULT_WIDTH;
              data = CTX.getImageData(
                x,
                0,
                ENGINE.INI.SPRITESHEET_DEFAULT_WIDTH,
                ENGINE.INI.SPRITESHEET_HEIGHT
              );

              NTX.canvas.width = ENGINE.INI.SPRITESHEET_DEFAULT_WIDTH;
              NTX.canvas.height = ENGINE.INI.SPRITESHEET_HEIGHT;
              NTX.putImageData(data, 0, 0); //untrimmed sprite painted on temp2

              imgDATA = NTX.getImageData(
                0,
                0,
                ENGINE.INI.SPRITESHEET_DEFAULT_WIDTH,
                ENGINE.INI.SPRITESHEET_HEIGHT
              );
              var TRIM = ENGINE.trimCanvas(imgDATA);
              var trimmed = NTX.getImageData(
                TRIM.left,
                TRIM.top,
                TRIM.right - TRIM.left,
                TRIM.bottom - TRIM.top
              );
              NTX.canvas.width = TRIM.right - TRIM.left;
              NTX.canvas.height = TRIM.bottom - TRIM.top;
              NTX.putImageData(trimmed, 0, 0); //trimmed sprite painted on temp2

              newName = World[prop][ix].name + "_" + q;
              SPRITE[newName] = new Image();
              SPRITE[newName].crossOrigin = "Anonymous";
              SPRITE[newName].src = NTX.canvas.toDataURL("image/png");
              SPRITE[newName].width = NTX.canvas.width;
              SPRITE[newName].height = NTX.canvas.height;
            }
          }
        }
      }
    }
  },
  init: function() {
    console.log("Initializing ENGINE V", String(ENGINE.VERSION));
    LAYER = {};
    SPRITE = {};
    ASSET = {};
    $("#temp").append(
      "<canvas id ='temp_canvas' width='" +
        ENGINE.INI.sprite_maxW +
        "' height='" +
        ENGINE.INI.sprite_maxH +
        "'></canvas>"
    );
    $("#temp2").append(
      "<canvas id ='temp_canvas2' width='" +
        ENGINE.INI.sprite_maxW +
        "' height='" +
        ENGINE.INI.sprite_maxH +
        "'></canvas>"
    );
    LAYER.temp = $("#temp_canvas")[0].getContext("2d");
    LAYER.temp2 = $("#temp_canvas2")[0].getContext("2d");
  },
  fill: function(ctx, pattern) {
    var CTX = ctx;
    var pat = CTX.createPattern(pattern, "repeat");
    CTX.fillStyle = pat;
    CTX.fillRect(0, 0, CTX.canvas.width, CTX.canvas.height);
  },
  clearLayer: function(layer) {
    var CTX = LAYER[layer];
    CTX.clearRect(0, 0, CTX.canvas.width, CTX.canvas.height);
  },
  clearLayerStack: function(){
    let CLR = ENGINE.layersToClear.length;
    if (CLR === 0) return;
    ENGINE.layersToClear.forEach(ENGINE.clearLayer);
    ENGINE.layersToClear.clear();
  },
  fillLayer: function(layer, colour) {
    var CTX = LAYER[layer];
    CTX.fillStyle = colour;
    CTX.fillRect(0, 0, CTX.canvas.width, CTX.canvas.height);
  },
  resizeBOX: function(id, width, height) {
    width = width || ENGINE.gameWIDTH;
    height = height || ENGINE.gameHEIGHT;
    var box = $("#" + id).children();
    for (var a = 0; a < box.length; a++) {
      box[a].width = width;
      box[a].height = height;
    }
  },
  addBOX: function(id, width, height, alias, type) {
    if (id === null) return;
    if (width === null) return;
    if (height === null) return;
    var layers = alias.length;
    $(ENGINE.gameWindowId).append(
      "<div id ='" + id + "' style='position: relative'></div>"
    );
    if (type === "side") {
      $("#" + id).addClass("gw"); //adds gw class: side by side windows
    }
    var prop;
    var canvasElement;
    for (var x = 0; x < layers; x++) {
      canvasElement =
        "<canvas class='layer' id='" +
        id +
        "_canvas_" +
        x +
        "' width='" +
        width +
        "' height='" +
        height +
        "' style='z-index:" +
        x +
        "; top:" +
        ENGINE.currentTOP +
        "px; left:" +
        ENGINE.currentLEFT +
        "px'></canvas>";
      $("#" + id).append(canvasElement);
      prop = alias.shift();
      LAYER[prop] = $("#" + id + "_canvas_" + x)[0].getContext("2d");
    }
    if (type === "side") {
      ENGINE.currentTOP = 0;
      ENGINE.currentLEFT += width;
    } else {
      ENGINE.currentTOP += height;
      ENGINE.currentLEFT = 0;
    }
  },
  copyLayer: function(copyFrom, copyTo, orX, orY, orW, orH) {
    var CTX = LAYER[copyTo];
    CTX.drawImage(LAYER[copyFrom].canvas, orX, orY, orW, orH, 0, 0, orW, orH);
  },
  flattenLayers: function(src, dest) {
    var W = LAYER[dest].canvas.width;
    var H = LAYER[dest].canvas.height;
    ENGINE.copyLayer(src, dest, 0, 0, W, H, 0, 0, W, H);
  },
  spriteDraw: function(layer, X, Y, image) {
    var CX = Math.floor(X - image.width / 2);
    var CY = Math.floor(Y - image.height / 2);
    var CTX = LAYER[layer];
    CTX.drawImage(image, CX, CY);
  },
  draw: function(layer, X, Y, image) {
    var CTX = LAYER[layer];
    CTX.drawImage(image, X, Y);
  },
  drawPart: function(layer, X, Y, image, line) {
    var CTX = LAYER[layer];
    CTX.drawImage(
      image,
      0,
      line,
      image.width,
      image.height - line,
      X,
      Y,
      image.width,
      image.height - line
    );
  },
  drawTile: function(layer, X, Y, tile) {
    var CTX = LAYER[layer];
    var image = $("#" + tile.id)[0];
    CTX.drawImage(image, X, Y);
  },
  drawPool: function(layer, pool, sprite) {
    var CTX = LAYER[layer];
    var PL = pool.length;
    if (PL === 0) return;
    for (var i = 0; i < PL; i++) {
      ENGINE.spriteDraw(layer, pool[i].x, pool[i].y, sprite);
    }
  },
  tileToImage: function() {
    var image;
    for (var prop in World) {
      var LN = World[prop].length;
      if (LN) {
        for (var ix = 0; ix < LN; ix++) {
          image = $("#" + World[prop][ix].id)[0];
          SPRITE[World[prop][ix].name] = image;
        }
      }
    }
  },
  trimCanvas: function(data) {
    var top = 0,
      bottom = data.height,
      left = 0,
      right = data.width;
    var width = data.width;
    while (top < bottom && rowBlank(data, width, top)) ++top;
    while (bottom - 1 > top && rowBlank(data, width, bottom - 1)) --bottom;
    while (left < right && columnBlank(data, width, left, top, bottom)) ++left;
    while (right - 1 > left && columnBlank(data, width, right - 1, top, bottom))
      --right;

    return { left: left, top: top, right: right, bottom: bottom };

    function rowBlank(data, width, y) {
      for (var x = 0; x < width; ++x) {
        if (data.data[y * width * 4 + x * 4 + 3] !== 0) return false;
      }
      return true;
    }

    function columnBlank(data, width, x, top, bottom) {
      for (var y = top; y < bottom; ++y) {
        if (data.data[y * width * 4 + x * 4 + 3] !== 0) return false;
      }
      return true;
    }
  },
  rotateImage: function(image, degree, newName) {
    var CTX = LAYER.temp;
    var CW = image.width;
    var CH = image.height;
    var max = Math.max(CW, CH);
    var min = Math.max(CW, CH);
    CTX.canvas.width = max * 2;
    CTX.canvas.height = max * 2;
    CTX.save();
    CTX.translate(max, max);
    CTX.rotate(degree * Math.PI / 180);
    CTX.drawImage(image, -min / 2, -min / 2);
    CTX.restore();
    var imgDATA = CTX.getImageData(0, 0, CTX.canvas.width, CTX.canvas.height);
    var TRIM = ENGINE.trimCanvas(imgDATA);
    var trimmed = CTX.getImageData(
      TRIM.left,
      TRIM.top,
      TRIM.right - TRIM.left,
      TRIM.bottom - TRIM.top
    );
    CTX.canvas.width = TRIM.right - TRIM.left;
    CTX.canvas.height = TRIM.bottom - TRIM.top;
    CTX.putImageData(trimmed, 0, 0);
    SPRITE[newName] = new Image();
    SPRITE[newName].onload = ENGINE.creationSpriteCount;
    SPRITE[newName].crossOrigin = "Anonymous";
    SPRITE[newName].src = CTX.canvas.toDataURL("image/png");
    SPRITE[newName].width = CTX.canvas.width;
    SPRITE[newName].height = CTX.canvas.height;
  },
  createSprites: function() {
    var LN = Creation.length;
    if (LN === 0) {
      ENGINE.ready();
      return;
    }
    var totalLength = 0;
    for (var x = 0; x < LN; x++) {
      var LAN = Creation[x].angles.length;
      if (LAN === 0) {
        for (
          var q = Creation[x].series.first;
          q <= Creation[x].series.last;
          q += Creation[x].series.step
        ) {
          Creation[x].angles.push(q);
        }
      }
      LAN = Creation[x].angles.length;
      totalLength += LAN;
      for (var y = 0; y < LAN; y++) {
        var newName = Creation[x].name + "_" + Creation[x].angles[y];
        ENGINE.rotateImage(
          SPRITE[Creation[x].name],
          Creation[x].angles[y],
          newName
        );
      }
    }
    ENGINE.HMCI = totalLength;
  },
  creationSpriteCount: function() {
    ENGINE.spriteCount++;
    ENGINE.drawLoadingGraph(ENGINE.spriteCount, ENGINE.HMCI, "Sprites");
    if (ENGINE.spriteCount === ENGINE.HMCI) {
      ENGINE.ready();
    }
  },
  ready: function() {
    console.log("ENGINE ready!");
    $("#buttons").prepend("<input type='button' id='startGame' value='START'>");
    $("#load").addClass("hidden");
    $("#startGame").on("click", PRG.start);
    ENGINE.readyCall.call();
  },
  intersectionCollision: function(actor1, actor2) {
    if (actor1.class !== "bullet" && actor2.class !== "bullet") return;
    if (actor1.prevX === null || actor2.prevX === null) return;

    var AL = arguments.length;
    var line1 = {};
    var line2 = {};
    for (var q = 0; q < AL; q++) {
      switch (arguments[q].class) {
        case "bullet":
          // for 5px*5px bullet
          line1.x1 = arguments[q].prevX;
          line1.y1 = arguments[q].prevY + 3;
          line1.x2 = arguments[q].x;
          line1.y2 = arguments[q].y - 3;
          break;
        default:
          //linear representation of object, angle not considered
          line2.x1 = parseInt(
            (arguments[q].prevX + arguments[q].x) / 2 + arguments[q].width / 2,
            10
          );
          line2.y1 = parseInt((arguments[q].prevY + arguments[q].y) / 2, 10);
          line2.x2 = parseInt(
            (arguments[q].prevX + arguments[q].x) / 2 - arguments[q].width / 2,
            10
          );
          line2.y2 = line2.y1;
          break;
      }
    }
    return ENGINE.lineIntersects(
      line1.x1,
      line1.y1,
      line1.x2,
      line1.y2,
      line2.x1,
      line2.y1,
      line2.x2,
      line2.y2
    );
  },
  lineIntersects: function(a, b, c, d, p, q, r, s) {
    //https://stackoverflow.com/a/24392281/4154250
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return 0 < lambda && lambda < 1 && (0 < gamma && gamma < 1);
    }
  },
  pixPerfectCollision: function(actor1, actor2) {
    var w1 = parseInt(actor1.width / 2, 10);
    var w2 = parseInt(actor2.width / 2, 10);
    var h1 = parseInt(actor1.height / 2, 10);
    var h2 = parseInt(actor2.height / 2, 10);
    var act1 = new Vector(actor1.x, actor1.y);
    var act2 = new Vector(actor2.x, actor2.y);
    var SQ1 = new Square(act1.x - w1, act1.y - h1, w1 * 2, h1 * 2);
    var SQ2 = new Square(act2.x - w2, act2.y - h2, w2 * 2, h2 * 2);
    var x = parseInt(Math.max(SQ1.x, SQ2.x), 10) - 1;
    var y = parseInt(Math.max(SQ1.y, SQ2.y), 10) - 1;
    var w = parseInt(Math.min(SQ1.x + SQ1.w - x, SQ2.x + SQ2.w - x), 10) + 1;
    var h = parseInt(Math.min(SQ1.y + SQ1.h - y, SQ2.y + SQ2.h - y), 10) + 1;
    if (w === 0 || h === 0) return false;
    var area = new Square(x, y, w, h);
    var area1 = new Square(area.x - SQ1.x, area.y - SQ1.y, area.w, area.h);
    var area2 = new Square(area.x - SQ2.x, area.y - SQ2.y, area.w, area.h);
    var CTX1 = LAYER.temp;
    var CTX2 = LAYER.temp2;
    CTX1.canvas.width = ENGINE.INI.sprite_maxW;
    CTX1.canvas.height = ENGINE.INI.sprite_maxH;
    CTX2.canvas.width = ENGINE.INI.sprite_maxW;
    CTX2.canvas.height = ENGINE.INI.sprite_maxH;
    ENGINE.draw("temp", 0, 0, SPRITE[actor1.name]);
    ENGINE.draw("temp2", 0, 0, SPRITE[actor2.name]);
    var data1 = CTX1.getImageData(area1.x, area1.y, area1.w, area1.h);
    var data2 = CTX2.getImageData(area2.x, area2.y, area2.w, area2.h);
    var DL = data1.data.length;
    var index;
    for (index = 3; index < DL; index += 4) {
      if (data1.data[index] > 0 && data2.data[index] > 0) {
        return true;
      }
    }
    //intersectionCollision check
    if (ENGINE.checkIntersection) {
      return ENGINE.intersectionCollision(actor1, actor2);
    } else return false;
  },
  collision: function(actor1, actor2) {
    var X = Math.abs(actor1.x - actor2.x);
    var Y = Math.abs(actor1.y - actor2.y);
    if (Y >= ENGINE.INI.COLLISION_SAFE) return false;
    if (X >= ENGINE.INI.COLLISION_SAFE) return false;
    var w1 = parseInt(actor1.width / 2, 10);
    var w2 = parseInt(actor2.width / 2, 10);
    var h1 = parseInt(actor1.height / 2, 10);
    var h2 = parseInt(actor2.height / 2, 10);

    if (X >= w1 + w2 || Y >= h1 + h2) return false;
    return ENGINE.pixPerfectCollision(actor1, actor2);
  },
  collisionToBackground: function(actor, layer) {
    var CTX = layer;
    var maxSq = Math.max(actor.width, actor.height);
    var R = Math.ceil(0.5 * Math.sqrt(2 * Math.pow(maxSq, 2)));
    var X = actor.x;
    var Y = actor.y;
    var proximity = false;
    if (ENGINE.checkProximity) {
      var imgDATA = CTX.getImageData(X - R, Y - R, 2 * R, 2 * R);
      var check = 1;
      var left, right, down, top;
      while (check < R) {
        left = imgDATA.data[toIndex(X - check, Y)];
        right = imgDATA.data[toIndex(X + check, Y)];
        down = imgDATA.data[toIndex(X, Y + check)];
        top = imgDATA.data[toIndex(X, Y - check)];
        if (left || right || down || top) {
          proximity = true;
          break;
        }
        check++;
      }
    } else proximity = true;
    if (!proximity) {
      return false;
    } else {
      var CX = Math.floor(X - actor.width / 2);
      var CY = Math.floor(Y - actor.height / 2);
      var CTX1 = LAYER.temp;
      CTX1.canvas.width = actor.width;
      CTX1.canvas.height = actor.height;
      ENGINE.draw("temp", 0, 0, SPRITE[actor.name]);
      var data1 = CTX1.getImageData(0, 0, actor.width, actor.height); //actor data
      var data2 = CTX.getImageData(CX, CY, actor.width, actor.height); //layer data
      var DL = data1.data.length;
      var index;
      for (index = 3; index < DL; index += 4) {
        if (data1.data[index] > 0 && data2.data[index] > 0) {
          return true;
        }
      }
      return false;
    }

    function toIndex(x, y) {
      var index = (y - Y) * 4 * (2 * R) + (x - (X - R)) * 4 + 3;
      return index;
    }
  },
  drawLoadingGraph: function(count, HMI, text) {
    var percent = Math.floor(count / HMI * 100);
    var CTX = ENGINE.ctx;
    CTX.clearRect(0, 0, ENGINE.LOAD_W, ENGINE.LOAD_H);
    CTX.beginPath();
    CTX.lineWidth = "1";
    CTX.strokeStyle = "black";
    CTX.rect(0, 0, ENGINE.LOAD_W, ENGINE.LOAD_H);
    CTX.closePath();
    CTX.stroke();
    CTX.fillStyle = "#999";
    CTX.fillRect(
      1,
      1,
      Math.floor((ENGINE.LOAD_W - 2) * (percent / 100)),
      ENGINE.LOAD_H - 2
    );
    CTX.fillStyle = "black";
    CTX.font = "10px Verdana";
    CTX.fillText(
      text + ": " + percent + "%",
      ENGINE.LOAD_W * 0.1,
      ENGINE.LOAD_H * 0.62
    );
    return;
  },
  spriteDump: function(layer, spriteList) {
    console.log("********* SPRITE DUMP *********");
    console.log(SPRITE);
    var x = 0;
    var y = 0;
    var dy = 0;
    spriteList.forEach(function(q) {
      ENGINE.draw(layer, x, y, q);
      x += q.width;
      if (q.height > dy) dy = q.height;
      if (x > LAYER[layer].canvas.width - 64) {
        y += dy;
        x = 0;
      }
    });
  },
  drawRoom: function(room) {
    ENGINE.clearLayer("background");
    ENGINE.clearLayer("floor");
    ENGINE.clearLayer("door");
    ENGINE.clearLayer("items");
    ENGINE.renderRoom(room);
    ENGINE.drawContainer(room);
    ENGINE.drawItems(room);
    ENGINE.drawFurniture(room);
    ENGINE.drawPlayers(room);
    ENGINE.drawAlert(room);
  },
  drawAlert: function(room) {
    if (MAP["room" + room].alertFlag) {
      MAP["room" + room].alertFlag = false; // just once
      ENGINE.clearLayer("alert");
      ENGINE.alert(room);
    }
  },
  renderRoom: function(room) {
    var type = MAP["room" + room].type;
    switch (type) {
      case "indoor":
        ENGINE.renderInsideRoom(room);
        break;
      case "stair":
        ENGINE.renderStaircase(room);
        break;
      case "outdoor":
        ENGINE.renderOutsideRoom(room);
        break;
    }
  },
  renderStaircase: function(room) {
    var soba = MAP["room" + room];
    var obj = soba.grid;
    var floor = $("#" + soba.floor.id)[0];
    var wall = $("#" + soba.wall.id)[0];
    var CTX = LAYER.background;
    var CTF = LAYER.floor;
    CTX.lineWidth = 1;
    ///////walls///////////
    var TPX = LAYER.temp;
    var TempCanvas = TPX.canvas;
    TempCanvas.width = soba.wall.x;
    TempCanvas.height = soba.wall.y;
    var cw = TempCanvas.width;
    var ch = TempCanvas.height;
    TPX.drawImage(wall, 0, 0);
    // TOP
    var patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x, obj.y);
    CTX.lineTo(obj.x - ENGINE.INI.STC, obj.y - ENGINE.INI.STC);
    CTX.lineTo(obj.x + ENGINE.INI.STC + obj.width, obj.y - ENGINE.INI.STC);
    CTX.lineTo(obj.x + obj.width, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //BOTTOM
    TPX.clearRect(0, 0, cw, ch);
    TPX.translate(cw / 2, ch / 2);
    TPX.rotate(Math.PI);
    TPX.translate(-cw / 2, -ch / 2);
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");

    CTX.beginPath();
    const xFact = 1.5;
    CTX.moveTo(obj.x + obj.width * xFact, obj.y + obj.height);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width * xFact,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(
      obj.x - ENGINE.INI.STDH - obj.width * (xFact - 1),
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x - obj.width * (xFact - 1), obj.y + obj.height);

    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //RIGHT
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    TPX.translate(ch, 0);
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.rotate(Math.radians(90));
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");

    CTX.beginPath();
    CTX.moveTo(obj.x + obj.width, obj.y);
    CTX.lineTo(obj.x + ENGINE.INI.STC + obj.width, obj.y - ENGINE.INI.STC);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width * xFact,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x + obj.width * xFact, obj.y + obj.height);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //LEFT
    TempCanvas.width = soba.wall.x;
    TempCanvas.height = soba.wall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    TPX.translate(0, cw);
    TPX.rotate(Math.radians(270));
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    //
    CTX.beginPath();
    CTX.moveTo(obj.x - obj.width * (xFact - 1), obj.y + obj.height);
    CTX.lineTo(
      obj.x - obj.width * (xFact - 1) - ENGINE.INI.STDH,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x - ENGINE.INI.STC, obj.y - ENGINE.INI.STC);
    CTX.lineTo(obj.x, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //FLOOR
    CTF.lineWidth = 1;
    var patF = CTF.createPattern(floor, "repeat");
    CTF.fillStyle = patF;
    CTF.strokeStyle = "#000";
    const NStairs = 10;
    const X = obj.x - obj.width * (xFact - 1);
    const W = obj.width * (2 * xFact - 1);
    const H = obj.height / NStairs;
    const Y = obj.y + obj.height - H;
    const delta = (W - obj.width) / (NStairs * 2);

    var tx, ty, tw;
    for (var st = 0; st < NStairs; st++) {
      tx = X + st * delta;
      ty = Y - st * H;
      tw = W - 2 * delta * st;
      CTF.fillRect(tx, ty, tw, H - 1);
      CTF.strokeRect(tx, ty, tw, H - 1);
    }

    //RENDER DOORS
    if (soba.ndoor !== null) {
      ENGINE.renderNDoor(obj, soba.ndoor);
    }
    if (soba.sdoor !== null) {
      ENGINE.renderSDoor(obj, soba.sdoor);
    }
    if (soba.edoor !== null) {
      ENGINE.renderEDoor(obj, soba.edoor);
    }
    if (soba.wdoor !== null) {
      ENGINE.renderWDoor(obj, soba.wdoor);
    }
  },
  renderInsideRoom: function(room) {
    var soba = MAP["room" + room];
    var obj = soba.grid;
    var floor = $("#" + soba.floor.id)[0];
    var wall = $("#" + soba.wall.id)[0];
    var CTX = LAYER.background;
    var CTF = LAYER.floor;
    CTX.lineWidth = 1;
    CTF.lineWidth = 1;
    var patF = CTF.createPattern(floor, "repeat");
    CTF.fillStyle = patF;
    CTF.fillRect(obj.x, obj.y, obj.width, obj.height);

    ///////walls///////////
    var TPX = LAYER.temp;
    var TempCanvas = TPX.canvas;
    TempCanvas.width = soba.wall.x;
    TempCanvas.height = soba.wall.y;
    var cw = TempCanvas.width;
    var ch = TempCanvas.height;
    TPX.drawImage(wall, 0, 0);
    // TOP
    var patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x, obj.y);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x + ENGINE.INI.STDH + obj.width, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x + obj.width, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();
    //BOTTOM
    TPX.clearRect(0, 0, cw, ch);
    TPX.translate(cw / 2, ch / 2);
    TPX.rotate(Math.radians(180));
    TPX.translate(-cw / 2, -ch / 2);
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x + obj.width, obj.y + obj.height);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y + ENGINE.INI.STDH + obj.height);
    CTX.lineTo(obj.x, obj.y + obj.height);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();
    //RIGHT
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    TPX.translate(ch, 0);
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.rotate(Math.radians(90));
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x + obj.width, obj.y);
    CTX.lineTo(obj.x + ENGINE.INI.STDH + obj.width, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x + obj.width, obj.y + obj.height);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();
    //LEFT
    TempCanvas.width = soba.wall.x;
    TempCanvas.height = soba.wall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    TPX.translate(0, cw);
    TPX.rotate(Math.radians(270));
    TPX.drawImage(wall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    //
    CTX.beginPath();
    CTX.moveTo(obj.x, obj.y + obj.height);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y + ENGINE.INI.STDH + obj.height);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //RENDER DOORS
    if (soba.ndoor !== null) {
      ENGINE.renderNDoor(obj, soba.ndoor);
    }
    if (soba.sdoor !== null) {
      ENGINE.renderSDoor(obj, soba.sdoor);
    }
    if (soba.edoor !== null) {
      ENGINE.renderEDoor(obj, soba.edoor);
    }
    if (soba.wdoor !== null) {
      ENGINE.renderWDoor(obj, soba.wdoor);
    }
  },
  renderOutsideRoom: function(room) {
    var soba = MAP["room" + room];
    var obj = soba.grid;
    var floor = $("#" + soba.floor.id)[0];
    var nwall = $("#" + soba.nwall.id)[0];
    var ewall = $("#" + soba.ewall.id)[0];
    var wwall = $("#" + soba.wwall.id)[0];
    var swall = $("#" + soba.swall.id)[0];

    var CTX = LAYER.background;
    var CTF = LAYER.floor;
    CTX.lineWidth = 1;
    CTF.lineWidth = 1;
    var patF = CTF.createPattern(floor, "repeat");
    CTF.fillStyle = patF;
    CTF.fillRect(obj.x, obj.y, obj.width, obj.height);

    ///////walls///////////
    var TPX = LAYER.temp;
    var TempCanvas = TPX.canvas;
    var cw, ch;

    ////north
    TempCanvas.width = soba.nwall.x;
    TempCanvas.height = soba.nwall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.drawImage(nwall, 0, 0);
    // TOP
    var patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x, obj.y);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x + ENGINE.INI.STDH + obj.width, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x + obj.width, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //south
    TempCanvas.width = soba.swall.x;
    TempCanvas.height = soba.swall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.drawImage(swall, 0, 0);

    //BOTTOM
    TPX.clearRect(0, 0, cw, ch);
    TPX.translate(cw / 2, ch / 2);
    TPX.rotate(Math.radians(180));
    TPX.translate(-cw / 2, -ch / 2);
    TPX.drawImage(swall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x + obj.width, obj.y + obj.height);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y + ENGINE.INI.STDH + obj.height);
    CTX.lineTo(obj.x, obj.y + obj.height);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();
    //east
    TempCanvas.width = soba.ewall.x;
    TempCanvas.height = soba.ewall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    //RIGHT
    TPX.translate(ch, 0);
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.rotate(Math.radians(90));
    TPX.drawImage(ewall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    CTX.beginPath();
    CTX.moveTo(obj.x + obj.width, obj.y);
    CTX.lineTo(obj.x + ENGINE.INI.STDH + obj.width, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(
      obj.x + ENGINE.INI.STDH + obj.width,
      obj.y + ENGINE.INI.STDH + obj.height
    );
    CTX.lineTo(obj.x + obj.width, obj.y + obj.height);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();
    //west
    TempCanvas.width = soba.ewall.x;
    TempCanvas.height = soba.ewall.y;
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TempCanvas.height = cw;
    TempCanvas.width = ch;
    TPX.translate(0, cw);
    cw = TempCanvas.width;
    ch = TempCanvas.height;
    TPX.rotate(Math.radians(270));
    TPX.drawImage(wwall, 0, 0);
    patW = CTX.createPattern(TempCanvas, "repeat");
    //LEFT
    CTX.beginPath();
    CTX.moveTo(obj.x, obj.y + obj.height);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y + ENGINE.INI.STDH + obj.height);
    CTX.lineTo(obj.x - ENGINE.INI.STDH, obj.y - ENGINE.INI.STDH);
    CTX.lineTo(obj.x, obj.y);
    CTX.closePath();
    CTX.fillStyle = patW;
    CTX.fill();
    CTX.stroke();

    //RENDER DOORS
    if (soba.ndoor !== null) {
      ENGINE.renderNDoor(obj, soba.ndoor);
    }
    if (soba.sdoor !== null) {
      ENGINE.renderSDoor(obj, soba.sdoor);
    }
    if (soba.edoor !== null) {
      ENGINE.renderEDoor(obj, soba.edoor);
    }
    if (soba.wdoor !== null) {
      ENGINE.renderWDoor(obj, soba.wdoor);
    }
  },
  renderNDoor: function(obj, type) {
    var inX = parseInt(obj.x + obj.width / 2, 10);
    var inY = obj.y;
    var direction = new Vector(0, -1);
    ENGINE.renderDoor(inX, inY, direction, type);
  },
  renderSDoor: function(obj, type) {
    var inX = parseInt(obj.x + obj.width / 2, 10);
    var inY = obj.y + obj.height;
    var direction = new Vector(0, 1);
    ENGINE.renderDoor(inX, inY, direction, type);
  },
  renderWDoor: function(obj, type) {
    var inX = obj.x;
    var inY = parseInt(obj.y + obj.height / 2, 10);
    var direction = new Vector(-1, 0);
    ENGINE.renderDoor(inX, inY, direction, type);
  },
  renderEDoor: function(obj, type) {
    var inX = obj.x + obj.width;
    var inY = parseInt(obj.y + obj.height / 2, 10);
    var direction = new Vector(1, 0);
    ENGINE.renderDoor(inX, inY, direction, type);
  },
  renderDoor: function(inX, inY, direction, type) {
    var CTX = LAYER.door;
    CTX.lineWidth = 1;
    CTX.strokeStyle = "#000";
    CTX.save();
    CTX.beginPath();
    var X1 = inX - ENGINE.INI.DOORW / 2 * Math.abs(direction.y);
    var Y1 = inY - ENGINE.INI.DOORW / 2 * Math.abs(direction.x);
    CTX.moveTo(X1, Y1);
    var X2 = X1 + direction.x * ENGINE.INI.DOORH;
    var Y2 = Y1 + direction.y * ENGINE.INI.DOORH;
    CTX.lineTo(X2, Y2);
    var X3 = X2 + Math.abs(direction.y * ENGINE.INI.DOORW);
    var Y3 = Y2 + Math.abs(direction.x * ENGINE.INI.DOORW);
    var CX, CY;
    if (direction.x === 0) {
      CY = Y3 + direction.y * ENGINE.INI.DOORC;
      CX = Math.abs(X3 - X2) / 2 + X2;
    } else {
      CX = X3 + direction.x * ENGINE.INI.DOORC;
      CY = Math.abs(Y3 - Y2) / 2 + Y2;
    }
    CTX.quadraticCurveTo(CX, CY, X3, Y3);
    var X4 = X3 + direction.x * ENGINE.INI.DOORH * -1;
    var Y4 = Y3 + direction.y * ENGINE.INI.DOORH * -1;
    CTX.lineTo(X4, Y4);
    CTX.lineTo(X1, Y1);

    CTX.clip();
    CTX.closePath();
    CTX.stroke();

    //Paint the door
    var pattern;
    if (type === "open") {
      pattern = PATTERN.void;
    } else {
      pattern = PATTERN[type];
    }
    CTX.fillStyle = pattern;
    var FX, FY, FW, FH;
    FX = X1;
    FY = Y1;
    var WX = FX;
    var WY = FY;
    FW = ENGINE.INI.DOORW;
    var WW = ENGINE.INI.DOORW;
    FH = ENGINE.INI.DOORH + ENGINE.INI.DOORC;
    var WH = ENGINE.INI.DOORH;
    if (Math.abs(direction.x)) {
      FH = ENGINE.INI.DOORW;
      WH = ENGINE.INI.DOORW;
      FW = ENGINE.INI.DOORH + ENGINE.INI.DOORC;
      WW = ENGINE.INI.DOORH;
    }
    if (direction.y === -1) {
      FY = Y1 - ENGINE.INI.DOORH - ENGINE.INI.DOORC;
      WY = Y1 - ENGINE.INI.DOORH + 1;
      FW = ENGINE.INI.DOORW;
      WW = ENGINE.INI.DOORW;
      FH = ENGINE.INI.DOORH + ENGINE.INI.DOORC;
      WH = ENGINE.INI.DOORH;
    }
    if (direction.x === -1) {
      FX = X1 - ENGINE.INI.DOORH - ENGINE.INI.DOORC;
      WX = X1 - ENGINE.INI.DOORH + 1;
    }
    if (direction.x === 1) {
      WX = FX - 1;
    }
    if (direction.y === 1) {
      WY = FY - 1;
    }

    CTX.fillRect(FX, FY, FW, FH);
    CTX.restore();

    if (type !== "open") {
      var doorKnobX;
      if (X1 !== X4) {
        doorKnobX = Math.floor(X1 + X4) / 2;
      } else {
        doorKnobX = Math.floor(X1 + X3) / 2;
      }
      var doorKnobY;
      if (Y1 !== Y4) {
        doorKnobY = Math.floor(Y1 + Y4) / 2;
      } else {
        doorKnobY = Math.floor(Y1 + Y3) / 2;
      }

      var knobDirection = direction.cw();
      doorKnobX = doorKnobX + 12 * knobDirection.x;
      doorKnobY = doorKnobY + 12 * knobDirection.y * -1;
      ENGINE.doorKnobAt(doorKnobX, doorKnobY);
    } else {
      //make the cut in the wall (LAYER.background)
      var CTW = LAYER.background;
      CTW.clearRect(WX, WY, WW, WH);
    }
  },
  doorKnobAt: function(x, y) {
    var CTX = LAYER.door;
    CTX.save();
    CTX.lineWidth = 1;
    CTX.strokeStyle = "#000";
    CTX.beginPath();
    CTX.arc(x, y, 3, 0, 2 * Math.PI);
    CTX.closePath();
    CTX.stroke();
    CTX.shadowColor = "#222";
    CTX.shadowBlur = 1;
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.fillStyle = "#000";
    CTX.fill();
    CTX.restore();
  },
  drawItems: function(room) {
    var roomItems = MAP["room" + room].items;
    if (roomItems) {
      var IL = roomItems.length;
      if (IL) {
        var data = ENGINE.roomData(room, HERO.actor);
        for (var i = 0; i < IL; i++) {
          if (roomItems[i].rand) {
            roomItems[i].x = RND(data.x0, data.x1);
            roomItems[i].y = RND(data.y0, data.y1);
            roomItems[i].rand = false;
          }
          ENGINE.spriteDraw(
            "items",
            roomItems[i].x,
            roomItems[i].y,
            $("#" + roomItems[i].tile.id)[0]
          );
        }
      }
    }
  },
  drawFurniture: function(room) {
    var roomFurniture = MAP["room" + room].furniture;
    if (roomFurniture) {
      var FL = roomFurniture.length;
      if (FL) {
        for (var i = 0; i < FL; i++) {
          ENGINE.draw(
            "floor",
            roomFurniture[i].x,
            roomFurniture[i].y,
            $("#" + roomFurniture[i].tile.id)[0]
          );
        }
      }
    }
  },
  drawContainer: function(room) {
    ENGINE.clearLayer("container");
    var cont = MAP["room" + room].container;
    if (cont) {
      ENGINE.draw(
        "container",
        cont.furniture.x,
        cont.furniture.y,
        $("#" + cont.furniture.tile.id)[0]
      );
    }
  },
  drawPlayers: function(room) {
    ENGINE.clearLayer("players");
    var player = MAP["room" + room].player;
    if (player) {
      ENGINE.drawTile("players", player.x, player.y, player.tile);
    }
  },
  roomData: function(room, actor) {
    var data = {};
    var soba = MAP["room" + room];
    data.x0 = soba.grid.x + Math.floor(actor.width / 4);
    data.y0 = soba.grid.y;
    data.x1 = soba.grid.x + soba.grid.width - Math.floor(actor.width / 4);
    data.y1 = soba.grid.y + soba.grid.height - Math.floor(actor.height / 4);
    return data;
  },
  openDoor: function(door, room) {
    MAP["room" + room][door + "door"] = "open";
  },
  bounceMove: function(pool, margin) {
    var PL = pool.length;
    if (PL === 0) return;
    for (var i = 0; i < PL; i++) {
      pool[i].x += pool[i].dir.x * pool[i].speed;
      pool[i].y += pool[i].dir.y * pool[i].speed;
      if (pool[i].x < margin.x0) {
        pool[i].x = margin.x0;
        pool[i].dir.x = pool[i].dir.x * -1;
      }
      if (pool[i].x > margin.x1) {
        pool[i].x = margin.x1;
        pool[i].dir.x = pool[i].dir.x * -1;
      }
      if (pool[i].y > margin.y1) {
        pool[i].y = margin.y1;
        pool[i].dir.y = pool[i].dir.y * -1;
      }
      if (pool[i].y < margin.y0) {
        pool[i].y = margin.y0;
        pool[i].dir.y = pool[i].dir.y * -1;
      }
    }
  },
  birthEnemies: function(room) {
    if (ENGINE.alertMode) return;
    var enemy = MAP["room" + room].enemy;
    if (enemy === undefined) return;
    var EL = enemy.length;
    if (EL === 0) return;
    var points = getPoints(room);
    var TP;

    for (var i = EL - 1; i >= 0; i--) {
      var instance = {};
      TP = points.removeRandom();
      instance.actor = new ACTOR(
        enemy[i].spriteClass,
        TP.x,
        TP.y,
        "front",
        ASSET[enemy[i].spriteClass]
      );
      instance.stage = "birth";
      instance.opacity = 0;
      instance.index = i;
      instance.spriteClass = enemy[i].spriteClass;
      instance.type = enemy[i].type;
      instance.speed = enemy[i].speed;
      instance.dir = [UP, DOWN, LEFT, RIGHT].chooseRandom();
      instance.path = 0;
      instance.trigger = 0;
      instance.canShoot = true;
      instance.score = enemy[i].score;
      instance.maxpath = enemy[i].maxpath;
      instance.trigPath = enemy[i].trigPath;
      instance.bullets = enemy[i].bullets;
      instance.inventory = enemy[i].inventory;
      instance.boss = enemy[i].boss;
      ENEMY.pool.push(instance);
    }
    console.log("Enemies birthed", ENEMY.pool);
    return;
    //
    function getPoints(room) {
      const delta = 72; //distance betwen points
      const safe = 120; //min distance from hero
      var data = ENGINE.roomData(room, HERO.actor);
      var dx = Math.floor(((data.x1 - data.x0) % delta) / 2);
      var dy = Math.floor(((data.y1 - data.y0) % delta) / 2);
      data.x0 += dx;
      data.x1 -= dx;
      data.y0 += dy;
      data.y1 -= dy;
      var points = [];
      for (var x = data.x0; x <= data.x1; x += delta) {
        for (var y = data.y0; y <= data.y1; y += delta) {
          points.push({ x: x, y: y });
        }
      }
      //filter those close to hero
      var PL = points.length;
      for (var q = PL - 1; q >= 0; q--) {
        let distX = Math.abs(points[q].x - HERO.actor.x);
        let distY = Math.abs(points[q].y - HERO.actor.y);
        if (distX < safe && distY < safe) {
          let waste = points.splice(q, 1);
        }
      }
      //end filtering
      return points;
    }
  },
  alert: function(room) {
    var CL = ENGINE.getCanvasNumber("ROOM");
    var cname = "#ROOM_canvas_" + --CL;
    var text = MAP["room" + room].alert;
    ENGINE.alertMode = true;
    GAME.clearAllKeys();
    ENGINE.disableArrows(); //NEW
    var CTX = LAYER.alert;
    CTX.save();
    var words = text.split(" ");
    var lines = [];
    var line = "";
    var lineTest = "";
    var currentY = 0;
    var currentX = 0;
    CTX.font = ENGINE.alertINI.fontSize + "px Consolas";
    for (var i = 0, len = words.length; i < len; i++) {
      lineTest = line + words[i] + " ";
      if (CTX.measureText(lineTest).width > ENGINE.alertINI.width - 10) {
        currentY =
          lines.length * ENGINE.alertINI.fontSize + ENGINE.alertINI.fontSize;
        lines.push({
          text: line,
          height: currentY
        });
        line = words[i] + " ";
      } else {
        line = lineTest;
      }
    }
    if (line.length > 0) {
      currentY =
        lines.length * ENGINE.alertINI.fontSize + ENGINE.alertINI.fontSize;
      lines.push({
        text: line.trim(),
        height: currentY
      });
    }
    ENGINE.alertINI.height = currentY + ENGINE.alertINI.buttonHeight;
    CTX.fillStyle = "#CCC";
    CTX.shadowOffsetX = 2;
    CTX.shadowOffsetY = 2;
    CTX.shadowBlur = 2;
    CTX.fillRect(
      ENGINE.alertINI.left,
      ENGINE.alertINI.top,
      ENGINE.alertINI.width,
      ENGINE.alertINI.height
    );
    CTX.lineWidth = 1;
    CTX.strokeStyle = "#000";
    CTX.beginPath();
    CTX.rect(
      ENGINE.alertINI.left + 1,
      ENGINE.alertINI.top + 1,
      ENGINE.alertINI.width - 2,
      ENGINE.alertINI.height - 2
    );
    CTX.closePath();
    CTX.stroke();
    CTX.fillStyle = "#111";
    CTX.shadowColor = "#000";
    CTX.shadowOffsetX = 1;
    CTX.shadowOffsetY = 1;
    CTX.shadowBlur = 1;
    var leng = lines.length;
    for (i = 0; i < leng; i++) {
      CTX.fillText(
        lines[i].text,
        currentX + ENGINE.alertINI.left + ENGINE.alertINI.fontSize,
        ENGINE.alertINI.top + lines[i].height + ENGINE.alertINI.fontSize
      );
    }
    CTX.lineWidth = 2;
    CTX.strokeStyle = "#000";
    ENGINE.alertButton.okX =
      ENGINE.alertINI.left +
      ENGINE.alertINI.width / 2 -
      ENGINE.alertButton.width / 2;
    ENGINE.alertButton.okY =
      ENGINE.alertINI.top + currentY + ENGINE.alertINI.fontSize * 2;
    CTX.beginPath();
    CTX.rect(
      ENGINE.alertButton.okX,
      ENGINE.alertButton.okY,
      ENGINE.alertButton.width,
      ENGINE.alertButton.heigth
    );
    CTX.closePath();
    CTX.stroke();
    CTX.fillText(
      "OK",
      ENGINE.alertButton.okX + 16,
      ENGINE.alertButton.okY + 21
    );
    CTX.lineWidth = 1;
    CTX.restore();

    $(cname).mousemove(function(event) {
      ENGINE.mouseOverOK(event, cname);
    });

    $(cname).click(function(event) {
      ENGINE.mouseClickOK(event, cname);
    });

    $(document).off("keyup", GAME.clearKey);
    $(document).off("keydown", GAME.checkKey);
    return;
  },
  alertINI: {
    fontSize: 14,
    width: 350,
    heigth: 180,
    left: 80,
    top: 154,
    buttonHeight: 72
  },
  alertButton: {
    width: 48,
    heigth: 32
  },
  mouseOverOK: function(event, cname) {
    var canvasOffset = $(cname).offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var mouseX = parseInt(event.pageX - offsetX - ENGINE.alertButton.okX, 10);
    var mouseY = parseInt(event.pageY - offsetY - ENGINE.alertButton.okY, 10);
    if (
      mouseX >= 0 &&
      mouseX < ENGINE.alertButton.width &&
      mouseY >= 0 &&
      mouseY < ENGINE.alertButton.heigth
    ) {
      $(cname).css("cursor", "pointer");
    } else {
      $(cname).css("cursor", "auto");
    }
  },
  mouseOver: function(event, cname) {
    $(cname).css("cursor", "pointer");
  },
  mouseClick: function(event, cname, func) {
    var canvasOffset = $(cname).offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var mouseX = parseInt(event.pageX - offsetX, 10);
    var mouseY = parseInt(event.pageY - offsetY, 10);
    ENGINE.mouseX = mouseX;
    ENGINE.mouseY = mouseY;
    func.call();
    return;
  },
  mouseClickOK: function(event, cname) {
    var canvasOffset = $(cname).offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var mouseX = parseInt(event.pageX - offsetX - ENGINE.alertButton.okX, 10);
    var mouseY = parseInt(event.pageY - offsetY - ENGINE.alertButton.okY, 10);
    if (
      mouseX >= 0 &&
      mouseX < ENGINE.alertButton.width &&
      mouseY >= 0 &&
      mouseY < ENGINE.alertButton.heigth
    ) {
      $(cname).css("cursor", "auto");
      $(cname).off();
      ENGINE.alertMode = false;
      ENGINE.clearLayer("alert");
      $(document).keydown(GAME.checkKey);
      $(document).keyup(GAME.clearKey);
      GAME.continue();
    }
  },
  getCanvasNumber: function(id) {
    var cnv = $("#" + id + " .layer");
    return cnv.length;
  },
  getCanvasName: function(id) {
    var CL = ENGINE.getCanvasNumber("ROOM");
    var cname = "#ROOM_canvas_" + --CL;
    return cname;
  },
  cutGrid: function(layer, point) {
    var CTX = layer;
    CTX.clearRect(point.x, point.y, ENGINE.INI.GRIDPIX, ENGINE.INI.GRIDPIX);
    return;
  },
  spreadAroundCenter: function(toDo, x, delta) {
    var xS = [];
    var odd = toDo % 2;
    var n = 2;
    if (odd) {
      xS.push(x);
      toDo--;
      while (toDo > 0) {
        xS.push(x + (n - 1) * delta);
        xS.push(x - (n - 1) * delta);
        toDo -= 2;
        n++;
      }
    } else {
      while (toDo > 0) {
        xS.push(x + (n - 1) * delta / 2);
        xS.push(x - (n - 1) * delta / 2);
        toDo -= 2;
        n += 2;
      }
    }
    xS.sort((a, b) => a - b);
    return xS;
  },
  KEY: {
    on: function() {
      $(document).keydown(ENGINE.GAME.checkKey);
      $(document).keyup(ENGINE.GAME.clearKey);
    },
    off: function() {
      $(document).off("keyup", ENGINE.GAME.clearKey);
      $(document).off("keydown", ENGINE.GAME.checkKey);
    },
    map: {
      ctrl: 17,
      alt: 18,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      space: 32,
      enter: 13,
      F9: 120,
      A: 65,
      D: 68
    }
  },
  GAME: {
    keymap: {
      17: false, //CTRL
      37: false, //LEFT
      38: false, //UP
      39: false, //RIGHT
      40: false, //Down
      32: false, //SPACE
      13: false, //ENTER
      120: false, //F9
      65: false, //A
      68: false //D
    },
    clearAllKeys: function() {
      for (var key in ENGINE.GAME.keymap) {
        ENGINE.GAME.keymap[key] = false;
      }
    },
    clearKey: function(e) {
      e = e || window.event;
      if (e.keyCode in ENGINE.GAME.keymap) {
        ENGINE.GAME.keymap[e.keyCode] = false;
      }
    },
    checkKey: function(e) {
      e = e || window.event;
      if (e.keyCode in ENGINE.GAME.keymap) {
        ENGINE.GAME.keymap[e.keyCode] = true;
        e.preventDefault();
      }
    },
    run: function(func) {
      if (!ENGINE.GAME.frame.start) ENGINE.GAME.frame.start = performance.now();
      var current = performance.now();
      ENGINE.GAME.frame.delta = current - ENGINE.GAME.frame.start;
      if (ENGINE.GAME.frame.delta > ENGINE.INI.ANIMATION_INTERVAL) {
        func.call();
        ENGINE.GAME.frame.start = null;
      }
      if (ENGINE.GAME.stopAnimation) {
        return;
      } else requestAnimationFrame(ENGINE.GAME.run.bind(null, func));
    },
    start: function() {
      $("#bottom")[0].scrollIntoView();
      ENGINE.GAME.stopAnimation = false;
      ENGINE.GAME.started = Date.now();
      ENGINE.GAME.frame = {};
      ENGINE.GAME.frame.start = null;
    }
  },
  VIEWPORT: {
    changed: false,
    reset: function(){
      ENGINE.VIEWPORT.vx = 0;
      ENGINE.VIEWPORT.vy = 0;
    },
    vx: 0,
    vy: 0,
    change: function(from, to) {
      ENGINE.copyLayer(
        from,
        to,
        ENGINE.VIEWPORT.vx,
        ENGINE.VIEWPORT.vy,
        ENGINE.gameWIDTH,
        ENGINE.gameHEIGHT
      );
    },
    check: function(actor, max) {
      var vx = actor.x - ENGINE.gameWIDTH / 2;
      var vy = actor.y - ENGINE.gameHEIGHT / 2;
      if (vx < 0) vx = 0;
      if (vy < 0) vy = 0;
      if (vx > max.x - ENGINE.gameWIDTH) vx = max.x - ENGINE.gameWIDTH;
      if (vy > max.y - ENGINE.gameHEIGHT) vy = max.y - ENGINE.gameHEIGHT;
      if (vx != ENGINE.VIEWPORT.vx || vy != ENGINE.VIEWPORT.vy) {
        //vieport change
        ENGINE.VIEWPORT.vx = vx;
        ENGINE.VIEWPORT.vy = vy;
        ENGINE.VIEWPORT.changed = true;
      }
    },
    alignTo: function(actor) {
      //change to offset
      actor.vx = actor.x - ENGINE.VIEWPORT.vx;
      actor.vy = actor.y - ENGINE.VIEWPORT.vy;
    }
  }
};
////////////////////
var PATTERN = {
  create: function(which, img) {
    //creates PATTERN.which from Tile
    var image = $("#" + img.id)[0];
    var CTX = LAYER.temp;
    PATTERN[which] = CTX.createPattern(image, "repeat");
  }
};
//////////////////MATERIAL////////////////////////////
var MATERIAL = {
  material: {
    wood: {
      colors: [
        "#994d00",
        "#663300",
        "#663300",
        "#663300",
        "#663300",
        "#331a00",
        "#4d2600",
        "#4d2600",
        "#804000",
        "#442200"
      ]
    },
    void: {
      colors: [
        "#000",
        "#111",
        "#222",
        "#000",
        "#000",
        "#000",
        "#111",
        "#000",
        "#111",
        "#000"
      ]
    },
    red: {
      colors: [
        "#E60000",
        "#FF0000",
        "#EE0000",
        "#DD0000",
        "#E60000",
        "#FF0000",
        "#CC0000"
      ]
    },
    green: {
      colors: [
        "#00E600",
        "#00FF00",
        "#00EE00",
        "#00DD00",
        "#00E600",
        "#00FF00",
        "#00CC00"
      ]
    },
    blue: {
      colors: [
        "#0000E6",
        "#0000FF",
        "#0000EE",
        "#0000DD",
        "#0000E6",
        "#0000FF",
        "#0000CC"
      ]
    },
    gold: {
      colors: [
        "#FFD700",
        "#D4AF37",
        "#DAA520",
        "#AE8913",
        "#CFB53B",
        "#D4AF37",
        "#C5B358",
        "#D4AF37",
        "#D4AF37",
        "#D4AF37",
        "#D4AF37",
        "#CFB53B",
        "#CFB53B"
      ]
    },
    orange: {
      colors: ["#FFA500", "#FFA500", "#ffaf1a", "#FFA501", "#FFA502", "#FFA500"]
    },
    silver: {
      colors: [
        "#C0C0C0",
        "#C0C0C0",
        "#C0C0C0",
        "#C0C0C0",
        "#DCDCDC",
        "#D3D3D3",
        "#A9A9A9",
        "#C0C0C0",
        "#C0C0C0",
        "#C0C0C0"
      ]
    },
    pink: {
      colors: [
        "#FFB6C1",
        "#FF69B4",
        "#FF1493",
        "#DB7093",
        "#FF69B4",
        "#FF69B4",
        "#FF1493",
        "#FF69B4",
        "#FF69B4"
      ]
    },
    yellow: {
      colors: [
        "#ffff00",
        "#ffff00",
        "#ffff00",
        "#ffff00",
        "#ffff66",
        "#ffff1a",
        "#ffff33",
        "#ffff4d"
      ]
    }
  },
  create: function(what) {
    var append = '<div id="' + what + '" class="hidden"></div>';
    $("body").append(append);
    $("#" + what).append(
      "<canvas id ='" + what + "_canvas' width='100' height='100'></canvas>"
    );
    MATERIAL.material[what].ctx = $("#" + what + "_canvas")[0].getContext("2d");
    MATERIAL.material[what].img = $("#" + what + "_canvas")[0];
    var colors = MATERIAL.material[what].colors;
    var MCTX = MATERIAL.material[what].ctx;

    for (var y = 0; y < 100; y++) {
      for (var x = 0; x < 100; x++) {
        setPixel(x, y, colors.chooseRandom());
      }
    }

    function setPixel(x, y, c) {
      MCTX.fillStyle = c;
      MCTX.fillRect(x, y, 1, 1);
    }
  }
};
////////////////////////////////////////////////
var RoomGrid = function(shape, width, height) {
  this.shape = shape;
  if (width % 2) width--;
  if (height % 2) height--;
  var x = parseInt((ENGINE.mapWIDTH - width) / 2, 10);
  this.x = x;
  this.width = width;
  if (height) {
    this.height = height;
    this.y = parseInt((ENGINE.mapWIDTH - height) / 2, 10);
  } else {
    this.height = width;
    this.y = x;
  }
};
var SquareRM = new RoomGrid("square", ENGINE.INI.STDW, ENGINE.INI.STDW);
var WRectRM = new RoomGrid("wrect", ENGINE.INI.STDW, ENGINE.INI.STDW / 2);
var HRectRM = new RoomGrid("hrect", ENGINE.INI.STDW / 2, ENGINE.INI.STDW);
var StairRM = new RoomGrid("stair", ENGINE.INI.STDW / 3, ENGINE.INI.STDW);
/////////
var AnimationSPRITE = function(x, y, type, howmany) {
  this.x = x;
  this.y = y;
  this.pool = [];
  for (var i = 1; i <= howmany; i++) {
    this.pool.push(type + i);
  }
};
class TextSprite {
  constructor(text, point, frame) {
    this.text = text;
    this.point = point;
    this.frame = frame || ENGINE.INI.FADE_FRAMES; //magic number
  }
}
var TEXTPOOL = {
  pool: [],
  draw: function(layer) {
    var TPL = TEXTPOOL.pool.length;
    if (TPL === 0) return;
    ENGINE.layersToClear.add(layer);
    var CTX = LAYER[layer];
    CTX.font = "10px Consolas";
    CTX.fillStyle = "#FFF";
    CTX.textAlign = "center";
    var vx, vy;
    for (let q = TPL - 1; q >= 0; q--) {
      vx =
        TEXTPOOL.pool[q].point.x - ENGINE.VIEWPORT.vx + ENGINE.INI.GRIDPIX / 2;
      vy =
        TEXTPOOL.pool[q].point.y - ENGINE.VIEWPORT.vy + ENGINE.INI.GRIDPIX / 2;
      CTX.save();
      CTX.globalAlpha =
        (1000 -
          (ENGINE.INI.FADE_FRAMES - TEXTPOOL.pool[q].frame) *
            (1000 / ENGINE.INI.FADE_FRAMES)) /
        1000;
      CTX.fillText(TEXTPOOL.pool[q].text, vx, vy);
      CTX.restore();
      TEXTPOOL.pool[q].frame--;
      if (TEXTPOOL.pool[q].frame <= 0) {
        TEXTPOOL.pool.splice(q, 1);
      }
    }
  }
};
class PartSprite {
  constructor(point, sprite, line, speed) {
    this.point = point;
    this.sprite = sprite;
    this.line = line;
    this.speed = speed;
  }
}
var SpritePOOL = {
  pool: [],
  draw: function(layer) {
    var SPL = SpritePOOL.pool.length;
    if (SPL === 0) return;
    ENGINE.layersToClear.add(layer);
    var vx, vy, line;
    for (var q = SPL - 1; q >= 0; q--) {
      vx = SpritePOOL.pool[q].point.x - ENGINE.VIEWPORT.vx;
      vy = SpritePOOL.pool[q].point.y - ENGINE.VIEWPORT.vy;
      line = SpritePOOL.pool[q].sprite.height - SpritePOOL.pool[q].line;
      ENGINE.drawPart(layer, vx, vy, SpritePOOL.pool[q].sprite, line);
      SpritePOOL.pool[q].line--;
      if (SpritePOOL.pool[q].line <= 0) {
        SpritePOOL.pool.splice(q, 1);
      }
    }
  }
};
///////////////////////////////
var EXPLOSIONS = {
  pool: [],
  draw: function(layer) {
    // draws AnimationSPRITE(x, y, type, howmany) from EXPLOSIONS.pool
    // example new AnimationSPRITE(actor.x, actor.y, "AlienExp", 6)
    layer = layer || "explosion"; // "explosion" layer used if none provided 
    var PL = EXPLOSIONS.pool.length;
    if (PL === 0) return;
    ENGINE.layersToClear.add(layer);
    for (var instance = PL - 1; instance >= 0; instance--) {
      var sprite = EXPLOSIONS.pool[instance].pool.shift();
      ENGINE.spriteDraw(
        layer,
        EXPLOSIONS.pool[instance].x - ENGINE.VIEWPORT.vx,
        EXPLOSIONS.pool[instance].y - ENGINE.VIEWPORT.vy,
        SPRITE[sprite]
      );
      if (EXPLOSIONS.pool[instance].pool.length === 0) {
        EXPLOSIONS.pool.splice(instance, 1);
      }
    }
  }
};
///////////////////////////////////////////////////////
var LiveSPRITE = function(left, right, front, back) {
  this.left = left;
  this.right = right;
  this.front = front;
  this.back = back;
};
var ACTOR = function(sprite_class, x, y, orientation, asset) {
  this.class = sprite_class;
  this.x = x || 0;
  this.y = y || 0;
  this.orientation = orientation;
  this.asset = asset || null;
  //vieport coordinates initialize //still not used
  this.vx = 0;
  this.vy = 0;
  //last sprite used for direction
  this.left_index = 0;
  this.right_index = 0;
  this.front_index = 0;
  this.back_index = 0;

  this.sprite = function(sprite_class) {
    return SPRITE[this.name];
  };

  this.refresh = function() {
    if (this.orientation === null) {
      this.name = this.class;
    } else {
      this.name =
        this.class +
        "_" +
        this.orientation +
        "_" +
        this[this.orientation + "_index"];
    }
    this.width = SPRITE[this.name].width;
    this.height = SPRITE[this.name].height;
  };

  this.refresh();

  this.animateMove = function(orientation) {
    this[orientation + "_index"]++;
    if (this[orientation + "_index"] >= this.asset[orientation].length)
      this[orientation + "_index"] = 0;
    this.refresh();
  };

  this.getOrientation = function(dir) {
    var orientation;
    switch (dir.x) {
      case 1:
        orientation = "right";
        break;
      case -1:
        orientation = "left";
        break;
      case 0:
        switch (dir.y) {
          case 1:
            orientation = "front";
            break;
          case -1:
            orientation = "back";
            break;
          case 0:
            orientation = "front";
            break;
        }
        break;
    }
    return orientation;
  };
};
//

var GRID = {
  gridToCenterPX: function(grid){
    var x = grid.x * ENGINE.INI.GRIDPIX + ENGINE.INI.GRIDPIX / 2;
    var y = grid.y * ENGINE.INI.GRIDPIX + ENGINE.INI.GRIDPIX / 2;
    return { x: x, y: y };
  },
  gridToSprite: function(grid, actor){
    GRID.coordToSprite(GRID.gridToCoord(grid), actor);
  },
  coordToSprite: function(coord, actor) {
    actor.x = coord.x + ENGINE.INI.GRIDPIX / 2;
    actor.y = coord.y + ENGINE.INI.GRIDPIX / 2;
  },
  gridToCoord: function(grid) {
    var x = grid.x * ENGINE.INI.GRIDPIX;
    var y = grid.y * ENGINE.INI.GRIDPIX;
    return new Vector(x,y);
  },
  coordToGrid: function(x, y) {
    var tx = Math.floor(x / ENGINE.INI.GRIDPIX);
    var ty = Math.floor(y / ENGINE.INI.GRIDPIX);
    return { x: tx, y: ty };
  },
  create: function(x, y) {
    var temp = [];
    var string = "".fill("1", x);
    for (var iy = 0; iy < y; iy++) {
      temp.push(string);
    }
    return temp;
  },
  grid: function() {
    var CTX = LAYER.grid;
    var x = 0;
    var y = 0;
    CTX.strokeStyle = "#FFF";
    //horizonal lines
    do {
      y += ENGINE.INI.GRIDPIX;
      CTX.beginPath();
      CTX.setLineDash([1, 3]);
      CTX.moveTo(x, y);
      CTX.lineTo(CTX.canvas.width, y);
      CTX.closePath();
      CTX.stroke();
    } while (y <= CTX.canvas.height);
    //vertical lines
    y = 0;
    do {
      x += ENGINE.INI.GRIDPIX;
      CTX.beginPath();
      CTX.setLineDash([1, 3]);
      CTX.moveTo(x, y);
      CTX.lineTo(x, CTX.canvas.height);
      CTX.closePath();
      CTX.stroke();
    } while (x <= CTX.canvas.width);
  },
  paintText: function(point, text) {
    var CTX = LAYER.start;
    CTX.font = "10px Consolas";
    var y = point.y + ENGINE.INI.GRIDPIX / 2;
    var x = point.x + ENGINE.INI.GRIDPIX / 2;
    CTX.fillStyle = "#FFF";
    CTX.textAlign = "center";
    CTX.fillText(text, x, y);
  },
  paintExits: function() {
    ENGINE.clearLayer("start");
    if (MAP.level.start) {
      GRID.paintText(GRID.gridToCoord(MAP.level.start), "START");
    }
    if (MAP.level.exit) {
      GRID.paintText(GRID.gridToCoord(MAP.level.exit), "EXIT");
    }
  },
  paintNest: function(nest, layer, clear) {
    if (clear) ENGINE.clearLayer(layer);
    var LN = nest.length;
    for (let q = 0; q < LN; q++) {
      let point = GRID.gridToCoord(nest[q].homeGrid);
      if (nest[q].angle !== 270) point.x -= 12;
      if (nest[q].angle !== 0) point.y -= 12;
      ENGINE.draw(layer, point.x, point.y, SPRITE["Nest_" + nest[q].angle]);
    }
  },
  paintWarp: function(warp, layer, clear) {
    if (clear) ENGINE.clearLayer(layer);
    var LN = warp.length;
    for (let q = 0; q < LN; q++) {
      for (var w in warp[q]) {
        if (w === "gridA" || w === "gridB") {
          if (warp[q][w].angle != -1) {
            let point = GRID.gridToCoord(warp[q][w]);
            if (warp[q][w].angle !== 270) point.x -= 12;
            if (warp[q][w].angle !== 0) point.y -= 12;
            ENGINE.draw(
              layer,
              point.x,
              point.y,
              SPRITE["Warp_" + warp[q][w].angle]
            );
          }
        }
      }
    }
  },
  paintDoor: function(door, layer, clear) {
    if (clear) ENGINE.clearLayer(layer);
    var LN = door.length;
    for (let q = 0; q < LN; q++) {
      let point = GRID.gridToCoord(door[q].homeGrid);
      ENGINE.draw(layer, point.x, point.y, SPRITE.door);
    }
  },
  paintKey: function(key, layer, clear) {
    if (clear) ENGINE.clearLayer(layer);
    var LN = key.length;
    var dx = Math.floor(ENGINE.INI.GRIDPIX - SPRITE.key.width) / 2;
    var dy = Math.floor(ENGINE.INI.GRIDPIX - SPRITE.key.height) / 2;
    for (let q = 0; q < LN; q++) {
      let point = GRID.gridToCoord(key[q].homeGrid);
      ENGINE.draw(layer, point.x + dx, point.y + dy, SPRITE.key);
    }
  },
  paintTreasure: function(treasure, layer, clear, list) {
    if (clear) ENGINE.clearLayer(layer);
    var LN = treasure.length;
    for (let q = 0; q < LN; q++) {
      let sprite = SPRITE[list[treasure[q].id]];
      let dx = Math.floor(ENGINE.INI.GRIDPIX - sprite.width) / 2;
      let dy = Math.floor(ENGINE.INI.GRIDPIX - sprite.height) / 2;
      let point = GRID.gridToCoord(treasure[q].homeGrid);
      ENGINE.draw(layer, point.x + dx, point.y + dy, sprite);
    }
  },
  paint: function(grid, floorIMG, wallIMG, drawGrid, drawStart) {
    //paint floor and wall
    var floorCTX = LAYER.floor; //REQ
    var wallCTX = LAYER.wall; // REQ
    ENGINE.clearLayer("floor");
    ENGINE.clearLayer("wall");
    ENGINE.fill(floorCTX, floorIMG);
    ENGINE.fill(wallCTX, wallIMG);
    //paint grid
    if (drawGrid) {
      ENGINE.clearLayer("grid");
      GRID.grid();
    }
    //paint start, exit texts
    if (drawStart) {
      GRID.paintExits();
    }
  },
  repaint: function(grid, floorIMG, wallIMG, drawGrid, drawStart) {
    drawGrid = drawGrid || false;
    drawStart = drawStart || false;
    GRID.paint(grid, floorIMG, wallIMG, drawGrid, drawStart);
    const height = grid.length;
    const width = grid[0].length;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        if (grid[y].charAt(x) === "0") {
          let point = GRID.gridToCoord({ x: x, y: y });
          ENGINE.cutGrid(LAYER.wall, point);
        }
      }
    }
  },
  map: {
    pack: function(grid) {
      var RL = grid.length;
      var converted = [];
      for (var i = 0; i < RL; i++) {
        converted.push(parseInt(grid[i], 2));
      }
      return converted;
    },
    unpack: function(map) {
      var h = map.height;
      var w = map.width;
      if (h != map.grid.length) {
        throw "Map corrupted: height:" + h + " grid.length: " + map.grid.length;
      }
      var binary = [];
      for (var i = 0; i < h; i++) {
        let binTemp = float64ToInt64Binary(map.grid[i]).padLeft(w, "0");
        binary.push(binTemp);
      }
      return binary;
    }
  },
  findSpace: function(grid, map) {
    var h = map.length;
    var w = map[0].length;
    var LN = 4;
    var candidates = [];
    var x, y;
    for (let q = 0; q < LN; q++) {
      x = grid.x + ENGINE.directions[q].x;
      y = grid.y + ENGINE.directions[q].y;
      if (x >= 0 && x <= w && y >= 0 && y <= h) {
        candidates.push({
          x: x,
          y: y
        });
      }
    }
    LN = candidates.length;
    for (let q = LN - 1; q >= 0; q--) {
      let dot = map[candidates[q].y].charAt(candidates[q].x);
      if (dot === "1") {
        candidates.splice(q, 1);
      }
    }
    if (candidates.length > 1) console.log("Nest not at right position ERROR");
    return candidates[0];
  },
  findOrientation: function(grid, space) {
    var vct = { x: space.x - grid.x, y: space.y - grid.y };
    var angle;
    switch (vct.y) {
      case -1:
        angle = 0;
        break;
      case 1:
        angle = 180;
        break;
      case 0:
        if (vct.x === 1) {
          angle = 90;
        } else angle = 270;
    }
    return angle;
  },
  isBlock: function(x, y){
    var block = MAP[GAME.level].grid[y].charAt(x);
    if (block === "1") {
      return true;
    } else return false;
  },
  isDoor: function(x,y){
    var grid = new Vector(x, y);
    var DL = MAP[GAME.level].door.length;
    for (let q  = 0; q < DL; q++){
      if (MAP[GAME.level].door[q].same(grid)) {
        return true;
      }
    }
    return false;
  },
  trueToGrid: function(actor){
    var TX = actor.x - ENGINE.INI.GRIDPIX / 2;
    var TY = actor.y - ENGINE.INI.GRIDPIX / 2;
    var GX = TX / ENGINE.INI.GRIDPIX;
    var GY = TY / ENGINE.INI.GRIDPIX;
    var MX = TX % ENGINE.INI.GRIDPIX;
    var MY = TY % ENGINE.INI.GRIDPIX;
    if (MX || MY){
      return null;
    } else return {x: GX, y: GY};
  }
};
