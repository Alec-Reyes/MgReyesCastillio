//rotates point around origin
//angle is in radian
export function rotatePoint(x, y, angle) {
  return [
    x * Math.cos(angle) - y * Math.sin(angle),
    y * Math.cos(angle) + x * Math.sin(angle),
  ];
}

//rounds angle to make it 0 to 360
export function roundAngle(angle){
  return angle - Math.floor(angle / 360) * 360;
}

//returnes the squared distance between 2 2d points
export function sqDist2d(a, b) {
  return (
    Math.pow((a[0] - b[0]), 2) +
    Math.pow((a[1] - b[1]), 2)
  );
}

//returnes the squared distance between 2 3d points
export function sqDist3d(a, b) {
  return (
    Math.pow((a[0] - b[0]), 2) +
    Math.pow((a[1] - b[1]), 2) +
    Math.pow((a[2] - b[2]), 2)
  );
}

//returns angle between 2 2d points and origin as center
//https://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points
//returns radians
export function angle2d(a, b){
  return Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
}

//returns angle between 2 3d points and origin as center
//https://math.stackexchange.com/questions/59/calculating-an-angle-from-2-points-in-space
//returns radians
export function angle3d(a, b){
  let dot = (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
  let aMag = Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[0], 2));
  let bMag = Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2) + Math.pow(b[0], 2));

  return Math.acos(dot / (aMag * bMag));
}

//https://stackoverflow.com/questions/34050929/3d-point-rotation-algorithm
//rotates a point around another point
//angles are in radians
export function rotate3dPoint(point, center, yaw, pitch, roll){
  let result = [];

  point[0] -= center[0];
  point[1] -= center[1];
  point[2] -= center[2];

  let cosa = Math.cos(yaw);
  let sina = Math.sin(yaw);

  let cosb = Math.cos(pitch);
  let sinb = Math.sin(pitch);

  let cosc = Math.cos(roll);
  let sinc = Math.sin(roll);

  result[0] = (cosa*cosb)*point[0] + (cosa*sinb*sinc - sina*cosc)*point[1] + (cosa*sinb*cosc + sina*sinc)*point[2];
  result[1] = (sina*cosb)*point[0] + (sina*sinb*sinc + cosa*cosc)*point[1] + (sina*sinb*cosc - cosa*sinc)*point[2];
  result[2] = (-sinb)*point[0] + (cosb*sinc)*point[1] + (cosb*cosc)*point[2];

  result[0] += center[0];
  result[1] += center[1];
  result[2] += center[2];

  return result;
}

//converts string into array of moves and returns null if not correctly formatted
//moves is a string
export function convertMoves(moves){
  const moveSym = ["U", "D", "R", "L", "F", "B", "M", "E", "S", "u", "d", "r", "l", "f", "b", "Uw", "Dw", "Rw", "Lw", "Fw", "Bw", "x", "y", "z"];
  const remove = [" ", "(", ")", "[", "]", ","];
  let result = [];

  //console.log("Original: " + moves);

  remove.forEach((c) => {moves = moves.replaceAll(c, "")});

  //console.log("Pruned: " + moves);

  while(moves.length > 0){
    let m = null;
    moveSym.some(move => {
      if(moves.startsWith(move))
        m = move;
      return m != null;
    });
    if(m == null) return null;
    else{
      result.push(moves.substring(0, m.length));
      moves = moves.slice(m.length);
      if(moves.startsWith("'") || moves.startsWith("2")){
        result[result.length - 1] += moves.charAt(0);
        moves = moves.slice(1);
      }
    }
  }

  //console.log(result);

  return result;
}

//new convertt3dto2d function

//z up
//x y sides

//CAMERA
//on 0 yaw it looks at the x+ direction and turns towards y+
//on 0 pitch it looks at the z+ direction and turns towards x+
//on 0 roll it looks at the y+ direction and turns towards z+
//yaw rotates around z
//pitch rotates around y
//roll rotates around x

