const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const scaleCtrl = document.querySelector("#scaleCtrl")
const tuningCtrl = document.querySelector("#tuningCtrl")
const columnCtrl = document.querySelector("#rowCtrl")
const rowCtrl = document.querySelector("#columnCtrl")
const game = document.querySelector("#game");


let startBool = false;
let gameTick;
let birthList = [];
let deathList = [];

let cellWidthDimension = 16 // hect: 16 || chrom: 16
let numRows = 15; // hect: 12 || chrom: 14
let gridDimension = game.getBoundingClientRect().width / cellWidthDimension;
let currentScaleCallback


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createCell(col, row) {
 let cell = document.createElement("div")
 cell.classList.add("cell");
 cell.dataset.alive = "f";
 cell.dataset.row = row;
 cell.dataset.col = col;
 cell.dataset.noteNum = (row *2) + col  + 4  // pent: row + (row * 0) + 6 + col - 3 ***** hect: row + (row * 1) + 7 + col - 3 || cell.dataset.noteNum = (row *2) + col - 3 || (row *2) + col + 4 ***** chrom: (row * 4) + col - 5 || row + (row * 4) + col - 2 || (row *3) + col 
 let noteData = getFrequencyMajorHectatonic(cell.dataset.noteNum)
 if (cell.dataset.row == 1 || cell.dataset.row == numRows || cell.dataset.col == 1 || cell.dataset.col == cellWidthDimension || true) {
 cell.innerHTML = noteData[1] //getFrequencyMajorHectatonic || getFrequencyChromatic || getFrequencyMajorPentatonic || getFrequencyHarmonicMinorHectatonic || getFrequencyMelodicMinorHectatonic 
 }
 cell.dataset.note = noteData[1]
 //cell.innerHTML = cell.dataset.noteNum
 cell.id = col + "/" + row;
 cell.style.height = gridDimension + "px";
 cell.style.width = gridDimension + "px";
 cell.addEventListener("click", (e) => {
 //e.target.animate({ backgroundColor: ["black", "green", "black"]},1000);
 if (!startBool) {
 e.target.dataset.alive == "f" ? e.target.style.backgroundColor = "green" : e.target.style.backgroundColor = "black";
 e.target.dataset.alive == "f" ? e.target.dataset.alive = "t" : e.target.dataset.alive = "f"; 
 }

 })
 return cell;
}

function createRow(rowNum) {
 for (let colNum = 1; colNum <= cellWidthDimension; colNum++) {
 let cell = createCell(colNum, rowNum);
 
 game.appendChild(cell);
 }
}

