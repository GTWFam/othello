let canvas = null;
let context = null;
let board = null;
let player = null;
let playerTurn = null;
let w_score = 0;
let b_score = 0;
const colors = ["#00947e", "#fdfdfd", "#0d0d0d"];

let moves = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function circle(x, y, offset, color, double) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x + offset.x + 0.525, y + offset.y + 0.525, 0.42, 0, 2 * Math.PI);
  context.fill();

  if (double) {
    context.fillStyle = colors[0];
    context.beginPath();
    context.arc(
      x + offset.x + 0.525,
      y + offset.y + 0.525,
      0.39,
      0,
      2 * Math.PI
    );
    context.fill();
  }
}

function drawShape(aShape, offset) {
  aShape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (context !== null && canvas !== null) {
        context.fillStyle = colors[0];
        context.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.95, 0.95);
        if (value === 3) {
          circle(x, y, offset, colors[player], true);
        }
        if (value === 1 || value === 2) {
          circle(x, y, offset, colors[value], false);
        }
      } else if (context === null || canvas === null) {
        console.log("Othello game didn't load");
      }
    });
  });
}

async function showMoves() {
  await fetch("/validMoves", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let json = data.json;
      moves = Object.keys(json);
      if (moves === []) {
        moves = ["No Moves"];
      } else {
        let temp_board = board;
        moves.forEach((move) => {
          let split = move.split(" ");
          let row = split[0];
          let col = split[1];
          temp_board[row][col] = 3;
        });
        drawShape(temp_board, { x: 0, y: 0 });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function aiMove(update) {
  if (playerTurn) {
    return "Not AI turn!";
  } else {
    playerTurn = true;
  }
  await fetch("/AIMove", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let json = JSON.parse(data.json);
      let move = json.move;
      console.log("AI moved:", move);
      board = json.board;
      drawShape(board, { x: 0, y: 0 });
    })
    .then(() => update())
    .catch((error) => {
      console.error("Error:", error);
    });
}

function playerMove() {
  showMoves();
}

async function clickListener(event, update) {
  event.preventDefault();
  if (!playerTurn) {
    alert("Not your turn!");
    return "Not your turn!";
  }
  if (moves === null) {
    update();
    return;
  }
  if (moves[0] === "No Moves") {
    playerTurn = false;
    update();
    return;
  }
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let col = Math.floor(x / 70);
  let row = Math.floor(y / 70);
  let rcString = row.toString() + " " + col.toString();
  if (moves.includes(rcString)) {
    moves = null;
    await fetch("/playerMove", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ theMove: rcString }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        board = data.json.board;
        drawShape(board, { x: 0, y: 0 });
        playerTurn = false;
        console.log("Clicked on cell:", rcString);
      })
      .then(() => {
        update();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    return "Invalid move";
  }
}

async function makeNextMove() {
  await sleep(2000).then(() => {
    requestAnimationFrame(game);
  });
}

function updateScore() {
  w_score = board.reduce(
    (prev, next, curr, arr) => prev + next.filter((x) => x == 1).length,
    0
  );
  b_score = board.reduce(
    (prev, next, curr, arr) => prev + next.filter((x) => x == 2).length,
    0
  );

  document.getElementById("w_score").innerText = w_score;
  document.getElementById("b_score").innerText = b_score;
}

function game() {
  updateScore();
  let empty = board.reduce(
    (prev, next, curr, arr) => prev + next.filter((x) => x === 0).length,
    0
  );
  let empty_w = board.reduce(
    (prev, next, curr, arr) => prev + next.filter((x) => x === 1).length,
    0
  );
  let empty_b = board.reduce(
    (prev, next, curr, arr) => prev + next.filter((x) => x === 2).length,
    0
  );
  if (empty === 0 || empty_w === 0 || empty_b === 0) {
    if (w_score > b_score) {
      document.getElementById("othelloMessage").innerText = "White Wins!";
      return "White Wins!";
    } else if (w_score < b_score) {
      document.getElementById("othelloMessage").innerText = "Black Wins!";
      return "Black Wins!";
    } else {
      document.getElementById("othelloMessage").innerText = "It's a Tie!";
      return "It's a Tie!";
    }
  }
  if (playerTurn) {
    document.getElementById("othelloMessage").innerText = "Your turn!";
    playerMove();
  } else {
    document.getElementById("othelloMessage").innerText = "AI's turn!";
    aiMove(makeNextMove);
  }
}

function startGame() {
  if (player === null) {
    throw "No player found.";
  }
  game();
}

export async function resetOthello() {
  await fetch("/resetOthello", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      board = data.board;
      player = data.player;
      playerTurn = data.turn;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  drawShape(board, { x: 0, y: 0 });
  document.getElementById("w_player").innerText = player == 1 ? "Player" : "AI";
  document.getElementById("b_player").innerText = player == 2 ? "Player" : "AI";
  updateScore();
  try {
    startGame();
  } catch (e) {
    console.log("Unable to start the game: ", e);
  }
}

export async function loadOthello() {
  console.log("Welcome to Othello!");
  canvas = document.getElementById("othello");
  context = canvas.getContext("2d");
  context.scale(70, 70);
  context.fillStyle = "#202020";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await fetch("/getOthello", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      board = data.board;
      player = data.player;
      playerTurn = data.turn;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  drawShape(board, { x: 0, y: 0 });
  document.getElementById("w_player").innerText = player == 1 ? "Player" : "AI";
  document.getElementById("b_player").innerText = player == 2 ? "Player" : "AI";
  updateScore();
  sleep(5000);
  try {
    startGame();
    canvas.addEventListener(
      "click",
      (e) => {
        clickListener(e, makeNextMove);
      },
      false
    );
  } catch (e) {
    console.log("Unable to start the game: ", e);
  }
}