export function c3dto2d(camera, points) {
  let results = [];
  let fovWidth = Math.tan((camera.fov * Math.PI) / 360) * 2;

  //converts the camera angles from degrees to radianss
  let radYaw = (camera.yaw * Math.PI) / 180;
  let radPitch = (camera.pitch * Math.PI) / 180;
  let radRoll = (camera.roll * Math.PI) / 180;

  points.forEach(function (point) {
    let rPoint = [0, 0, 0];

    //find the point coords relative to the camera
    rPoint[0] = point[0] - camera.x;
    rPoint[1] = point[1] - camera.y;
    rPoint[2] = point[2] - camera.z;

    //console.log(point);

    //rotate point around origin
    //yaw
    let r = rotatePoint(rPoint[0], rPoint[1], radYaw);
    rPoint[0] = r[0];
    rPoint[1] = r[1];
    //pitch
    r = rotatePoint(rPoint[2], rPoint[0], radPitch);
    rPoint[2] = r[0];
    rPoint[0] = r[1];
    //roll
    r = rotatePoint(rPoint[1], rPoint[2], radRoll);
    rPoint[1] = r[0];
    rPoint[2] = r[1];

    //calc x
    let x =
      Math.abs(rPoint[1] / (rPoint[0] == 0 ? 0.001 : rPoint[0])) *
      (rPoint[1] > 0 ? -1 : 1) *
      (rPoint[0] >= 0 ? 1 : 100);

    x = x * (camera.width / fovWidth) + camera.width / 2;

    //calc y
    let y =
      Math.abs(rPoint[2] / (rPoint[0] == 0 ? 0.001 : rPoint[0])) *
      (rPoint[2] > 0 ? -1 : 1) *
      (rPoint[0] >= 0 ? 1 : 100);

    y = y * (camera.width / fovWidth) + camera.width / 2;

    // console.log("x: " + x + " y: " + y);

    results.push([x, y]);
  });

  return results;
}

//colors
const W = "#ffffff";
const G = "#00D800";
const B = "#0000F2";
const R = "#EE0000";
const O = "#FFA100";
const Y = "#FEFE00";
const N = "#3d3d3d";

