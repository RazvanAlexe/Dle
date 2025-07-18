let currentPuzzle;
let currentGuess = '';
let attempts = [];
let gameOver = false;

const board = document.getElementById('board');
const cluesBox = document.getElementById('clues');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const returnBtn = document.getElementById('returnBtn');
const themeToggle = document.getElementById('themeToggle');
const gameContainer = document.getElementById('gameContainer');
const dailyBtn = document.getElementById('dailyBtn');
const practiceBtn = document.getElementById('practiceBtn');

function selectPuzzle(mode) {
    gameContainer.style.display = 'block';
    document.querySelector('.mode-toggle').style.display = 'none';

    if (mode === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').join('');
        const index = parseInt(seed) % clues.length;
        currentPuzzle = clues[index];
    } else {
        currentPuzzle = clues[Math.floor(Math.random() * clues.length)];
    }
    startGame();
}

function startGame() {
    cluesBox.innerHTML = currentPuzzle.clues.map(clue => `<p>💬 ${clue}</p>`).join('');
    board.innerHTML = '';
    currentGuess = '';
    attempts = [];
    gameOver = false;
    message.textContent = '';
    drawBoard();
}

function drawBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        const guess = attempts[i] || '';
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            const letter = guess[j] || '';
            tile.textContent = letter;

            if (guess && currentPuzzle) {
                const answerLetter = currentPuzzle.answer[j];
                if (letter === answerLetter) {
                    tile.classList.add('correct');
                } else if (currentPuzzle.answer.includes(letter)) {
                    tile.classList.add('present');
                } else {
                    tile.classList.add('absent');
                }
            }
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function handleKeyPress(e) {
    if (gameOver) return;
    const key = e.key.toLowerCase();
    if (key === 'enter') {
        submitGuess();
    } else if (key === 'backspace') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
        currentGuess += key;
    }
    drawBoard();
    fillCurrentRow();
}

function fillCurrentRow() {
    const row = board.children[attempts.length];
    if (!row) return;
    for (let i = 0; i < 5; i++) {
        row.children[i].textContent = currentGuess[i] || '';
    }
}

function submitGuess() {
    if (currentGuess.length !== 5) {
        message.textContent = 'Enter a 5-letter word';
        return;
    }
    attempts.push(currentGuess);
    drawBoard();
    if (currentGuess === currentPuzzle.answer) {
        message.textContent = 'You got it!';
        gameOver = true;
    } else if (attempts.length >= 6) {
        message.textContent = `Out of tries! The word was “${currentPuzzle.answer}”.`;
        gameOver = true;
    } else {
        message.textContent = '';
    }
    currentGuess = '';
}

submitBtn.addEventListener('click', submitGuess);
returnBtn.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    document.querySelector('.mode-toggle').style.display = 'flex';
    board.innerHTML = '';
    cluesBox.innerHTML = '';
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

dailyBtn.addEventListener('click', () => selectPuzzle('daily'));
practiceBtn.addEventListener('click', () => selectPuzzle('practice'));

document.addEventListener('keydown', handleKeyPress);
