/* assets for Anxys */
console.log("Assets for Anxys starting .....");

LoadTextures = [
  { srcName: "Wall/BrickWall.jpg", name: "BrickWall" },
  { srcName: "Wall/BrickWall4.jpg", name: "BrickWall4" },
  //title
  { srcName: "Title/AnxysTitle576.jpg", name: "Title" },
];

LoadAudio = [
  { srcName: "Single Photon's Shadow.mp3", name: "Title" },
  { srcName: "OpenGate.mp3", name: "OpenGate" },
];

LoadFonts = [
  { srcName: "MoriaCitadel.ttf", name: "Moria" },
  { srcName: "C64_Pro-STYLE.ttf", name: "C64" },
  { srcName: "CosmicAlien.ttf", name: "Alien" },
  { srcName: "ArcadeClassic.ttf", name: "Arcade" },
  { srcName: "emulogic.ttf", name: "Emulogic" },
  { srcName: "Adore64.ttf", name: "Adore" },
];

LoadPacks = [
  { srcName: "Ghosty.png", count: 4, name: "Ghosty" },
];

LoadSprites = [
  //UI
  { srcName: "UI/aladdin-lamp.png", name: "lamp" },
  { srcName: "UI/ghostLives.png", name: "ghostLives" },
  { srcName: "UI/stage.png", name: "stage" },
  { srcName: "UI/shieldTime.png", name: "shield" },
  //door
  { srcName: "Doors/door.png", name: "door" },
  //key
  { srcName: "Keys/GoldKey.png", name: "key" },
  //items
  { srcName: "Items/Crown.png", name: "Crown" },
  { srcName: "Items/GoldBar.png", name: "GoldBar" },
  { srcName: "Items/GoldCoin.png", name: "GoldCoin" },
  { srcName: "Items/Ring.png", name: "Ring" },
  { srcName: "Items/crownPink.png", name: "crownPink" },
];

LoadRotated = [
  { srcName: "Warp.png", name: "Warp", rotate: { first: 0, last: 270, step: 90 } },
  { srcName: "Nest.png", name: "Nest", rotate: { first: 0, last: 270, step: 90 } },
];

LoadSheets = [
  { srcName: "behemoth", type: "png", count: 4, name: "Behemoth" },
  { srcName: "CoinBoss", type: "png", count: 4, name: "Puffy" },
  { srcName: "death2", type: "png", count: 4, name: "Death2" },
  { srcName: "death1", type: "png", count: 4, name: "Death1" },
  { srcName: "devil", type: "png", count: 4, name: "Devil" },
  { srcName: "dragon2", type: "png", count: 3, name: "LittleDragon" },
  { srcName: "gandalf", type: "png", count: 4, name: "Wizard" },
  { srcName: "Ghost2", type: "png", count: 4, name: "UglyGhost" },
  { srcName: "ghost3", type: "png", count: 4, name: "ScaryGhost" },
  { srcName: "Ghost4", type: "png", count: 4, name: "Ghost" },
  { srcName: "sanke", type: "png", count: 4, name: "Snake" },
  { srcName: "skelly1", type: "png", count: 4, name: "Skeleton" },
  { srcName: "skelly4", type: "png", count: 4, name: "ZombieGirl" },
  { srcName: "zombie2", type: "png", count: 3, name: "Ghoul" },
];

LoadSequences = [
  { srcName: "Sequences/SHIP_exp", name: "ShipExp", type: "png", count: 8 },
  { srcName: "Sequences/ALIEN_exp", name: "AlienExp", type: "png", count: 6 },
];

console.log("Assets for Anxys completed");