//represents a rubiks cube and handles turns and moves
export class Cube {
  constructor(scramble, stickers) {
    if(stickers != undefined){
      this.prevStickers = JSON.parse(JSON.stringify(stickers));
      this.stickers = JSON.parse(JSON.stringify(stickers));
    }
    else{
    //white top green front
    this.prevStickers = null;
    this.stickers = {
        U: [
          [W, W, W],
          [W, W, W],
          [W, W, W],
        ],
        D: [
          [Y, Y, Y],
          [Y, Y, Y],
          [Y, Y, Y],
        ],
        F: [
          [G, G, G],
          [G, G, G],
          [G, G, G],
        ],
        B: [
          [B, B, B],
          [B, B, B],
          [B, B, B],
        ],
        R: [
          [R, R, R],
          [R, R, R],
          [R, R, R],
        ],
        L: [
          [O, O, O],
          [O, O, O],
          [O, O, O],
        ],
      };
    }

    this.turns = [];
    this.rotation = 0;
    this.prevTime = 0;
    this.cycleParams = {
        U:{
          c: [[0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2]],
          s: ["F", "L", "B", "R"]
        },
        u:{
          c: [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]],
          s: ["F", "L", "B", "R"]
        },
        R:{
          c: [[2, 5, 8], [2, 5, 8], [6, 3, 0], [6, 3, 0]],
          s: ["F", "U", "B", "D"]
        },
        r:{
          c: [[1, 2, 4, 5, 7, 8], [1, 2, 4, 5, 7, 8], [7, 6, 4, 3, 1, 0], [7, 6, 4, 3, 1, 0]],
          s: ["F", "U", "B", "D"]
        },
        F:{
          c: [[6, 7, 8], [0, 3, 6], [6, 7, 8], [8, 5, 2]],
          s: ["U", "R", "D", "L"]
        },
        f:{
          c: [[3, 4, 5, 6, 7, 8], [1, 4, 7, 0, 3, 6], [3, 4, 5, 6, 7, 8], [7, 4, 1, 8, 5, 2]],
          s: ["U", "R", "D", "L"]
        },
        B:{
          c: [[0, 1, 2], [6, 3, 0], [0, 1, 2], [2, 5, 8]],
          s: ["U", "L", "D", "R"]
        },
        b:{
          c: [[0, 1, 2, 3, 4, 5], [6, 3, 0, 7, 4, 1], [0, 1, 2, 3, 4, 5], [2, 5, 8, 1, 4, 7]],
          s: ["U", "L", "D", "R"]
        },
        L:{
          c: [[0, 3, 6], [8, 5, 2], [8, 5, 2], [0, 3, 6]],
          s: ["F", "D", "B", "U"]
        },
        l:{
          c: [[0, 3, 6, 1, 4, 7], [8, 5, 2, 7, 4, 1], [8, 5, 2, 7, 4, 1], [0, 3, 6, 1, 4, 7]],
          s: ["F", "D", "B", "U"]
        },
        D:{
          c: [[6, 7, 8], [6, 7, 8], [6, 7, 8], [6, 7, 8]],
          s: ["F", "R", "B", "L"]
        },
        d:{
          c: [[3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8]],
          s: ["F", "R", "B", "L"]
        },
        M:{
          c: [[7, 4, 1], [7, 4, 1], [1, 4, 7], [1, 4, 7]],
          s: ["D", "B", "U", "F"]
        },
        S:{
          c: [[3, 4, 5], [1, 4, 7], [3, 4, 5], [7, 4, 1]],
          s: ["U", "R", "D", "L"]
        },
        E:{
          c: [[3, 4, 5], [3, 4, 5], [3, 4, 5], [3, 4, 5]],
          s: ["F", "R", "B", "L"]
        },
        x:{
          c: [[0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 7, 8], [8, 7, 6, 5, 4, 3, 2, 1, 0], [8, 7, 6, 5, 4, 3, 2, 1, 0]],
          s: ["F", "U", "B", "D"]
        },
        y:{
          c: [[0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 7, 8]],
          s: ["F", "L", "B", "R"]
        },
        z:{
          c: [[0, 1, 2, 3, 4, 5, 6, 7, 8], [2, 5, 8, 1, 4, 7, 0, 3, 6], [0, 1, 2, 3, 4, 5, 6, 7, 8], [6, 3, 0, 7, 4, 1, 8, 5, 2]],
          s: ["U", "R", "D", "L"]
        },
      }
  }

  //function used for cycling the stickers for every turn
  cycleStickers(c, symbols) {
    let tmp = [];
    for(let i = 0; i < c[3].length; i++)
      tmp.push(this.stickers[symbols[3]][Math.floor(c[3][i] / 3)][c[3][i] % 3]);

    for (let i = 3; i > 0; i--) {
      for (let j = 0; j < c[i].length; j++){
        this.stickers[symbols[i]][Math.floor(c[i][j] / 3)][c[i][j] % 3] = this.stickers[symbols[i - 1]][Math.floor(c[i - 1][j] / 3)][c[i - 1][j] % 3];
      }
    }

    for (let j = 0; j < tmp.length; j++)
      this.stickers[symbols[0]][Math.floor(c[0][j] / 3)][c[0][j] % 3] = tmp[j];
  }

  turnFace(turn) {
    let turnSymbol = turn.substring(0, 1);
    let amount = turn.length == 1 ? null : turn.substring(1, 2);

    if ("UuDdFfBbRrLl".includes(turnSymbol)) {
      let tmpSide = JSON.parse(JSON.stringify(this.stickers[turnSymbol.toUpperCase()]));

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (amount == null)
            this.stickers[turnSymbol.toUpperCase()][x][2 - y] = tmpSide[y][x];
          else if (amount == "2")
            this.stickers[turnSymbol.toUpperCase()][2 - y][2 - x] = tmpSide[y][x];
          else this.stickers[turnSymbol.toUpperCase()][2 - x][y] = tmpSide[y][x];
        }
      }

      let rotations = 1;

      if (amount == "2") rotations = 2;
      else if (amount == "'") rotations = 3;

      for (let c = 0; c < rotations; c++) {
        this.cycleStickers(this.cycleParams[turnSymbol].c, this.cycleParams[turnSymbol].s);
      }
    } else if ("MES".includes(turnSymbol)) {
      let rotations = 1;

      if (amount == "2") rotations = 2;
      else if (amount == "'") rotations = 3;

      for (let c = 0; c < rotations; c++) {
        this.cycleStickers(this.cycleParams[turnSymbol].c, this.cycleParams[turnSymbol].s);
      }
    }else if ("xyz".includes(turnSymbol)) {
      let turnFaces = [];

      if(turnSymbol == "x") turnFaces = ["R", "L"];
      else if(turnSymbol == "y") turnFaces = ["U", "D"];
      else if(turnSymbol == "z") turnFaces = ["F", "B"];

      for(let c = 0; c < 2; c++){
        let tmpSide = JSON.parse(JSON.stringify(this.stickers[turnFaces[c]]));
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            if (((amount == null && c == 0) || (amount == "'" && c == 1)))
              this.stickers[turnFaces[c]][x][2 - y] = tmpSide[y][x];
            else if (amount == "2")
              this.stickers[turnFaces[c]][2 - y][2 - x] = tmpSide[y][x];
            else this.stickers[turnFaces[c]][2 - x][y] = tmpSide[y][x];
          }
        }
      }

      let rotations = 1;

      if (amount == "2") rotations = 2;
      else if (amount == "'") rotations = 3;

      for (let c = 0; c < rotations; c++) {
        this.cycleStickers(this.cycleParams[turnSymbol].c, this.cycleParams[turnSymbol].s);
      }
    }
  }

  setTurns(turns) {
    this.turns = turns;
    this.rotation = 0;
    this.prevTime = new Date().getTime();
  }

  draw(canvas, camera, tps) {
    let ctx = canvas.getContext("2d");
    ctx.width = camera.width;
    ctx.height = camera.height;

    ctx.fillStyle = "#ffffff";
    //ctx.fillRect(0, 0, camera.width, camera.height);
    ctx.clearRect(0, 0, camera.width, camera.height);

    //computing rotation

    let turnParams = {
      U: {xI: 0, yI: 1, zI: 2, z: 1.5, r: false, f: "U"},
      u: {xI: 0, yI: 1, zI: 2, z: 1.5, r: false, f: "U"},
      D: {xI: 0, yI: 1, zI: 2, z: -1.5, r: true, f: "D"},
      d: {xI: 0, yI: 1, zI: 2, z: -1.5, r: true, f: "D"},
      R: {xI: 2, yI: 0, zI: 1, z: 1.5, r: false, f: "R"},
      r: {xI: 2, yI: 0, zI: 1, z: 1.5, r: false, f: "R"},
      L: {xI: 2, yI: 0, zI: 1, z: -1.5, r: true, f: "L"},
      l: {xI: 2, yI: 0, zI: 1, z: -1.5, r: true, f: "L"},
      F: {xI: 2, yI: 1, zI: 0, z: 1.5, r: true, f: "F"},
      f: {xI: 2, yI: 1, zI: 0, z: 1.5, r: true, f: "F"},
      B: {xI: 2, yI: 1, zI: 0, z: -1.5, r: false, f: "B"},
      b: {xI: 2, yI: 1, zI: 0, z: -1.5, r: false, f: "B"},
      M: {xI: 2, yI: 0, zI: 1, z: 1.5, r: true, f: ""},
      S: {xI: 2, yI: 1, zI: 0, z: 1.5, r: true, f: ""},
      E: {xI: 0, yI: 1, zI: 2, z: -1.5, r: true, f: ""},
      x: {xI: 2, yI: 0, zI: 1, z: 1.5, r: false, f: "RL"},
      y: {xI: 0, yI: 1, zI: 2, z: 1.5, r: false, f: "UD"},
      z: {xI: 2, yI: 1, zI: 0, z: 1.5, r: true, f: "FB"}
    }

    if(this.turns.length > 0){
      let amount = this.turns[0].charAt(this.turns[0].length - 1);
      let time = new Date().getTime();
      //console.log(time - this.prevTime);

      this.rotation = -(amount == 2 ? 180 : 90) * (tps * (time - this.prevTime) / 1000) * (Math.PI / 180);
      if(amount == "'") this.rotation *= -1;
      if(turnParams[this.turns[0].charAt(0)].r) this.rotation *= -1;
      if(this.rotation < 0) this.rotation += Math.PI * 2;

      if(tps * (time - this.prevTime) / 1000 > 1){
        this.rotation = 0;
        this.turnFace(this.turns[0]);
        this.turns.splice(0, 1);
        this.prevTime = time;
      }
    }

    //UDFBRL
    let params = [
      [this.stickers.U, -1.5, -1.5, 0, 1, 2, 1.5, "U"],
      [this.stickers.D, -1.5, 1.5, 0, 1, 2, -1.5, "D"],
      [this.stickers.F, 1.5, -1.5, 2, 1, 0, 1.5, "F"],
      [this.stickers.B, 1.5, 1.5, 2, 1, 0, -1.5, "B"],
      [this.stickers.R, 1.5, 1.5, 2, 0, 1, 1.5, "R"],
      [this.stickers.L, 1.5, -1.5, 2, 0, 1, -1.5, "L"],
    ];
    let center = [camera.x, camera.y, camera.z];
    let stickerPoints = [];
    let distance = [];

    function genStickers(face, xS, yS, xI, yI, cI, c, f, cube) {
      let points = [];

      let xC = xS < 0 ? 1 : -1;
      let yC = yS < 0 ? 1 : -1;

      //gen points
      const diff = [[0, 0], [1, 0], [1, 1], [0, 1], [0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]];
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let i = 0; i < 8; i++){
            let point = [0, 0, 0];
            point[xI] = xC * (x + diff[i][0]) + xS;
            point[yI] = yC * (y + diff[i][1]) + yS;
            point[cI] = c;

            //rotate
            if(cube.turns.length > 0){
              let param = turnParams[cube.turns[0].charAt(0)];
              let fIdx = cube.cycleParams[cube.turns[0].charAt(0)].s.indexOf(f);
              if(param.f.includes(f) || (fIdx != -1 && cube.cycleParams[cube.turns[0].charAt(0)].c[fIdx].includes(x * 3 + y))){
                let p = rotatePoint(point[param.xI], point[param.yI], cube.rotation);
                point[param.xI] = p[0];
                point[param.yI] = p[1];
              }
            }

            points.push(point);
          }
        }
      }

      //convert points
      let convPoints = c3dto2d(camera, points);

      //add points and distance to array
      for(let c = 0; c < 9; c++){
        let arr = [];
        for(let i = 0; i < 8; i++)
          arr.push(convPoints[c * 8 + i]);
        //adds color to point arr
        arr.push(face[Math.floor(c / 3)][c % 3]);
        stickerPoints.push(arr);
        //add distance from midpoint to camera to array
        distance.push(sqDist3d(center, [(points[c * 8][0] + points[c * 8 + 2][0]) / 2, (points[c * 8][1] + points[c * 8 + 2][1]) / 2, (points[c * 8][2] + points[c * 8 + 2][2]) / 2]));
      }
    }

    //gen stickers
    for (let i = 0; i < 6; i++){
      genStickers(
        params[i][0],
        params[i][1],
        params[i][2],
        params[i][3],
        params[i][4],
        params[i][5],
        params[i][6],
        params[i][7],
        this
      );
    }

    //sort by distance
    let maxIndex = 0;
    for (let i = 0; i < distance.length; i++) {
      maxIndex = i;
      for (let j = i; j < distance.length; j++) {
        if (distance[j] > distance[maxIndex]) maxIndex = j;
      }
      let tmp = distance[maxIndex];
      distance[maxIndex] = distance[i];
      distance[i] = tmp;
      tmp = stickerPoints[maxIndex];
      stickerPoints[maxIndex] = stickerPoints[i];
      stickerPoints[i] = tmp;
    }

    //render stickers
    stickerPoints.forEach(function(points){
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.lineTo(points[2][0], points[2][1]);
      ctx.lineTo(points[3][0], points[3][1]);
      ctx.lineTo(points[0][0], points[0][1]);
      ctx.fillStyle = "#1f1f1f";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(points[4][0], points[4][1]);
      ctx.lineTo(points[5][0], points[5][1]);
      ctx.lineTo(points[6][0], points[6][1]);
      ctx.lineTo(points[7][0], points[7][1]);
      ctx.lineTo(points[4][0], points[4][1]);
      ctx.fillStyle = points[8];
      ctx.fill();
    });
  }
  //instnalty completes any moves that are not finsihed
  instantComplete(){
    let turns = this.turns;
    this.turns = [];
    this.rotation = 0;
    let cube = this;

    turns.forEach(function(move){
      cube.turnFace(move);
    });
  }
  //restors cube to solves state and adds the scramble
  clear(scramble){
    let cube = this;
    if(this.prevStickers == null){
      //white top green front
      this.stickers = {
        U: [
          [W, W, W],
          [W, W, W],
          [W, W, W],
        ],
        D: [
          [Y, Y, Y],
          [Y, Y, Y],
          [Y, Y, Y],
        ],
        F: [
          [G, G, G],
          [G, G, G],
          [G, G, G],
        ],
        B: [
          [B, B, B],
          [B, B, B],
          [B, B, B],
        ],
        R: [
          [R, R, R],
          [R, R, R],
          [R, R, R],
        ],
        L: [
          [O, O, O],
          [O, O, O],
          [O, O, O],
        ],
      };
    }else{
      this.stickers = JSON.parse(JSON.stringify(this.prevStickers));
    }
    
    scramble.forEach(function(move){
      cube.turnFace(move);
    });
  }
}

