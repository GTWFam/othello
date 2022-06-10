require("dotenv").config();
const express = require("express");
const spawn = require("child_process").spawn;

let playerTurn = false;

function deleteAllThrees(board) {
  board.forEach((row, index) => {
    row.forEach((square, i) => {
      if (square === 3) {
        board[index][i] = 0;
      }
    });
  });
  return board;
}

async function getAIMove(othelloBoard, player) {
  othelloBoard = deleteAllThrees(othelloBoard);
  if (player === null) return "No player found.";
  let ai = (3 - player).toString();
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

// Sample othelloBoard.toString()
// "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
async function getValidMoves(othelloBoard, player) {
  othelloBoard = deleteAllThrees(othelloBoard);
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

async function makePlayerMove(move, othelloBoard, player) {
  othelloBoard = deleteAllThrees(othelloBoard);
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

app.get("/getGACode", (req, res) => {
  res.json({ GA_CODE: process.env.GA_CODE });
  res.end();
});

app.get("/getOthello", (req, res) => {
  let player = Math.floor(Math.random() * 2 + 1).toString();
  if (player === "1") {
    playerTurn = true;
  }
  let board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  res.json({ board: board, player: parseInt(player), turn: playerTurn });
  res.end();
});

app.get("/resetOthello", (req, res) => {
  let player = Math.floor(Math.random() * 2 + 1).toString();
  if (player === "1") {
    playerTurn = true;
  } else {
    playerTurn = false;
  }
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
  res.json({ board: othelloBoard, player: parseInt(player), turn: playerTurn });
  res.end();
});

app.post("/AIMove", async (req, res) => {
  console.log("AI Moved");
  playerTurn = true;
  console.log(req.body.othelloBoard);
  let json = await getAIMove(req.body.othelloBoard, req.body.player);
  json = json.trim();
  res.json({ json: json });
  res.end();
});

app.post("/validMoves", async (req, res) => {
  if (req.body.player === null) {
    console.log("No player");
    return;
  }
  console.log("Getting Valid Moves");
  console.log(req.body.othelloBoard);
  let json = await getValidMoves(req.body.othelloBoard, req.body.player);
  json = json.trim();
  let data = JSON.parse(json);
  console.log(data);
  res.json(data);
  res.end();
});

app.post("/playerMove", async (req, res) => {
  console.log("Player Moved");
  console.log(req.body.othelloBoard);
  playerTurn = false;
  let json = await makePlayerMove(
    req.body.theMove,
    req.body.othelloBoard,
    req.body.player
  );
  json = json.trim();
  let data = JSON.parse(json);
  othelloBoard = data.board;
  res.json({ json: data });
  res.end();
});

app.use(express.static("build"));

app.listen(process.env.PORT || 3000);