/* var BrickWall = new Tile("BrickWall", 128, 128, "jpg");
var BrickWall2 = new Tile("BrickWall2", 225, 225, "jpg");
var BrickWall3 = new Tile("BrickWall3", 200, 200, "jpg");
var BrickWall4 = new Tile("BrickWall4", 128, 72, "jpg");
var BrokenRuin = new Tile("BrokenRuin", 128, 128, "jpg");
var CastleWall = new Tile("CastleWall", 128, 128, "jpg");
var DungeonFloor = new Tile("DungeonFloor", 64, 64, "jpg");
var DungeonFloor2 = new Tile("DungeonFloor2", 256, 256, "jpg");
var DungeonWall = new Tile("DungeonWall", 236, 236, "jpg");
var DungeonWall2 = new Tile("DungeonWall2", 214, 214, "jpg");
var DungeonWall3 = new Tile("DungeonWall3", 128, 128, "jpg");
var Grass = new Tile("Grass", 200, 200, "jpg");
var Gravel = new Tile("Gravel", 200, 200, "jpg");
var HedgeWall = new Tile("HedgeWall", 200, 200, "jpg");
var MorgueFloor = new Tile("MorgueFloor", 128, 128, "jpg");
var OldWall = new Tile("OldWall", 200, 200, "jpg");
var Pavement = new Tile("Pavement", 200, 200, "jpg");
var Pavement2 = new Tile("Pavement2", 200, 200, "jpg");
var RockFloor = new Tile("RockFloor", 128, 128, "jpg");
var SlateWall = new Tile("SlateWall", 256, 256, "jpg");
var StoneFloor = new Tile("StoneFloor", 256, 171, "jpg");
var StoneFloor2 = new Tile("StoneFloor2", 128, 128, "jpg"); //
var StoneFloor3 = new Tile("StoneFloor3", 200, 200, "jpg");
var StoneFloor4 = new Tile("StoneFloor4", 200, 200, "jpg");
var StoneWall = new Tile("StoneWall", 128, 128, "jpg");
var StoneWall2 = new Tile("StoneWall2", 128, 128, "jpg");
var StrangeWall = new Tile("StrangeWall", 128, 128, "jpg");
var ThachFloor = new Tile("ThatchFloor", 200, 200, "jpg");
var WhiteWall = new Tile("WhiteWall", 217, 118, "jpg");
var YellowBrick = new Tile("YellowBrick", 200, 200, "jpg");
var LavaWall = new Tile("LavaWall", 100, 100, "jpg");
var LavaWall2 = new Tile("LavaWall2", 125, 125, "jpg");
var TileFloor = new Tile("TileFloor", 125, 125, "jpg");
var RockWall = new Tile("RockWall", 125, 125, "jpg");
var StoneWall5 = new Tile("StoneWall5", 125, 125, "jpg");
var StoneWall4 = new Tile("StoneWall4", 100, 100, "jpg");
var StoneWall3 = new Tile("StoneWall3", 100, 100, "jpg");
var BrickWall6 = new Tile("BrickWall6", 150, 150, "jpg");
var BrickWall5 = new Tile("BrickWall5", 100, 92, "jpg");
var TlakFloor4 = new Tile("TlakFloor4", 100, 100, "jpg");
var TlakFloor3 = new Tile("TlakFloor3", 150, 150, "jpg");
var TlakFloor2 = new Tile("TlakFloor2", 200, 200, "jpg");
var TlakFloor = new Tile("TlakFloor", 50, 50, "jpg");
var BlackWall = new Tile("BlackWall", 100, 100, "jpg");
var StoneFloor5 = new Tile("StoneFloor5", 250, 146, "jpg");
var WhiteCeramicWall = new Tile("WhiteCeramicWall", 77, 100, "jpg");
var WhiteCeramicWall2 = new Tile("WhiteCeramicWall2", 39, 50, "jpg");
var BlackBrickWall = new Tile("BlackBrickWall", 200, 200, "jpg");
var BlackBrickWall2 = new Tile("BlackBrickWall2", 75, 75, "jpg");
var BrickWall7 = new Tile("BrickWall7", 50, 46, "jpg");
var TlakFloor2b = new Tile("TlakFloor2b", 75, 75, "jpg");
var BlackWall2 = new Tile("BlackWall2", 50, 50, "jpg");
var TlakFloor4b = new Tile("TlakFloor4b", 50, 50, "jpg");
var StoneWall3b = new Tile("StoneWall3b", 50, 50, "jpg");
var WarpTile = new Tile("Warp", 72, 60, "png");
var NestTile = new Tile("Nest", 72, 60, "png");
var Door = new Tile("door", 48, 48, "png", "door");
var GhostLives = new Tile("ghostLives", 23, 24, "png", "ghostLives");
var GoldKey = new Tile("GoldKey", 48, 27, "png", "key");
var GoldBar = new Tile("goldBar", 48, 44, "png", "goldbar");
var Crown = new Tile("crown", 48, 42, "png", "crown");
var Ring = new Tile("ring", 48, 42, "png", "ring");
var Coin = new Tile("goldCoin", 48, 47, "png", "coin");
var Stage = new Tile("stage", 64, 60, "png", "stage");
var Shield = new Tile("shield", 96, 60, "png", "shield");
var Skull = new Tile("skull", 33, 48, "png", "skull");
var Lamp = new Tile("aladdin-lamp", 33, 48, "png", "lamp");
var Tile1 = new Tile("Tile1_48", 48, 48, "png", "Tile1");
var Tile2 = new Tile("Tile2_48", 48, 48, "png", "Tile2");
var Tile3 = new Tile("Tile3_48", 48, 48, "png", "Tile3");
var Tile4 = new Tile("Tile4_48", 48, 48, "png", "Tile4");
var Tile5 = new Tile("Tile5_48", 48, 48, "png", "Tile5");
var AExp1 = new Tile("ALIEN_exp_01", 48, 51, "png", "AlienExp1");
var AExp2 = new Tile("ALIEN_exp_02", 58, 57, "png", "AlienExp2");
var AExp3 = new Tile("ALIEN_exp_03", 58, 58, "png", "AlienExp3");
var AExp4 = new Tile("ALIEN_exp_04", 55, 54, "png", "AlienExp4");
var AExp5 = new Tile("ALIEN_exp_05", 49, 46, "png", "AlienExp5");
var AExp6 = new Tile("ALIEN_exp_06", 42, 38, "png", "AlienExp6");
var SExp1 = new Tile("SHIP_exp_01", 42, 53, "png", "ShipExp1");
var SExp2 = new Tile("SHIP_exp_02", 95, 90, "png", "ShipExp2");
var SExp3 = new Tile("SHIP_exp_03", 118, 111, "png", "ShipExp3");
var SExp4 = new Tile("SHIP_exp_04", 130, 125, "png", "ShipExp4");
var SExp5 = new Tile("SHIP_exp_05", 156, 146, "png", "ShipExp5");
var SExp6 = new Tile("SHIP_exp_06", 186, 167, "png", "ShipExp6");
var SExp7 = new Tile("SHIP_exp_07", 148, 131, "png", "ShipExp7");
var SExp8 = new Tile("SHIP_exp_08", 123, 100, "png", "ShipExp8"); */


