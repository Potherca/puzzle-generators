/*

Source: https://github.com/jplanson/takuzu-board-generator

Copyright 2019 Julian Lanson - All rights reserved

This is a Javascript code, generated from the Typescript implementation of a Takuzu board solver and generator developed by Julian Lanson for the backend of www.puzzle-hub.com.

The generateBoard() function uses RNG to start populating the board, but ensures that placed values follow the constraints of a valid takuzu board.

Once a valid board has been generated, the carve() function is called to remove a percentage of the values on the board.

Each time the carving function removes a new tile, canSolve() is called on the updated board to ensure the it can still be solved without guessing.

Instead of using recursion to solve the board via brute-force, the solver completes the board as a human would.

It attempts to use simple rules such as wrapTwos() or breakThrees() as often as possible, until it has no options left and must call eliminateImpossibilities().

This function is more computationally intensive, but it permutes all possible combinations of 1s or 0s in the empty spaces of a given row or column, and looks for a common feature in each of the permutations that does not cause the board to break the rules of takuzu.

board = new Board(10, 6634, 90)
board.generateBoard()
board.takuzuPuzzle
board.originalPuzzle

board.isSolved()
 */
"use strict";
const Board = /** @class */ (function () {
  function Board(size, seed, removePerc) {
    this.size = size;
    this.seed = seed;
    this.removePerc = removePerc;
    if (this.size % 2 !== 0) {
      this.size++;
    }
  }
  /* ------------------------------------------------------ */
  /*                  BOARD GENERATION                      */
  /* ------------------------------------------------------ */
  Board.prototype.generateBoard = function () {
    const board = [];
    for (let i = 0; i < this.size; i++) {
      board.push([]);
      for (let j = 0; j < this.size; j++) {
        board[i].push(-1);
      }
    }
    while (!Board.isSolvedArg(board)) {
      const columnData = {};
      for (let i = 0; i < this.size; i++) {
        var m = {
          'numTotOnes': 0,
          'numTotZeroes': 0,
          'recentOnes': 0,
          'recentZeroes': 0
        };
        columnData[i] = m;
      }
      for (let i = 0; i < this.size; i++) {
        var numTotOnes = 0;
        var numTotZeroes = 0;
        var recentOnes = 0;
        var recentZeroes = 0;
        var added = false;
        for (var j = 0; j < this.size; j++) {
          var choice = Math.round(this.random());
          added = false;
          var column = columnData[j];
          if (numTotOnes < this.size / 2 && choice == 1 && recentOnes < 2 &&
            column['numTotOnes'] < this.size / 2 && column['recentOnes'] < 2) {
            column['recentZeroes'] = 0;
            column['recentOnes']++;
            column['numTotOnes']++;
            recentZeroes = 0;
            recentOnes++;
            numTotOnes++;
            board[i][j] = choice;
            added = true;
          }
          else if (numTotZeroes < this.size / 2 && choice == 1 && recentZeroes < 2 &&
            column['numTotZeroes'] < this.size / 2 && column['recentZeroes'] < 2) {
            column['recentOnes'] = 0;
            column['recentZeroes']++;
            column['numTotZeroes']++;
            recentOnes = 0;
            recentZeroes++;
            numTotZeroes++;
            board[i][j] = 0;
            added = true;
          }
          if (numTotZeroes < this.size / 2 && choice == 0 && recentZeroes < 2 &&
            column['numTotZeroes'] < this.size / 2 && column['recentZeroes'] < 2) {
            column['recentOnes'] = 0;
            column['recentZeroes']++;
            column['numTotZeroes']++;
            recentOnes = 0;
            recentZeroes++;
            numTotZeroes++;
            board[i][j] = choice;
            added = true;
          }
          else if (numTotOnes < this.size / 2 && choice == 0 && recentOnes < 2 &&
            column['numTotOnes'] < this.size / 2 && column['recentOnes'] < 2) {
            column['recentZeroes'] = 0;
            column['recentOnes']++;
            column['numTotOnes']++;
            recentZeroes = 0;
            recentOnes++;
            numTotOnes++;
            board[i][j] = 1;
            added = true;
          }
          if (added = false) {
            break;
          }
        }
        if (added = false) {
          break;
        }
      }
    }
    this.originalPuzzle = board;
    this.carve();
  };
  /* ------------------------------------------------------ */
  Board.prototype.carve = function () {
    const carvedBoard = JSON.parse(JSON.stringify(this.originalPuzzle));
    const indexes = [];
    for (let i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        indexes.push([i, j]);
      }
    }
    // console.log(this.removePerc * (this.size * this.size));
    for (let i = 0; i < (this.removePerc * (this.size * this.size)); i++) {
      if (indexes.length == 0) {
        break;
      }
      var idx = Math.trunc(this.random() * indexes.length);
      var row = (indexes[idx])[0];
      var col = (indexes[idx])[1];
      indexes.splice(idx, 1);
      if (carvedBoard[row][col] == -1) {
        i--;
        continue;
      }
      var oldVal = carvedBoard[row][col];
      carvedBoard[row][col] = -1;
      if (!Board.canSolve(carvedBoard)) {
        carvedBoard[row][col] = oldVal;
        i--;
      }
    }
    this.originalPuzzle = JSON.parse(JSON.stringify(carvedBoard));
    this.takuzuPuzzle = JSON.parse(JSON.stringify(carvedBoard));
  };
  /* ------------------------------------------------------ */
  /*                  MISC. FRONT-END API                   */
  /* ------------------------------------------------------ */
  Board.prototype.isSolved = function () {
    return Board.isSolvedArg(this.takuzuPuzzle);
  };
  /* ------------------------------------------------------ */
  Board.prototype.hasError = function () {
    return Board.hasErrorArg(this.takuzuPuzzle);
  };
  /* ------------------------------------------------------ */
  Board.prototype.isOriginal = function (x, y) {
    if (x >= this.size || y >= this.size) {
      return false;
    }
    else if (this.originalPuzzle[y][x] != -1) {
      return true;
    }
    else {
      return false;
    }
  };
  /* ------------------------------------------------------ */
  Board.prototype.rotateValue = function (x, y, forward) {
    if (x >= this.size || y >= this.size || this.isOriginal(x, y)) {
      return;
    }
    if (forward) {
      this.takuzuPuzzle[y][x] += 1;
      if (this.takuzuPuzzle[y][x] == 2) {
        this.takuzuPuzzle[y][x] = -1;
      }
    }
    else {
      this.takuzuPuzzle[y][x] -= 1;
      if (this.takuzuPuzzle[y][x] == -2) {
        this.takuzuPuzzle[y][x] = 1;
      }
    }
  };
  /* ------------------------------------------------------ */
  /*                  MAIN SOLVER FUNCTIONS                 */
  /* ------------------------------------------------------ */
  Board.hasErrorArg = function (board) {
    var rows = [];
    var cols = [];
    // create a list of strings of the values of each row and column
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";
      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        }
        else {
          row += board[i][j];
        }
        if (board[j][i] == -1) {
          col += "-";
        }
        else {
          col += board[j][i];
        }
      }
      rows.push(row);
      cols.push(col);
    }
    var invalidOnes = "111";
    var invalidZeroes = "000";
    // check rows for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < rows.length; i++) {
      var curr = rows[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length) / 2 ||
        numZeroes > (board[0].length) / 2 ||
        curr.includes(invalidOnes) ||
        curr.includes(invalidZeroes)) {
        return true;
      }
    }
    // check cols for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < cols.length; i++) {
      var curr = cols[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length) / 2 ||
        numZeroes > (board[0].length) / 2 ||
        curr.includes(invalidOnes) ||
        curr.includes(invalidZeroes)) {
        return true;
      }
    }
    // check if any two rows or columns are the same
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].includes("-")) {
        continue;
      }
      for (var j = i + 1; j < rows.length; j++) {
        if (i == j || rows[j].includes("-")) {
          continue;
        }
        if (rows[i] == rows[j]) {
          return true;
        }
      }
    }
    for (var i = 0; i < cols.length; i++) {
      if (cols[i].includes("-")) {
        continue;
      }
      for (var j = i + 1; j < cols.length; j++) {
        if (i == j || cols[j].includes("-")) {
          continue;
        }
        if (cols[i] == cols[j]) {
          return true;
        }
      }
    }
    return false;
  };
  /* ------------------------------------------------------ */
  Board.isSolvedArg = function (board) {
    var rows = [];
    var cols = [];
    // create a list of strings of the values of each row and column
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";
      for (var j = 0; j < board[0].length; j++) {
        row += board[i][j];
        col += board[j][i];
      }
      rows.push(row);
      cols.push(col);
    }
    var invalidOnes = "111";
    var invalidZeroes = "000";
    // check rows for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < rows.length; i++) {
      var curr = rows[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length) / 2 ||
        numZeroes > (board[0].length) / 2 ||
        curr.includes(invalidOnes) ||
        curr.includes(invalidZeroes) ||
        curr.includes('-')) {
        return false;
      }
    }
    // check cols for runs of three 0's or 1's, too many 0's or 1's, or blanks
    for (var i = 0; i < cols.length; i++) {
      var curr = cols[i];
      var numOnes = curr.split("1").length - 1;
      var numZeroes = curr.split("0").length - 1;
      if (numOnes > (board.length) / 2 ||
        numZeroes > (board[0].length) / 2 ||
        curr.includes(invalidOnes) ||
        curr.includes(invalidZeroes) ||
        curr.includes('-')) {
        return false;
      }
    }
    // check if any two rows or columns are the same
    for (var i = 0; i < rows.length; i++) {
      for (var j = i + 1; j < rows.length; j++) {
        if (i == j) {
          continue;
        }
        if (rows[i] == rows[j]) {
          return false;
        }
        else if (cols[i] == cols[j]) {
          return false;
        }
      }
    }
    return true;
  };
  /* ------------------------------------------------------ */
  Board.canSolve = function (board) {
    var thisBoard = JSON.parse(JSON.stringify(board));
    while (true) {
      var didSomething = false;
      didSomething = Board.useTechniques(thisBoard);
      if (!didSomething) {
        break;
      }
    }
    return (Board.isSolvedArg(thisBoard));
  };
  /* ------------------------------------------------------ */
  Board.canSolveOptimized = function (board, i, j, val) {
    if (board[i][j] == val) {
      return true;
    }
    var thisBoard = JSON.parse(JSON.stringify(board));
    while (true) {
      var didSomething = true;
      didSomething = Board.useTechniques(thisBoard);
      if (!didSomething || thisBoard[i][j] == val) {
        if (thisBoard[i][j] == val) {
          console.log("optimized");
        }
        break;
      }
    }
    return (thisBoard[i][j] == val || Board.isSolvedArg(thisBoard));
  };
  /* ------------------------------------------------------ */
  /*                    SOLVER MODULES                      */
  /* ------------------------------------------------------ */
  Board.useTechniques = function (board) {
    var didSomething = false;
    didSomething = (didSomething || Board.wrapTwos(board));
    if (!didSomething) {
      didSomething = (didSomething || Board.breakThrees(board));
    }
    if (!didSomething) {
      didSomething = (didSomething || Board.completeParity(board));
    }
    if (!didSomething) {
      didSomething = (didSomething || Board.eliminateImpossibilities(board));
    }
    return didSomething;
  };
  /* ------------------------------------------------------ */
  Board.wrapTwos = function (board) {
    var didSomething = false;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j] != -1) {
          continue;
        }
        if (Board.canAccess(board, i - 2, j)) {
          if (Board.sameVal(board, i - 1, j, i - 2, j)) {
            board[i][j] = Board.negate(board, i - 1, j);
            didSomething = true;
          }
        }
        if (Board.canAccess(board, i + 2, j)) {
          if (Board.sameVal(board, i + 1, j, i + 2, j)) {
            board[i][j] = Board.negate(board, i + 1, j);
            didSomething = true;
          }
        }
        if (Board.canAccess(board, i, j - 2)) {
          if (Board.sameVal(board, i, j - 1, i, j - 2)) {
            board[i][j] = Board.negate(board, i, j - 1);
            didSomething = true;
          }
        }
        if (Board.canAccess(board, i, j + 2)) {
          if (Board.sameVal(board, i, j + 1, i, j + 2)) {
            board[i][j] = Board.negate(board, i, j + 1);
            didSomething = true;
          }
        }
      }
    }
    return didSomething;
  };
  /* ------------------------------------------------------ */
  Board.breakThrees = function (board) {
    var didSomething = false;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j] != -1) {
          continue;
        }
        if (Board.canAccess(board, i - 1, j) &&
          Board.canAccess(board, i + 1, j)) {
          if (Board.sameVal(board, i - 1, j, i + 1, j)) {
            board[i][j] = Board.negate(board, i - 1, j);
            didSomething = true;
          }
        }
        if (Board.canAccess(board, i, j - 1) &&
          Board.canAccess(board, i, j + 1)) {
          if (Board.sameVal(board, i, j - 1, i, j + 1)) {
            board[i][j] = Board.negate(board, i, j - 1);
            didSomething = true;
          }
        }
      }
    }
    return didSomething;
  };
  /* ------------------------------------------------------ */
  Board.completeParity = function (board) {
    var didSomething = false;
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var col = "";
      var numZeroes = 0;
      var numOnes = 0;
      var idx = -1;
      // convert rows and columns into strings
      // DOES NOT WORK IF BOARD IS NOT SQUARE
      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        }
        else {
          row += board[i][j];
        }
        if (board[j][i] == -1) {
          col += "-";
        }
        else {
          col += board[j][i];
        }
      }
      if ((row.split("-").length - 1) != 0) {
        numZeroes = (row.split("0").length - 1);
        numOnes = (row.split("1").length - 1);
        if (numZeroes == board.length / 2) {
          idx = -1;
          while ((idx = row.indexOf("-", idx + 1)) != -1) {
            board[i][idx] = 1;
          }
          didSomething = true;
        }
        else if (numOnes == board.length / 2) {
          idx = -1;
          while ((idx = row.indexOf("-", idx + 1)) != -1) {
            board[i][idx] = 0;
          }
          didSomething = true;
        }
      }
      if ((col.split("-").length - 1) != 0) {
        numZeroes = (col.split("0").length - 1);
        numOnes = (col.split("1").length - 1);
        if (numZeroes == board[i].length / 2) {
          idx = -1;
          while ((idx = col.indexOf("-", idx + 1)) != -1) {
            board[idx][i] = 1;
          }
          didSomething = true;
        }
        else if (numOnes == board[i].length / 2) {
          idx = -1;
          while ((idx = col.indexOf("-", idx + 1)) != -1) {
            board[idx][i] = 0;
          }
          didSomething = true;
        }
      }
    }
    return didSomething;
  };
  /* ------------------------------------------------------ */
  Board.eliminateImpossibilities = function (board) {
    var didSomething = false;
    var testBoard = JSON.parse(JSON.stringify(board));
    for (var i = 0; i < board.length; i++) {
      var row = "";
      var idx = -1;
      var matches = [];
      for (var j = 0; j < board[0].length; j++) {
        if (board[i][j] == -1) {
          row += "-";
        }
        else {
          row += board[i][j];
        }
      }
      if (row.includes("-")) {
        var numEmpty = (row.split("-").length - 1);
        var possibilities = Board.getPermutations(numEmpty);
        var validPossibilities = [];
        var testString = "";
        // try all possibilities and record ones that make a valid board
        for (var k = 0; k < possibilities.length; k++) {
          testString = Board.fillBlanks(row, possibilities[k]);
          if (Board.lineStringHasError(testString)) {
            continue;
          }
          Board.writeStringToLocation(testBoard, i, 0, testString, true);
          if (!Board.hasErrorArg(testBoard)) {
            validPossibilities.push(testString);
          }
          Board.writeStringToLocation(testBoard, i, 0, row, true);
        }
        if (validPossibilities.length != 0) {
          // find any values that are shared between all valid possibilities
          var boardAdditions = validPossibilities[0];
          for (var m = 1; m < validPossibilities.length; m++) {
            for (var n = 0; n < validPossibilities[m].length; n++) {
              if (boardAdditions.charAt(n) != "-" && validPossibilities[m].charAt(n) != boardAdditions.charAt(n)) {
                boardAdditions = Board.setCharAt(boardAdditions, n, "-");
              }
            }
          }
          if (boardAdditions != row) {
            didSomething = true;
            Board.writeStringToLocation(board, i, 0, boardAdditions, true);
          }
        }
      }
    }
    // repeat for cols
    testBoard = JSON.parse(JSON.stringify(board));
    for (var i = 0; i < board.length; i++) {
      var col = "";
      var idx = -1;
      var matches = [];
      for (var j = 0; j < board[0].length; j++) {
        if (board[j][i] == -1) {
          col += "-";
        }
        else {
          col += board[j][i];
        }
      }
      if (col.includes("-")) {
        var numEmpty = (col.split("-").length - 1);
        var possibilities = Board.getPermutations(numEmpty);
        var validPossibilities = [];
        var testString = "";
        // try all possibilities and record ones that make a valid board
        for (var k = 0; k < possibilities.length; k++) {
          testString = Board.fillBlanks(col, possibilities[k]);
          if (Board.lineStringHasError(testString)) {
            continue;
          }
          Board.writeStringToLocation(testBoard, 0, i, testString, false);
          if (!Board.hasErrorArg(testBoard)) {
            validPossibilities.push(testString);
          }
          Board.writeStringToLocation(testBoard, 0, i, col, false);
        }
        if (validPossibilities.length != 0) {
          // find any values that are shared between all valid possibilities
          var boardAdditions = validPossibilities[0];
          for (var m = 1; m < validPossibilities.length; m++) {
            for (var n = 0; n < validPossibilities[m].length; n++) {
              if (boardAdditions.charAt(n) != "-" && validPossibilities[m].charAt(n) != boardAdditions.charAt(n)) {
                boardAdditions = Board.setCharAt(boardAdditions, n, "-");
              }
            }
          }
          if (boardAdditions != col) {
            didSomething = true;
            Board.writeStringToLocation(board, 0, i, boardAdditions, false);
          }
        }
      }
    }
    return didSomething;
  };
  /* ------------------------------------------------------ */
  /*                     MISC. HELPERS                      */
  /* ------------------------------------------------------ */
  Board.prototype.random = function () {
    var x = Math.sin(++this.seed) * 10000;
    return x - Math.floor(x);
  };
  /* ------------------------------------------------------ */
  Board.canAccess = function (board, i, j) {
    return ((i >= 0 && i < board.length) &&
      (j >= 0 && j < board[i].length));
  };
  /* ------------------------------------------------------ */
  Board.sameVal = function (board, i1, j1, i2, j2) {
    return (board[i1][j1] == board[i2][j2] && board[i1][j1] != -1);
  };
  /* ------------------------------------------------------ */
  Board.negate = function (board, i, j) {
    if (board[i][j] == 0) {
      return 1;
    }
    else if (board[i][j] == 1) {
      return 0;
    }
    else {
      return -1;
    }
  };
  /* ------------------------------------------------------ */
  Board.setCharAt = function (str, index, chr) {
    if (index > str.length - 1) {
      return str;
    }
    ;
    return str.substr(0, index) + chr + str.substr(index + 1);
  };
  /* ------------------------------------------------------ */
  Board.lineStringHasError = function (str) {
    var numZeroes = (str.split("0").length - 1);
    var numOnes = (str.split("1").length - 1);
    return (str.includes("000") ||
      str.includes("111") ||
      numZeroes > str.length / 2 ||
      numOnes > str.length / 2);
  };
  /* ------------------------------------------------------ */
  Board.getPermutations = function (n) {
    if (n < 2) {
      return [];
    }
    var i = 0;
    var b = i.toString(2);
    var result = [];
    while (b.length <= n) {
      // prepend zeroes
      if (b.length < n) {
        b = (new Array((n - b.length) + 1).join("0")) + b;
      }
      result.push(b);
      b = (++i).toString(2);
    }
    return result;
  };
  /* ------------------------------------------------------ */
  Board.writeStringToLocation = function (board, i, j, str, toRow) {
    for (var ii = 0; ii < str.length; ii++) {
      var writeChar = str.charAt(ii);
      if (writeChar == "-") {
        writeChar = "-1";
      }
      writeChar = parseInt(writeChar);
      if (!toRow && Board.canAccess(board, i + ii, j)) {
        board[i + ii][j] = writeChar;
      }
      else if (toRow && Board.canAccess(board, i, j + ii)) {
        board[i][j + ii] = writeChar;
      }
    }
  };
  /* ------------------------------------------------------ */
  Board.fillBlanks = function (mainStr, fillStr) {
    var result = "";
    var fillIdx = 0;
    for (var i = 0; i < mainStr.length; i++) {
      if (mainStr.charAt(i) == "-") {
        result += fillStr.charAt(fillIdx);
        fillIdx++;
      }
      else {
        result += mainStr.charAt(i);
      }
    }
    return result;
  };
  return Board;
}());
