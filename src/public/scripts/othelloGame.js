const colors = ["#00947e", "#fdfdfd", "#0d0d0d"];
let canvas = null;
let context = null;
let player = null;
let playerTurn = null;
let w_score = 0;
let b_score = 0;

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
  drawShape(board, { x: 0, y: 0 });
  await fetch("/validMoves", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      othelloBoard: board,
      player: player,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      moves = data.legal;
      if (moves === []) {
        moves = ["No Moves"];
      } else {
        let temp_board = [...board];
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
      console.error("Error: ", error);
    });
}

async function aiMove(update) {
  if (playerTurn) {
    return "Not AI turn!";
  } else {
    playerTurn = true;
  }
  await fetch("/AIMove", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      othelloBoard: board,
      player: player,
    }),
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

function handleCanvasClick(e) {
  clickListener(e, makeNextMove);
}

async function clickListener(event, update) {
  event.preventDefault();
  console.log("Handling the click!");
  if (!playerTurn) {
    console.log("Not your turn!");
    alert("Not your turn!");
    return;
  }
  if (moves === null) {
    console.log("Moves is null!");
    update();
    return;
  }
  if (moves[0] === "No Moves") {
    console.log("No Moves");
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
  if (!moves.includes(rcString)) {
    console.log("Invalid Move!");
    console.log(rcString);
    console.log(moves);
    return;
  } else {
    console.log("Sending move to Server!");
    moves = null;
    await fetch("/playerMove", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        theMove: rcString,
        othelloBoard: board,
        player: player,
      }),
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
  }
}

async function makeNextMove() {
  await sleep(1500).then(() => {
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
      let winner = document.getElementById("w_player").innerText;
      document.getElementById("othelloMessage").innerText = winner + " Wins!";
      return "White Wins!";
    } else if (w_score < b_score) {
      let winner = document.getElementById("b_player").innerText;
      document.getElementById("othelloMessage").innerText = winner + " Wins!";
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
  document.getElementById("othello").onclick = handleCanvasClick;
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
  document.getElementById("othello").onclick = handleCanvasClick;
  updateScore();
  sleep(5000);
  try {
    startGame();
  } catch (e) {
    console.log("Unable to start the game: ", e);
  }
}