////Spritesheets


/* var ghost1_left = new Tile(
  "ghost1_left",
  192,
  48,
  "png",
  "ghost1_left",
  true,
  4
);
var ghost1_right = new Tile(
  "ghost1_right",
  192,
  48,
  "png",
  "ghost1_right",
  true,
  4
);
var ghost1_front = new Tile(
  "ghost1_front",
  192,
  48,
  "png",
  "ghost1_front",
  true,
  4
);
var ghost1_back = new Tile(
  "ghost1_back",
  192,
  48,
  "png",
  "ghost1_back",
  true,
  4
);
var Snake_left = new Tile("sanke_left", 192, 48, "png", "Snake_left", true, 4);
var Snake_right = new Tile(
  "sanke_right",
  192,
  48,
  "png",
  "Snake_right",
  true,
  4
);
var Snake_front = new Tile(
  "sanke_front",
  192,
  48,
  "png",
  "Snake_front",
  true,
  4
);
var Snake_back = new Tile("sanke_back", 192, 48, "png", "Snake_back", true, 4);
var ghost4_left = new Tile(
  "Ghost4_left",
  288,
  48,
  "png",
  "ghost4_left",
  true,
  6
);
var ghost4_right = new Tile(
  "Ghost4_right",
  288,
  48,
  "png",
  "ghost4_right",
  true,
  6
);
var ghost4_back = new Tile(
  "Ghost4_back",
  240,
  48,
  "png",
  "ghost4_back",
  true,
  5
);
var ghost4_front = new Tile(
  "Ghost4_front",
  240,
  48,
  "png",
  "ghost4_front",
  true,
  5
);
var Skeleton_left = new Tile(
  "skelly1_left",
  192,
  48,
  "png",
  "Skeleton_left",
  true,
  4
);
var Skeleton_right = new Tile(
  "skelly1_right",
  192,
  48,
  "png",
  "Skeleton_right",
  true,
  4
);
var Skeleton_front = new Tile(
  "skelly1_front",
  192,
  48,
  "png",
  "Skeleton_front",
  true,
  4
);
var Skeleton_back = new Tile(
  "skelly1_back",
  192,
  48,
  "png",
  "Skeleton_back",
  true,
  4
);
var Devil_left = new Tile("devil_left", 192, 48, "png", "Devil_left", true, 4);
var Devil_right = new Tile(
  "devil_right",
  192,
  48,
  "png",
  "Devil_right",
  true,
  4
);
var Devil_front = new Tile(
  "devil_front",
  192,
  48,
  "png",
  "Devil_front",
  true,
  4
);
var Devil_back = new Tile("devil_back", 192, 48, "png", "Devil_back", true, 4);
var Skeleton4_left = new Tile(
  "skelly4_left",
  192,
  48,
  "png",
  "Skeleton4_left",
  true,
  4
);
var Skeleton4_right = new Tile(
  "skelly4_right",
  192,
  48,
  "png",
  "Skeleton4_right",
  true,
  4
);
var Skeleton4_front = new Tile(
  "skelly4_front",
  192,
  48,
  "png",
  "Skeleton4_front",
  true,
  4
);
var Skeleton4_back = new Tile(
  "skelly4_back",
  192,
  48,
  "png",
  "Skeleton4_back",
  true,
  4
);
var Zombie_left = new Tile(
  "zombie2_left",
  144,
  48,
  "png",
  "Zombie_left",
  true,
  3
);
var Zombie_right = new Tile(
  "zombie2_right",
  144,
  48,
  "png",
  "Zombie_right",
  true,
  3
);
var Zombie_front = new Tile(
  "zombie2_front",
  144,
  48,
  "png",
  "Zombie_front",
  true,
  3
);
var Zombie_back = new Tile(
  "zombie2_back",
  144,
  48,
  "png",
  "Zombie_back",
  true,
  3
);
var Death2_left = new Tile(
  "death2_left",
  192,
  48,
  "png",
  "Death2_left",
  true,
  4
);
var Death2_right = new Tile(
  "death2_right",
  192,
  48,
  "png",
  "Death2_right",
  true,
  4
);
var Death2_front = new Tile(
  "death2_front",
  192,
  48,
  "png",
  "Death2_front",
  true,
  4
);
var Death2_back = new Tile(
  "death2_back",
  192,
  48,
  "png",
  "Death2_back",
  true,
  4
);
var Death1_left = new Tile(
  "death1_left",
  192,
  48,
  "png",
  "Death1_left",
  true,
  4
);
var Death1_right = new Tile(
  "death1_right",
  192,
  48,
  "png",
  "Death1_right",
  true,
  4
);
var Death1_front = new Tile(
  "death1_front",
  192,
  48,
  "png",
  "Death1_front",
  true,
  4
);
var Death1_back = new Tile(
  "death1_back",
  192,
  48,
  "png",
  "Death1_back",
  true,
  4
); */