function createGrid(numCells) {
 for (let i = 1; i <= numRows; i++) {
 createRow(i)
 }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkNeighbor(col, row, colDirection, rowDirection) {
  let neighborCol = Number(col) + colDirection
  let neighborRow = Number(row) + rowDirection
  if (neighborCol < 1) {
    neighborCol = cellWidthDimension
  }
  else if (neighborCol > cellWidthDimension) {
    neighborCol = 1;
  }

  if (neighborRow < 1) {
    neighborRow = numRows;
  }
  else if (neighborRow > numRows) {
    neighborRow = 1
  }
  
  let neighborCell = document.getElementById(`${neighborCol}/${neighborRow}`)
  return neighborCell;
}

function getAllNeighbors(cell) {
  let col = Number(cell.dataset.col);
  let row = Number(cell.dataset.row);
  let rightCell = checkNeighbor(col, row, 1, 0); //right
  let leftCell = checkNeighbor(col, row, -1, -0); //left
  let bottomCell = checkNeighbor(col, row, 0, 1); //down
  let topCell = checkNeighbor(col, row, 0, -1); //up
  let diagonalRightTopCell = checkNeighbor(col, row, 1, -1); //right-up diagonal
  let diagonalRightBottomCell = checkNeighbor(col, row, 1, 1); //right-down diagonal
  let diagonalLeftTopCell = checkNeighbor(col, row, -1, -1); //left-up diagonal
  let diagonalLeftBottomCell = checkNeighbor(col, row, -1, 1); //left-down diagonal
 
  let neighborList = [rightCell, leftCell, bottomCell, topCell, diagonalRightTopCell, diagonalRightBottomCell, diagonalLeftTopCell, diagonalLeftBottomCell];
  return neighborList
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cellGameLogic(cell) {
  let neighborList = getAllNeighbors(cell);
  let counter = 0;
  for (const neighbor of neighborList) {
    if (neighbor != null) {
      if (neighbor.dataset.alive == "t") {
        counter++;
      }
    }
  }
 
  switch(counter) {
    case 0:
    case 1:
      //Any live cell with fewer than two live neighbours dies, as if by underpopulation.
      if (cell.dataset.alive == "t") {
        deathList.push(cell)
      }
    break; 
    case 3:
      //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
      if (cell.dataset.alive == "f") {
        birthList.push(cell)
      }
    break;
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      //Any live cell with more than three live neighbours dies, as if by overpopulation.
      if (cell.dataset.alive == "t") {
        deathList.push(cell)
      }
      break;
  }
 
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function clearAllCells() {
  document.querySelectorAll(".cell").forEach((elem) => {
    elem.dataset.alive = "f"
    elem.classList.remove("grow")
    elem.classList.remove("bury")
    elem.style.backgroundColor = "transparent"
    elem.style.borderColor = "navy"
    elem.innerHTML = elem.dataset.note
    elem.style.color = "orange"
  })
}


function clearLists() {
  birthList = [];
  deathList = [];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkAllCells() {
  document.querySelectorAll(".cell").forEach((elem) => {
    cellGameLogic(elem)
  })
}

function updateCells() {
  birthList.forEach((elem) => {
    elem.dataset.alive = "t";
    elem.classList.remove("bury")
    elem.classList.add("grow")
    elem.style.color = "white"
    let noteData = getFrequencyMajorHectatonic(elem.dataset.noteNum)
    playOsc(noteData[0]) 
    elem.innerHTML = noteData[1]
  })

  deathList.forEach((elem) => {
    elem.dataset.alive = "f";
    elem.classList.remove("grow")
    elem.classList.add("bury")
    elem.style.color = "orange"
    elem.style.backgroundColor = "transparent"
    elem.innerHTML = ""
  })
}


function gameOfLife() {
  clearLists()
  document.querySelectorAll(".cell").forEach((elem) => { 
    //elem.style.borderColor = "transparent"
    if (elem.dataset.alive == "f") {
      elem.innerHTML = ""
    }
  })
  gameTick = setInterval((e) => {
    clearLists()
    checkAllCells()
    updateCells()
  }, 300)
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let osc1
const audioCtx = new (window.AudioContext || window.webkit.AudioContext)();


function playOsc(freq) {
  let osc
  stopTime = 0.30
  let gain1 = audioCtx.createGain();
  gain1.gain.value = 0.05;
  osc = audioCtx.createOscillator();
  osc.type = "sine"// type//"sawtooth" //"square";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.connect(gain1).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime)
  stopTime += .15
  gain1.gain.setTargetAtTime(0, audioCtx.currentTime + stopTime - 0.25, .025);
  osc.stop(audioCtx.currentTime + stopTime)
  //osc.disconnect(audioCtx.destination)
}


function getFrequencyChromatic(num) {
  let noteNum;
  let note = "";
  let freq;
  //console.log(num)
  if (num <= 11) {
    noteNum = Number(num);
  }
  else {
    //console.log("note original: " + num)
    noteNum = (num % 12);
    //console.log("note modulus: " + noteNum)
  }

  switch(noteNum) {
    case 0:
      freq = 32.70320// 261.63;
      note = "C";
      break;
    case 1:
      freq = 34.64783 // 277.18;
      note = "C#/Db"
      break;
    case 2:
      freq = 36.70810 //293.66;
      note = "D"
      break;
    case 3:
      freq = 38.89087 //311.13;
      note = "D#/Eb"
      break;
    case 4:
      freq = 41.20344 //329.62;
      note = "E"
      break;
    case 5:
      freq = 43.65353 // 349.23;
      note = "F"
      break;
    case 6:
      freq = 46.24930 //69.99;
      note = "F#/Gb"
      break;
    case 7:
      freq = 48.99943 //392;
      note = "G"
      break;
    case 8:
      freq = 51.91309 //415.30;
      note = "G#/Ab"
      break;
    case 9:
      freq = 55.00000;
      note = "A"
      break;
    case 10:
      freq = 58.27047;
      note = "A#/Bb"
      break;
    case 11:
      freq = 61.73541;
      note = "B"
      break;
  }

  let multiplier = 1
  if (num > 11) {
    multiplier = Math.floor(num /12);
    if (multiplier < 2) {
      note = note + (multiplier + 1) 
      freq *= 2 
    }
    else {
      for (let i = 0; i < multiplier; i++) {
        freq *= 2
      }
      note = note + (multiplier + 1)
    }
  }
  //console.log("final freq: " + freq)
  console.log("note name: " + note + " " + num)
  return [freq, note];
}


function getFrequencyMajorHectatonic(num) {
  let noteNum;
  let note = "";
  let freq;
  if (num <= 6) {
    noteNum = Number(num);
  }
  else {
    noteNum = (num % 7);
  }

  switch(noteNum) {
    case 0:
      freq = 32.70320// 261.63;
      note = "C";
      break;
    case 1:
      freq = 36.70810 //293.66;
      note = "D"
      break;
    case 2:
      freq = 41.20344 //329.62;
      note = "E"
      break;
    case 3:
      freq = 43.65353 // 349.23;
      note = "F"
      break;
    case 4:
      freq = 48.99943 //392;
      note = "G"
      break;
    case 5:
      freq = 55.00000;
      note = "A"
      break;
    case 6:
      freq = 61.73541;
      note = "B"
      break;
  }

  let multiplier = 1
  if (num >= 7) {
    multiplier = Math.floor(num /7);

    if (multiplier < 2) {
      note = note + (multiplier + 1) 
      freq *= 2 
    }
    else {
      for (let i = 0; i < multiplier; i++) {
        freq *= 2
      }
      note = note + (multiplier + 1)
    }
  }
  else {
    note = note + (multiplier)
  }
  
  //console.log("final freq: " + freq)
  //console.log("note name: " + note)
  return [freq, note];
}

function getFrequencyMajorPentatonic(num) {
  let noteNum;
  let note;
  let freq;
  if (num <= 4) {
    noteNum = Number(num);
  }
  else {
    noteNum = (num % 5);
  }

  switch(noteNum) {
    case 0:
      freq = 55.00// 261.63;
      note = "A";
      break;
    case 1:
      freq = 65.40639 //311.13;
      note = "C"
      break;
    case 2:
      freq = 73.41619 // 349.23;
      note = "D"
      break;
    case 3:
      freq = 82.40689 //392;
      note = "E"
      break;
    case 4:
      freq = 97.99886;
      note = "G"
      break;
  }


  let multiplier = 1
  if (num >= 5) {
    multiplier = Math.floor(num /5);

    if (multiplier < 2) {
      note = note + (multiplier + 1) 
      freq *= 2 
    }
    else {
      for (let i = 0; i < multiplier; i++) {
        freq *= 2
      }
      note = note + (multiplier + 1)
    }
  }

  //console.log("final freq: " + freq)
  //console.log("note name: " + note)
  return [freq, note];
  }

function getFrequencyMelodicMinorHectatonic(num) {
  let noteNum;
  let note;
  let freq;
  if (num <= 6) {
    noteNum = Number(num);
  }
  else {
    noteNum = (num % 7);
  }


  switch(noteNum) {
    case 0:
      freq = 32.70320// 261.63;
      note = "C";
      break;
    case 1:
      freq = 36.70810 //293.66;
      note = "D"
      break;
    case 2:
      freq = 38.89087 //311.13;
      note = "D#/Eb"
      break;
    case 3:
      freq = 43.65353 // 349.23;
      note = "F"
      break;
    case 4:
      freq = 48.99943 //392;
      note = "G"
      break;
    case 5:
      freq = 55.00000;
      note = "A"
      break;
    case 6:
      freq = 61.73541;
      note = "B"
      break;
  }
  
  let multiplier = 1
  if (num >= 7) {
    multiplier = Math.floor(num /7);

    if (multiplier < 2) {
      note = note + (multiplier + 1) 
      freq *= 2 
    }
    else {
      for (let i = 0; i < multiplier; i++) {
        freq *= 2
      }
      note = note + (multiplier + 1)
    }
  }

  //console.log("final freq: " + freq)
  //console.log("note name: " + note)
  return [freq, note];
}

function getFrequencyHarmonicMinorHectatonic(num) {
  let noteNum;
  let note;
  let freq;
  if (num <= 6) {
    noteNum = Number(num);
  }
  else {
    noteNum = (num % 7);
  }

  switch(noteNum) {
    case 0:
      freq = 32.70320// 261.63;
      note = "C";
      break;
    case 1:
      freq = 36.70810 //293.66;
      note = "D"
      break;
    case 2:
      freq = 38.89087 //311.13;
      note = "D#/Eb"
      break;
    case 3:
      freq = 43.65353 // 349.23;
      note = "F"
      break;
    case 4:
      freq = 48.99943 //392;
      note = "G"
      break;
    case 5:
      freq = 51.91309 //415.30;
      note = "G#/Ab"
      break;
    case 6:
      freq = 61.73541;
      note = "B"
      break;
  }

  let multiplier = 1
  if (num >= 7) {
    multiplier = Math.floor(num /7);

    if (multiplier < 2) {
      note = note + (multiplier + 1) 
      freq *= 2 
    }
    else {
      for (let i = 0; i < multiplier; i++) {
        freq *= 2
      }
      note = note + (multiplier + 1)
    }
  }

  //console.log("final freq: " + freq)
  //console.log("note name: " + note)
  return [freq, note];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("resize", (e) => {
  gridDimension = game.getBoundingClientRect().width / cellWidthDimension;
  document.querySelectorAll(".cell").forEach((elem) => {
    elem.style.height = gridDimension + "px"
    elem.style.width = gridDimension + "px"
  })
})

scaleCtrl.addEventListener("change", (e) => {
  if (!startBool) {
    switch (e.target.value) {
      case "major":
        currentScaleCallback = getFrequencyMajorHectatonic
        break;
      case "pentatonic":
        currentScaleCallback = getFrequencyMajorPentatonic
        break;
      case "harmonic":
        currentScaleCallback = getFrequencyHarmonicMinorHectatonic
        break;
      case "melodic":
        currentScaleCallback = getFrequencyMelodicMinorHectatonic
        break;
      case "chromatic":
        currentScaleCallback = getFrequencyChromatic
        break;
    }
    document.querySelectorAll(".cell").forEach((elem) => {
      let noteData = currentScaleCallback(elem.dataset.noteNum)
      elem.dataset.note = noteData[1]
      elem.innerHTML = noteData[1]
    })

  }
})


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

createGrid(cellWidthDimension)

startBtn.addEventListener("click", (e) => {
  if (!startBool) {
    //document.querySelectorAll(".cell").forEach((elem) => {
      //elem.style.borderColor = "transparent" fix
    //})
    gameOfLife()
    startBool = true;
  }
})
 
resetBtn.addEventListener("click", (e) => {
  if (gameTick != null) {
    clearInterval(gameTick);
    gameTick = null;
  }
  
  startBool = false;
  clearLists();
  clearAllCells();
  playOsc(220.0)
}) 
 



//H---I-<>