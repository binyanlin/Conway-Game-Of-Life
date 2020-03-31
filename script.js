//Variable Declaration
//Units of the board.
const x = 100;
const y = 100;
let selection = false;  //switch variable for checking mouseover
// let validM = [];  //array of valid next moves possible
const moveStack = []; //stores moves made in order
const moveStroke = []; //stores the most recent move made to be pushed into moveStack.
let draw = false; //Boolean for whether draw is allowed.

//Function to initialize the HTML table cells.
const generateBoard = (m, n) => {
  for (let i = 0; i < m; i++) {
    $(".grid").append(`<div class="row row${i}"></div>`);
    for (let j = 0; j < n; j++) {
      $(".row"+i).append(`
      <div id="${i}-${j}" class="box dead noselect border"></div>
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
  board.length = 0;
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

populateBoard(x, y, 0);

//Function to color the board with CSS classes.
const colorBoard = (board) => {
  if (board.length == 0 || board == null) return;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] == 0) {
        $("#"+i+"-"+j).removeClass("live");
        $("#"+i+"-"+j).addClass("dead");
      } else {
        $("#"+i+"-"+j).removeClass("dead");
        $("#"+i+"-"+j).addClass("live");
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
      if(copy[i][j] == 1) {
        board[i][j] == 1;
      } else {
        board[i][j] == 0;
      }
  } else if(liveCount == 3) {
      board[i][j] = 1;
  }
}

//Function used to update the board state, calling colorBoard after.
const update = (board) => {
  const copy = board.map((arr)=> arr.slice());
  const m = board.length;
  const n = board[0].length;

  for(let i = 0; i < m; i++) {
    for(let j = 0; j < n; j++) {
        step(i, j, m, n, board, copy);
    }
  }
  colorBoard(board);
}

let boardIntervalId;
//Interval inputted as X seconds.
const stepRate = (interval) => {
  boardIntervalId = setInterval(update(board), interval);
}


const upkeep = () => {
  draw = false;
  $(".draw").removeClass("active");
  $(".undo").addClass("disabled");
  moveStack.length = 0;
  clearInterval(boardIntervalId);
}
//Event Listeners

//Toggles the speed of the board update operations.
$(document).on("click", ".buttonSpeed", ()=> {
  event.preventDefault();
  if (board.length == 0) return;
  upkeep();
  if ($(".buttonSpeed").text() == "Start") {
    let interval = $(".speedVal").val();
    clearInterval(boardIntervalId);
    boardIntervalId = setInterval(() => update(board), interval);
    $(".buttonSpeed").text("Pause");
  } else {
    clearInterval(boardIntervalId);
    $(".buttonSpeed").text("Start");
  }
});

//Populates board with initial state, cannot change unless paused.
$(document).on("click", ".buttonPopulation", () => {
  event.preventDefault();
  upkeep();
  $(".buttonSpeed").text("Start");
  populateBoard(x, y, $(".popVal").val()/100);
  colorBoard(board);
});

//Draw your own board operations:
//adds class selected on anything held down and hovered over
$(document).on("mousedown", ".box", function() {
  if (!draw) return;
  moveStroke.length = 0;
  if (!$(this).hasClass("live")) {
    $(this).removeClass("dead")
    $(this).addClass("live");
    let cur = $(this).attr("id");
    let curArr = cur.split("-");
    board[curArr[0]][curArr[1]] = 1; //sets to live
    selection = true;
    moveStroke.push(curArr);
  }
});

$(document).on("mouseover", ".box", function () {
  //create function for checking if move is allowed, returns true/false
  if (selection) {
    if (!$(this).hasClass("live")) {
      $(this).removeClass("dead")
      $(this).addClass("live");
      let cur = $(this).attr("id");
      let curArr = cur.split("-");
      board[curArr[0]][curArr[1]] = 1; //sets to live
      moveStroke.push(curArr);
    }
  }
});

$(document).on("click", ".draw", ()=> {
  event.preventDefault();
  if(draw == false) {
    draw = true;
    $(".draw").addClass("active");
    $(".undo").removeClass("disabled");
    clearInterval(boardIntervalId);
    $(".buttonSpeed").text("Start");
  } else {
    draw = false;
    $(".draw").removeClass("active");
    $(".undo").addClass("disabled");
  }
  
  
});

$(document).on("click", ".undo", ()=> {
  event.preventDefault();
  if (!draw) return;
  if (moveStack.length == 0) return;
  let unstep = moveStack.pop();
  unstep.forEach((arr)=> {
    board[arr[0]][arr[1]] = 0;
    $("#"+arr[0]+"-"+arr[1]).removeClass("live");
    $("#"+arr[0]+"-"+arr[1]).addClass("dead");
  });
});

$(document).on("click", ".clearBoard", ()=> {
  event.preventDefault();
  clearInterval(boardIntervalId);
  $(".buttonSpeed").text("Start");
  populateBoard(x, y, 0);
  colorBoard(board);
});

//function to clear selections if mouse hovered outside boxes or if mouseup finished
const clearFunc = () => {
  selection = false;
  //copy function
  if(moveStroke.length > 0) {
    const temp = [];
    moveStroke.forEach((arr)=>{
      temp.push([arr[0], arr[1]]);
    });
    moveStack.push(temp);
  }
  moveStroke.length = 0;
}

//removes class selected and sees if move is valid
$(document).on("mouseup", ".box", function() {
  if(!selection) return;
  clearFunc();
});

$(document).on("mouseleave", ".grid", function() {
  if(!selection) return;
  clearFunc();
});
