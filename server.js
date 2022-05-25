require("dotenv").config();
const express = require("express");
const spawn = require("child_process").spawn;

let othelloBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

let player = null;
let ai = null;
let playerTurn = false;

async function getAIMove() {
  if (player === null) return "No player found.";
  const othello = spawn("python3", [
    "othelloAI.py",
    othelloBoard.toString(),
    ai,
  ]);

  othello.on("error", (err) => {
    console.log(
      `Encountered an error running child process: \n${err.toString()}`
    );
  });

  for await (const data of othello.stdout) {
    return data.toString();
  }

  othello.stderr.on("data", (data) => {
    console.error(`Encountered an error in python code:\n${data}`);
  });
}

async function getValidMoves() {
  if (player === null) return "No player found.";
  const othello = spawn("python3", [
    "othelloMoves.py",
    othelloBoard.toString(),
    player,
  ]);

  othello.on("error", (err) => {
    console.log(
      `Encountered an error running child process: \n${err.toString()}`
    );
  });

  for await (const data of othello.stdout) {
    return data.toString();
  }

  othello.stderr.on("data", (data) => {
    console.error(`Encountered an error in python code:\n${data}`);
  });
}

async function makePlayerMove(move) {
  if (player === null) return "No player found.";

  const othello = spawn("python3", [
    "othelloAI.py",
    othelloBoard.toString(),
    player,
    move,
  ]);

  othello.on("error", (err) => {
    console.log(
      `Encountered an error running child process: \n${err.toString()}`
    );
  });

  for await (const data of othello.stdout) {
    return data.toString();
  }

  othello.stderr.on("data", (data) => {
    console.error(`Encountered an error in python code:\n${data}`);
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/getOthello", (req, res) => {
  if (player === null) {
    player = Math.floor(Math.random() * 2 + 1).toString();
    ai = (3 - player).toString();
  }
  if (player === "1") {
    playerTurn = true;
  }
  res.json({ board: othelloBoard, player: parseInt(player), turn: playerTurn });
  res.end();
});

app.get("/resetOthello", (req, res) => {
  player = Math.floor(Math.random() * 2 + 1).toString();
  ai = (3 - player).toString();
  if (player === "1") {
    playerTurn = true;
  } else {
    playerTurn = false;
  }
  othelloBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  res.json({ board: othelloBoard, player: parseInt(player), turn: playerTurn });
  res.end();
});

app.get("/AIMove", async (req, res) => {
  console.log("AI Moved");
  playerTurn = true;
  let json = await getAIMove();
  json = json.trim();
  let data = JSON.parse(json);
  othelloBoard = data.board;
  res.json({ json: json });
  res.end();
});

app.get("/validMoves", async (req, res) => {
  if (player === null) {
    console.log("No player");
    return;
  }
  console.log("Getting Valid Moves");
  let json = await getValidMoves();
  json = json.trim();
  let data = JSON.parse(json);
  res.json({ json: data });
  res.end();
});

app.post("/playerMove", async (req, res) => {
  console.log("Player Moved");
  playerTurn = false;
  let the_move = req.body.theMove;
  let json = await makePlayerMove(the_move);
  json = json.trim();
  let data = JSON.parse(json);
  othelloBoard = data.board;
  res.json({ json: data });
  res.end();
});

app.use(express.static("build"));

app.listen(process.env.PORT || 3000);