/* var World = {
  wall: [
    BrickWall,
    BrickWall2,
    BrickWall3,
    BrickWall4,
    DungeonWall,
    DungeonWall2,
    DungeonWall3,
    WhiteWall,
    CastleWall,
    HedgeWall,
    OldWall,
    SlateWall,
    StoneWall,
    StoneWall2,
    StoneWall3b,
    StrangeWall,
    LavaWall,
    LavaWall2,
    RockWall,
    StoneWall5,
    StoneWall4,
    StoneWall3,
    BrickWall6,
    BrickWall7,
    BrickWall5,
    BlackWall,
    BlackWall2,
    WhiteCeramicWall,
    WhiteCeramicWall2,
    BlackBrickWall,
    BlackBrickWall2
  ],
  floor: [
    MorgueFloor,
    TileFloor,
    TlakFloor4,
    TlakFloor4b,
    TlakFloor3,
    TlakFloor2,
    TlakFloor2b,
    TlakFloor,
    DungeonFloor,
    DungeonFloor2,
    StoneFloor,
    BrokenRuin,
    StoneFloor2,
    StoneFloor3,
    StoneFloor4,
    StoneFloor5,
    Grass,
    Gravel,
    Pavement,
    Pavement2,
    RockFloor,
    ThachFloor,
    YellowBrick
  ],
  tile: [Tile1, Tile2, Tile3, Tile4, Tile5],
  sheet: [
    ghost1_back,
    ghost1_front,
    ghost1_left,
    ghost1_right,
    Snake_back,
    Snake_front,
    Snake_left,
    Snake_right,
    ghost4_back,
    ghost4_front,
    ghost4_left,
    ghost4_right,
    Skeleton_left,
    Skeleton_right,
    Skeleton_front,
    Skeleton_back,
    Devil_left,
    Devil_right,
    Devil_front,
    Devil_back,
    Skeleton4_front,
    Skeleton4_left,
    Skeleton4_back,
    Skeleton4_right,
    Zombie_left,
    Zombie_right,
    Zombie_front,
    Zombie_back,
    Death2_left,
    Death2_right,
    Death2_front,
    Death2_back,
    Death1_back,
    Death1_front,
    Death1_left,
    Death1_right,
  ],
  ornaments: [WarpTile, NestTile, Door],
  animation: [
    AExp1,
    AExp2,
    AExp3,
    AExp4,
    AExp5,
    AExp6,
    SExp1,
    SExp2,
    SExp3,
    SExp4,
    SExp5,
    SExp6,
    SExp7,
    SExp8
  ],
  title: [GhostLives, Stage, Shield, Skull, Lamp],
  items: [GoldKey, GoldBar, Crown, Ring, Coin]
}; */