//represents where the observer of the world is
//if set the xRot and yRot (anglular coords) it will set the pos to its corresponing x, y, z
export class Camera{
  constructor(x, y, z, yaw, pitch, roll, fov, width, height, xRot, yRot) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.roll = roll;
    this.pitch = pitch;
    this.fov = fov;
    this.width = width;
    this.height = height;
    this.xRot = 0;
    this.yRot = 0;
    if(xRot != null && yRot != null){
      this.xRot = xRot;
      this.yRot = yRot;
      let r = rotatePoint(Math.sqrt(sqDist3d([0, 0, 0], [x, y, z])), z, this.yRot * Math.PI / 180);
      this.x = Math.cos(this.xRot * Math.PI / 180) * r[0];
      this.y = Math.sin(this.xRot * Math.PI / 180) * r[0];
      this.z = r[1];
    }
  }

  rotArPoint(yaw, pitch, roll, point){
    //calcs cameras position
    let pos = rotate3dPoint([this.x, this.y, this.z], point, yaw * Math.PI / 180, pitch * Math.PI / 180, roll * Math.PI / 180);

    //console.log(pos);
    //console.log(this.getPos());

    this.x = pos[0];
    this.y = pos[1];
    this.z = pos[2];
  }

  getPos(){
    return [this.x, this.y, this.z];
  }

  lookAtOrigin(){
    this.yaw = roundAngle(180 - (Math.atan2(this.y, this.x) / Math.PI * 180));
    this.pitch = roundAngle(360 - Math.acos(sqDist2d(this.getPos(), [0, 0]) / sqDist3d(this.getPos(), [0, 0, 0])) / Math.PI * 180 * (this.z < 0 ? -1 : 1));

    //console.log(this.pitch);
  }
}

