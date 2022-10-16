//rotates point around origin
//angle is in radian
export function rotatePoint(x, y, angle) {
  return [
    x * Math.cos(angle) - y * Math.sin(angle),
    y * Math.cos(angle) + x * Math.sin(angle),
  ];
}

//returnes the squared distance between 2 points
export function sqDist(a, b) {
  return (
    (a[0] - b[0]) * (a[0] - b[0]) +
    (a[1] - b[1]) * (a[1] - b[1]) +
    (a[2] - b[2]) * (a[2] - b[2])
  );
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

//represents a rubiks cube and handles turns and moves
export class Cube {
  constructor(scramble) {
    //colors
    const W = "#ffffff";
    const G = "#00D800";
    const B = "#0000F2";
    const R = "#EE0000";
    const O = "#FFA100";
    const Y = "#FEFE00";

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

    this.turns = [];
    this.rotation = 0;
    this.prevTime = 0;
  }

  //function used for cycling the stickers for every turn
  cycleStickers(c, symbols) {
    let tmp = [
      this.stickers[symbols[3]][Math.floor(c[3][0] / 3)][c[3][0] % 3],
      this.stickers[symbols[3]][Math.floor(c[3][1] / 3)][c[3][1] % 3],
      this.stickers[symbols[3]][Math.floor(c[3][2] / 3)][c[3][2] % 3],
    ];

    for (let i = 3; i > 0; i--) {
      for (let j = 0; j < 3; j++)
        this.stickers[symbols[i]][Math.floor(c[i][j] / 3)][c[i][j] % 3] =
          this.stickers[symbols[i - 1]][Math.floor(c[i - 1][j] / 3)][
            c[i - 1][j] % 3
          ];
    }

    for (let j = 0; j < 3; j++)
      this.stickers[symbols[0]][Math.floor(c[0][j] / 3)][c[0][j] % 3] = tmp[j];
  }

  turnFace(turn) {
    let turnSymbol = turn.substring(0, 1);
    let amount = turn.length == 1 ? null : turn.substring(1, 2);

    if ("UDFBRL".includes(turnSymbol)) {
      let tmpSide = JSON.parse(JSON.stringify(this.stickers[turnSymbol]));

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (amount == null)
            this.stickers[turnSymbol][x][2 - y] = tmpSide[y][x];
          else if (amount == "2")
            this.stickers[turnSymbol][2 - y][2 - x] = tmpSide[y][x];
          else this.stickers[turnSymbol][2 - x][y] = tmpSide[y][x];
        }
      }

      let rotations = 1;

      if (amount == "2") rotations = 2;
      else if (amount == "'") rotations = 3;

      for (let c = 0; c < rotations; c++) {
        if (turnSymbol == "U")
          this.cycleStickers(
            [
              [0, 1, 2],
              [0, 1, 2],
              [0, 1, 2],
              [0, 1, 2],
            ],
            ["F", "L", "B", "R"]
          );
        else if (turnSymbol == "R")
          this.cycleStickers(
            [
              [2, 5, 8],
              [2, 5, 8],
              [6, 3, 0],
              [6, 3, 0],
            ],
            ["F", "U", "B", "D"]
          );
        else if (turnSymbol == "F")
          this.cycleStickers(
            [
              [6, 7, 8],
              [0, 3, 6],
              [6, 7, 8],
              [8, 5, 2],
            ],
            ["U", "R", "D", "L"]
          );
        else if (turnSymbol == "B")
          this.cycleStickers(
            [
              [0, 1, 2],
              [6, 3, 0],
              [0, 1, 2],
              [2, 5, 8],
            ],
            ["U", "L", "D", "R"]
          );
        else if (turnSymbol == "L")
          this.cycleStickers(
            [
              [0, 3, 6],
              [8, 5, 2],
              [8, 5, 2],
              [0, 3, 6],
            ],
            ["F", "D", "B", "U"]
          );
        else if (turnSymbol == "D")
          this.cycleStickers(
            [
              [6, 7, 8],
              [6, 7, 8],
              [6, 7, 8],
              [6, 7, 8],
            ],
            ["F", "R", "B", "L"]
          );
      }
    } else if ("xyz".includes(turnSymbol)) {
    }
  }

  setTurns(turns) {
    this.turns = turns;
    this.rotation = 0;
    this.prevTime = new Date().getTime();
  }

  draw(canvas, camera, dps) {
    let ctx = canvas.getContext("2d");
    ctx.width = camera.width;
    ctx.height = camera.height;

    ctx.fillStyle = "#ffffff";
    //ctx.fillRect(0, 0, camera.width, camera.height);
    ctx.clearRect(0, 0, camera.width, camera.height);

    //turns
    //let

    function drawFace(face, xS, yS, xI, yI, cI, c, t) {
      let points = [];
      //console.log("drawing face(" + t + "): " + face);

      //gen points
      const diff = [0, 0.05, 0.95, 1];
      for (let x = 0; x < 3; x++) {
        for (let idx = 0; idx < diff.length; idx++) {
          for (let y = 0; y < 3; y++) {
            for (let i = 0; i < diff.length; i++) {
              let point = [0, 0, 0];
              point[xI] = (xS < 0 ? 1 : -1) * (x + diff[idx]) + xS;
              point[yI] = (yS < 0 ? 1 : -1) * (y + diff[i]) + yS;
              point[cI] = c;
              points.push(point);
            }
          }
        }
      }

      //convert points
      points = c3dto2d(camera, points);

      //render stickers
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          ctx.beginPath();
          ctx.moveTo(points[y * 48 + x * 4][0], points[y * 48 + x * 4][1]);
          ctx.lineTo(
            points[y * 48 + x * 4 + 3][0],
            points[y * 48 + x * 4 + 3][1]
          );
          ctx.lineTo(
            points[36 + y * 48 + x * 4 + 3][0],
            points[36 + y * 48 + x * 4 + 3][1]
          );
          ctx.lineTo(
            points[36 + y * 48 + x * 4][0],
            points[36 + y * 48 + x * 4][1]
          );
          ctx.lineTo(points[y * 48 + x * 4][0], points[y * 48 + x * 4][1]);
          ctx.fillStyle = "#1f1f1f";
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(
            points[12 + y * 48 + x * 4 + 1][0],
            points[12 + y * 48 + x * 4 + 1][1]
          );
          ctx.lineTo(
            points[12 + y * 48 + x * 4 + 2][0],
            points[12 + y * 48 + x * 4 + 2][1]
          );
          ctx.lineTo(
            points[24 + y * 48 + x * 4 + 2][0],
            points[24 + y * 48 + x * 4 + 2][1]
          );
          ctx.lineTo(
            points[24 + y * 48 + x * 4 + 1][0],
            points[24 + y * 48 + x * 4 + 1][1]
          );
          ctx.lineTo(
            points[12 + y * 48 + x * 4 + 1][0],
            points[12 + y * 48 + x * 4 + 1][1]
          );
          ctx.fillStyle = face[y][x];
          ctx.fill();
        }
      }
    }

    let center = [camera.x, camera.y, camera.z];

    //drawFace(this.stickers.U, -1.5, -1.5, 0, 1, 2, 1.5);
    //drawFace(this.stickers.D, -1.5, 1.5, 0, 1, 2, -1.5);
    //drawFace(this.stickers.F, 1.5, -1.5, 2, 1, 0, 1.5);
    //drawFace(this.stickers.B, 1.5, 1.5, 2, 1, 0, -1.5);
    //drawFace(this.stickers.R, 1.5, 1.5, 2, 0, 1, 1.5);
    //drawFace(this.stickers.L, 1.5, -1.5, 2, 0, 1, -1.5);

    //UDFBRL
    let params = [
      [this.stickers.U, -1.5, -1.5, 0, 1, 2, 1.5, "U"],
      [this.stickers.D, -1.5, 1.5, 0, 1, 2, -1.5, "D"],
      [this.stickers.F, 1.5, -1.5, 2, 1, 0, 1.5, "F"],
      [this.stickers.B, 1.5, 1.5, 2, 1, 0, -1.5, "B"],
      [this.stickers.R, 1.5, 1.5, 2, 0, 1, 1.5, "R"],
      [this.stickers.L, 1.5, -1.5, 2, 0, 1, -1.5, "L"],
    ];
    let distance = [
      sqDist(center, [0, 0, 1.5]),
      sqDist(center, [0, 0, -1.5]),
      sqDist(center, [1.5, 0, 0]),
      sqDist(center, [-1.5, 0, 0]),
      sqDist(center, [0, 1.5, 0]),
      sqDist(center, [0, -1.5, 0]),
    ];

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
      tmp = params[maxIndex];
      params[maxIndex] = params[i];
      params[i] = tmp;
    }

    //render
    for (let i = 0; i < 6; i++)
      drawFace(
        params[i][0],
        params[i][1],
        params[i][2],
        params[i][3],
        params[i][4],
        params[i][5],
        params[i][6],
        params[i][7]
      );
  }
}