/* var Creation = [
  {
    origin: WarpTile,
    name: "Warp",
    angles: [0, 90, 180, 270]
  },
  {
    origin: NestTile,
    name: "Nest",
    angles: [0, 90, 180, 270]
  }
]; */

/* var ASSETS = {
  build: function () {
    ASSET.ghost1 = new LiveSPRITE(
      [
        SPRITE.ghost1_left_0,
        SPRITE.ghost1_left_1,
        SPRITE.ghost1_left_2,
        SPRITE.ghost1_left_3
      ],
      [
        SPRITE.ghost1_right_0,
        SPRITE.ghost1_right_1,
        SPRITE.ghost1_right_2,
        SPRITE.ghost1_right_3
      ],
      [
        SPRITE.ghost1_front_0,
        SPRITE.ghost1_front_1,
        SPRITE.ghost1_front_2,
        SPRITE.ghost1_front_3
      ],
      [
        SPRITE.ghost1_back_0,
        SPRITE.ghost1_back_1,
        SPRITE.ghost1_back_2,
        SPRITE.ghost1_back_3
      ]
    );
    //
    ASSET.Snake = new LiveSPRITE(
      [
        SPRITE.Snake_left_0,
        SPRITE.Snake_left_1,
        SPRITE.Snake_left_2,
        SPRITE.Snake_left_3
      ],
      [
        SPRITE.Snake_right_0,
        SPRITE.Snake_right_1,
        SPRITE.Snake_right_2,
        SPRITE.Snake_right_3
      ],
      [
        SPRITE.Snake_front_0,
        SPRITE.Snake_front_1,
        SPRITE.Snake_front_2,
        SPRITE.Snake_front_3
      ],
      [
        SPRITE.Snake_back_0,
        SPRITE.Snake_back_1,
        SPRITE.Snake_back_2,
        SPRITE.Snake_back_3
      ]
    );
    //
    ASSET.ghost4 = new LiveSPRITE(
      [
        SPRITE.ghost4_left_0,
        SPRITE.ghost4_left_1,
        SPRITE.ghost4_left_2,
        SPRITE.ghost4_left_3,
        SPRITE.ghost4_left_4,
        SPRITE.ghost4_left_5
      ],
      [
        SPRITE.ghost4_right_0,
        SPRITE.ghost4_right_1,
        SPRITE.ghost4_right_2,
        SPRITE.ghost4_right_3,
        SPRITE.ghost4_right_4,
        SPRITE.ghost4_right_5
      ],
      [
        SPRITE.ghost4_front_0,
        SPRITE.ghost4_front_1,
        SPRITE.ghost4_front_2,
        SPRITE.ghost4_front_3,
        SPRITE.ghost4_front_4
      ],
      [
        SPRITE.ghost4_back_0,
        SPRITE.ghost4_back_1,
        SPRITE.ghost4_back_2,
        SPRITE.ghost4_back_3,
        SPRITE.ghost4_back_4
      ]
    );
    //
    //
    ASSET.Skeleton = new LiveSPRITE(
      [
        SPRITE.Skeleton_left_0,
        SPRITE.Skeleton_left_1,
        SPRITE.Skeleton_left_2,
        SPRITE.Skeleton_left_3
      ],
      [
        SPRITE.Skeleton_right_0,
        SPRITE.Skeleton_right_1,
        SPRITE.Skeleton_right_2,
        SPRITE.Skeleton_right_3
      ],
      [
        SPRITE.Skeleton_front_0,
        SPRITE.Skeleton_front_1,
        SPRITE.Skeleton_front_2,
        SPRITE.Skeleton_front_3
      ],
      [
        SPRITE.Skeleton_back_0,
        SPRITE.Skeleton_back_1,
        SPRITE.Skeleton_back_2,
        SPRITE.Skeleton_back_3
      ]
    );
    //
    //
    ASSET.Devil = new LiveSPRITE(
      [
        SPRITE.Devil_left_0,
        SPRITE.Devil_left_1,
        SPRITE.Devil_left_2,
        SPRITE.Devil_left_3
      ],
      [
        SPRITE.Devil_right_0,
        SPRITE.Devil_right_1,
        SPRITE.Devil_right_2,
        SPRITE.Devil_right_3
      ],
      [
        SPRITE.Devil_front_0,
        SPRITE.Devil_front_1,
        SPRITE.Devil_front_2,
        SPRITE.Devil_front_3
      ],
      [
        SPRITE.Devil_back_0,
        SPRITE.Devil_back_1,
        SPRITE.Devil_back_2,
        SPRITE.Devil_back_3
      ]
    );
    //
    //
    ASSET.Skeleton4 = new LiveSPRITE(
      [
        SPRITE.Skeleton4_left_0,
        SPRITE.Skeleton4_left_1,
        SPRITE.Skeleton4_left_2,
        SPRITE.Skeleton4_left_3
      ],
      [
        SPRITE.Skeleton4_right_0,
        SPRITE.Skeleton4_right_1,
        SPRITE.Skeleton4_right_2,
        SPRITE.Skeleton4_right_3
      ],
      [
        SPRITE.Skeleton4_front_0,
        SPRITE.Skeleton4_front_1,
        SPRITE.Skeleton4_front_2,
        SPRITE.Skeleton4_front_3
      ],
      [
        SPRITE.Skeleton4_back_0,
        SPRITE.Skeleton4_back_1,
        SPRITE.Skeleton4_back_2,
        SPRITE.Skeleton4_back_3
      ]
    );
    //
    //
    ASSET.Ghoul = new LiveSPRITE(
      [SPRITE.Zombie_left_0, SPRITE.Zombie_left_1, SPRITE.Zombie_left_2],
      [SPRITE.Zombie_right_0, SPRITE.Zombie_right_1, SPRITE.Zombie_right_2],
      [SPRITE.Zombie_front_0, SPRITE.Zombie_front_1, SPRITE.Zombie_front_2],
      [SPRITE.Zombie_back_0, SPRITE.Zombie_back_1, SPRITE.Zombie_back_2]
    );
    //
    ASSET.Death2 = new LiveSPRITE(
      [
        SPRITE.Death2_left_0,
        SPRITE.Death2_left_1,
        SPRITE.Death2_left_2,
        SPRITE.Death2_left_3
      ],
      [
        SPRITE.Death2_right_0,
        SPRITE.Death2_right_1,
        SPRITE.Death2_right_2,
        SPRITE.Death2_right_3
      ],
      [
        SPRITE.Death2_front_0,
        SPRITE.Death2_front_1,
        SPRITE.Death2_front_2,
        SPRITE.Death2_front_3
      ],
      [
        SPRITE.Death2_back_0,
        SPRITE.Death2_back_1,
        SPRITE.Death2_back_2,
        SPRITE.Death2_back_3
      ]
    );
    //
    ASSET.Death1 = new LiveSPRITE(
      [
        SPRITE.Death1_left_0,
        SPRITE.Death1_left_1,
        SPRITE.Death1_left_2,
        SPRITE.Death1_left_3
      ],
      [
        SPRITE.Death1_right_0,
        SPRITE.Death1_right_1,
        SPRITE.Death1_right_2,
        SPRITE.Death1_right_3
      ],
      [
        SPRITE.Death1_front_0,
        SPRITE.Death1_front_1,
        SPRITE.Death1_front_2,
        SPRITE.Death1_front_3
      ],
      [
        SPRITE.Death1_back_0,
        SPRITE.Death1_back_1,
        SPRITE.Death1_back_2,
        SPRITE.Death1_back_3
      ]
    );
    //
  }
}; */



/* class SearchNode {
  constructor(HG, goal, stack, path) {
    this.grid = HG;
    this.prevDir = stack;
    this.path = path || 0;
    this.dist = this.grid.distance(goal);
    this.priority = this.path + this.dist;
  }
}
class NodeQ {
  constructor() {
    this.list = [];
  }
  queue(node) {
    var included = false;
    for (let q = 0; q < this.list.length; q++) {
      if (this.list[q].priority > node.priority) {
        this.list.splice(q, 0, node);
        included = true;
        break;
      }
    }
    if (!included) this.list.push(node);
  }
} */