export function rotateCameraByMouse(camera, homePos, event){
  if(event.buttons == 1){
    //calc horizontal rot
    camera.xRot = roundAngle(camera.xRot - 90 * (event.movementX / camera.width));
    //calc vertical rot
    let yRot = roundAngle(camera.yRot + 90 * (event.movementY / camera.height));
    if(yRot < 90 || yRot > 270) camera.yRot = yRot;
    let r = rotatePoint(Math.sqrt(sqDist3d([0, 0, 0], homePos)), homePos[2], camera.yRot * Math.PI / 180);
    camera.x = Math.cos(camera.xRot * Math.PI / 180) * r[0];
    camera.y = Math.sin(camera.xRot * Math.PI / 180) * r[0];
    camera.z = r[1];
  }
}

export function rotateCameraByTouch(camera, homePos, event, prevEvent){
  if(prevEvent != null){
    //calc horizontal rot
    camera.xRot = roundAngle(camera.xRot - 90 * ((prevEvent.touches[0].pageX - event.touches[0].pageX) / camera.width));
    //calc vertical rot
    let yRot = roundAngle(camera.yRot + 90 * ((prevEvent.touches[0].pageY - event.touches[0].pageY) / camera.height));
    if(yRot < 90 || yRot > 270) camera.yRot = yRot;
    let r = rotatePoint(Math.sqrt(sqDist3d([0, 0, 0], homePos)), homePos[2], camera.yRot * Math.PI / 180);
    camera.x = Math.cos(camera.xRot * Math.PI / 180) * r[0];
    camera.y = Math.sin(camera.xRot * Math.PI / 180) * r[0];
    camera.z = r[1];
  }
}

