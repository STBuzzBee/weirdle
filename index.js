/*
    This implementation based upon gaearon's implementation
    https://gist.github.com/gaearon/deb61c3f10a9319c348987acc0435ff9

*/


fetch('https://gist.githubusercontent.com/cfreshman/cdcdf777450c5b5301e439061d29694c/raw/de1df631b45492e0974f7affe266ec36fed736eb/wordle-allowed-guesses.txt')
  .then(response => response.text())
  .then(data => {
  	// Do something with your data
  	let answers = data.split('\n');
      fetch('https://gist.githubusercontent.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/raw/a9e55d7e0c08100ce62133a1fa0d9c4f0f542f2c/wordle-answers-alphabetical.txt')
  .then(response => response.text())
  .then(data => {
  	// Do something with your data
  	let possible = data.split('\n');

      let wordList = answers + possible;
  
let secret = answers[getRandomInt(0, answers.length)];
console.log(secret);

const NUM_GUESSES = 8;

let currentAttempt = ''
let history = []
let solved = false;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return
  }
  handleKey(e.key)
}

function handleKey(key) {
  if (history.length === NUM_GUESSES || solved) {
    return
  }
  if (isAnimating) {
    return
  }
  let letter = key.toLowerCase()
  if (letter === 'enter') {
    if (currentAttempt.length < 5) {
      return
    }
    if (!wordList.includes(currentAttempt)) {
      alert(`${currentAttempt} isn't in my dictionary!`)
      return
    }
    if (
      history.length >= NUM_GUESSES - 1 &&
      currentAttempt !== secret
    ) {
      alert(`Darn, the word was... ${secret}`)
    }

    if (currentAttempt == secret) {
        solved = true;
    }
    history.push(currentAttempt)
    currentAttempt = ''
    updateKeyboard()
    //saveGame()
    pauseInput()
  } else if (letter === 'backspace') {
    currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1)
  } else if (/^[a-z]$/.test(letter)) {
    if (currentAttempt.length < 5) {
      currentAttempt += letter
      animatePress(currentAttempt.length - 1)
    }
  }
  updateGrid()
}

let isAnimating = false
function pauseInput() {
  if (isAnimating) throw Error('should never happen')
  isAnimating = true
  setTimeout(() => {
    isAnimating = false
  }, 500)
}

function buildGrid() {
  for (let i = 0; i < NUM_GUESSES; i++) {
    let row = document.createElement('div')
    for (let j = 0; j < 5; j++) {
      let cell = document.createElement('div')
      cell.className = 'cell'
      let front = document.createElement('div')
      front.className = 'front'
      let back = document.createElement('div')
      back.className = 'back'
      let surface = document.createElement('div')
      surface.className = 'surface'
      surface.style.transitionDelay = (j * 100) + 'ms'
      surface.appendChild(front)
      surface.appendChild(back)
      cell.appendChild(surface)
      row.appendChild(cell)
    }
    grid.appendChild(row)
  }
}

function updateGrid() {
  for (let i = 0; i < NUM_GUESSES; i++) {
    let row = grid.children[i]
    if (i < history.length) {
      drawAttempt(row, history[i], true)
    } else if (i === history.length) {
      drawAttempt(row, currentAttempt, false)
    } else {
      drawAttempt(row, '', false)
    }
  }
}

function drawAttempt(row, attempt, solved) {
  for (let i = 0; i < 5; i++) {
    let cell = row.children[i]
    let surface = cell.firstChild
    let front = surface.children[0]
    let back = surface.children[1]
    if (attempt[i] !== undefined) {
      front.textContent = attempt[i]
      back.textContent = attempt[i]
    } else {
      // lol
      front.innerHTML = '<div style="opacity: 0">X</div>'
      back.innerHTML = '<div style="opacity: 0">X</div>'
      clearAnimation(cell)
    }
    front.style.backgroundColor = BLACK
    front.style.borderColor = ''
    if (attempt[i] !== undefined) {
      front.style.borderColor = MIDDLEGREY
    }
    back.style.backgroundColor = getBgColor(attempt, i)
    back.style.borderColor = getBgColor(attempt, i)
    if (solved) {
      cell.classList.add('solved')
    } else {
      cell.classList.remove('solved')
    }
  }
}

let BLACK = '#111'
let GREY = '#212121'
let MIDDLEGREY = '#666'
let LIGHTGREY = '#888'
let GREEN = '#538d4e'
let YELLOW = '#b59f3b'

function getBgColor(attempt, i) {
  let correctLetter = secret[i]
  let attemptLetter = attempt[i]
  if (
    attemptLetter === undefined ||
    secret.indexOf(attemptLetter) === -1
  ) {
    return GREY
  }
  if (correctLetter === attemptLetter) {
    return GREEN
  }
  return YELLOW
}

function buildKeyboard() {
  buildKeyboardRow('qwertyuiop', false)
  buildKeyboardRow('asdfghjkl', false)
  buildKeyboardRow('zxcvbnm', true)
}

function buildKeyboardRow(letters, isLastRow) {
  let row = document.createElement('div')
  if (isLastRow) {
    let button = document.createElement('button')
    button.className = 'button'
    button.textContent = 'Enter'
    button.style.backgroundColor = LIGHTGREY
    button.onclick = () => {
      handleKey('enter')
    };
    row.appendChild(button)
  }
  for (let letter of letters) {
    let button = document.createElement('button')
    button.className = 'button'
    button.textContent = letter
    button.style.backgroundColor = LIGHTGREY
    button.onclick = () => {
      handleKey(letter)
    };
    keyboardButtons.set(letter, button)
    row.appendChild(button)
  }
  if (isLastRow) {
    let button = document.createElement('button')
    button.className = 'button'
    button.textContent = 'Backspace'
    button.style.backgroundColor = LIGHTGREY
    button.onclick = () => {
      handleKey('backspace')
    };
    row.appendChild(button)
  }
  keyboard.appendChild(row)
}

function getBetterColor(a, b) {
  if (a === GREEN || b === GREEN) {
    return GREEN
  }
  if (a === YELLOW || b === YELLOW) {
    return YELLOW
  }
  return GREY
}

function updateKeyboard() {
  let bestColors = new Map()
  for (let attempt of history) {
    for (let i = 0; i < attempt.length; i++) {
      let color = getBgColor(attempt, i)
      let key = attempt[i]
      let bestColor = bestColors.get(key)
      bestColors.set(key, getBetterColor(color, bestColor))
    }
  }
  for (let [key, button] of keyboardButtons) {
    button.style.backgroundColor = bestColors.get(key)
    button.style.borderColor = bestColors.get(key)
  }
}

function animatePress(index) {
  let rowIndex = history.length
  let row = grid.children[rowIndex]
  let cell = row.children[index]
  cell.style.animationName = 'press'
  cell.style.animationDuration = '50ms'
  cell.style.animationTimingFunction = 'ease-out'
}

function clearAnimation(cell) {
  cell.style.animationName = ''
  cell.style.animationDuration = ''
  cell.style.animationTimingFunction = ''
}

function loadGame() {
  let data
  try {
    data = JSON.parse(localStorage.getItem('data'))
  } catch { }
  if (data != null) {
    if (data.secret === secret) {
      history = data.history
    }
  }
}

function saveGame() {
  let data = JSON.stringify({
    secret,
    history
  })
  try {
    localStorage.setItem('data', data)
  } catch { }
}

let grid = document.getElementById('grid')
let keyboard = document.getElementById('keyboard')
let keyboardButtons = new Map()
//loadGame()
buildGrid()
buildKeyboard()
updateGrid()
updateKeyboard()
window.addEventListener('keydown', handleKeyDown)

});
});