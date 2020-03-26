//Units of the board.
const x = 100;
const y = 100;

//Function to initialize the HTML table cells.
const generateBoard = (m, n) => {
  for (let i = 0; i < m; i++) {
    $(".grid").append(`<div class="row row${i}"></div>`);
    for (let j = 0; j < n; j++) {
      $(".row"+i).append(`
      <div id="box${i}-${j}" class="box border"></div>
      `);
    }
  }
}

generateBoard(x, y);

//Returns an m x n matrix of live or dead cells. Live cells are 1 and dead cells are 0.
//Weighted by how many percent of cells will start out as live.
//Percentage live will be implemented as a decimal;
const board = [];
const populateBoard = (m, n, percentageLive) => {
  for (let i = 0; i < m; i++) {
    const level = [];
    for (let j = 0; j < n; j++) {
      if (Math.random() <= percentageLive) {
        level.push(1);
      } else {
        level.push(0);
      }
    }
    board.push(level);
  }
}

populateBoard(x, y, 0.50);

//Function to color the board with CSS classes.
const colorBoard = (board) => {
  if (board.length == 0 || board == null) return;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] == 0) {
        $("#box"+i+"-"+j).removeClass("live");
        $("#box"+i+"-"+j).addClass("dead");
      } else {
        $("#box"+i+"-"+j).removeClass("dead");
        $("#box"+i+"-"+j).addClass("live");
      }
    }
  }
}

colorBoard(board);

//Function that checks each cell, updating board[i][j].
const step = (i, j, m, n, board, copy) => {
  let liveCount = 0;
  //upLeft
  if(i > 0 && j > 0) {
      if (copy[i-1][j-1] == 1) liveCount++;
  }
  //upRight
  if(i > 0 && j < n-1) {
      if (copy[i-1][j+1] == 1) liveCount++;
  }
  //downRight
  if(i < m-1 && j < n-1) {
      if (copy[i+1][j+1] == 1) liveCount++;
  }
  //downLeft
  if(i < m-1 && j > 0) {
      if (copy[i+1][j-1] == 1) liveCount++;
  }
  //left
  if(j > 0) {
      if (copy[i][j-1] == 1) liveCount++;
  }
  //right
  if(j < n-1) {
      if (copy[i][j+1] == 1) liveCount++;
  }
  //up
  if(i > 0) {
      if (copy[i-1][j] == 1) liveCount++;
  }
  //down
  if(i < m-1) {
      if (copy[i+1][j] == 1) liveCount++;
  }
  if(liveCount < 2) {
      board[i][j] = 0;
  } else if(liveCount > 3) {
      board[i][j] = 0;
  } else if(liveCount == 2) {
      board[i][j] = copy[i][j];
  } else if(liveCount == 3) {
      board[i][j] = 1;
  }
}

//Function used to update the board state, calling colorBoard after.
const update = (board) => {
  const copy = [...board];
  const m = board.length;
  const n = board[0].length;

  for(let i = 0; i < m; i++) {
    for(let j = 0; j < n; j++) {
        step(i, j, m, n, board, copy);
    }
  }
  colorBoard(board);
}

//Interval inputted as X seconds.
const stepRate = (interval) => {
  setInterval(() => {
    console.log("updating...");
    update(board);
  }, interval*1000);
}

stepRate(0.2);