function Scramble(){
  this.PLL = {
    U: [
      [W, W, W],
      [W, W, W],
      [W, W, W],
    ],
    D: [
      [Y, Y, Y],
      [Y, Y, Y],
      [Y, Y, Y],
    ],
    F: [
      [G, G, G],
      [G, G, G],
      [G, G, G],
    ],
    B: [
      [B, B, B],
      [B, B, B],
      [B, B, B],
    ],
    R: [
      [R, R, R],
      [R, R, R],
      [R, R, R],
    ],
    L: [
      [O, O, O],
      [O, O, O],
      [O, O, O],
    ],
  };

  this.OLL = {
    U: [
      [W, W, W],
      [W, W, W],
      [W, W, W],
    ],
    D: [
      [Y, Y, Y],
      [Y, Y, Y],
      [Y, Y, Y],
    ],
    F: [
      [G, G, G],
      [G, G, G],
      [N, N, N],
    ],
    B: [
      [B, B, B],
      [B, B, B],
      [N, N, N],
    ],
    R: [
      [R, R, R],
      [R, R, R],
      [N, N, N],
    ],
    L: [
      [O, O, O],
      [O, O, O],
      [N, N, N],
    ],
  };

  this.F2L = {
    U: [
      [W, W, W],
      [W, W, W],
      [W, W, W],
    ],
    D: [
      [N, N, N],
      [N, N, N],
      [N, N, N],
    ],
    F: [
      [G, G, G],
      [G, G, G],
      [N, N, N],
    ],
    B: [
      [B, B, B],
      [B, B, B],
      [N, N, N],
    ],
    R: [
      [R, R, R],
      [R, R, R],
      [N, N, N],
    ],
    L: [
      [O, O, O],
      [O, O, O],
      [N, N, N],
    ],
  };

  this.CROSS = {
    U: [
      [N, W, N],
      [W, W, W],
      [N, W, N],
    ],
    D: [
      [N, N, N],
      [N, N, N],
      [N, N, N],
    ],
    F: [
      [N, G, N],
      [N, G, N],
      [N, N, N],
    ],
    B: [
      [N, B, N],
      [N, B, N],
      [N, N, N],
    ],
    R: [
      [N, R, N],
      [N, R, N],
      [N, N, N],
    ],
    L: [
      [N, O, N],
      [N, O, N],
      [N, N, N],
    ],
  };

  this.FL = {
    U: [
      [W, W, W],
      [W, W, W],
      [W, W, W],
    ],
    D: [
      [N, N, N],
      [N, N, N],
      [N, N, N],
    ],
    F: [
      [G, G, G],
      [N, G, N],
      [N, N, N],
    ],
    B: [
      [B, B, B],
      [N, B, N],
      [N, N, N],
    ],
    R: [
      [R, R, R],
      [N, R, N],
      [N, N, N],
    ],
    L: [
      [O, O, O],
      [N, O, N],
      [N, N, N],
    ],
  };
}

export const Scrambles = new Scramble();