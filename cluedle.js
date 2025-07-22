let currentClueSet = null;
let currentGuessIndex = 0;
const maxGuesses = 6;
let isGameOver = false;

const board = document.getElementById('board');
const cluesSection = document.getElementById('clues');
const gameContainer = document.getElementById('gameContainer');
const dailyBtn = document.getElementById('dailyBtn');
const practiceBtn = document.getElementById('practiceBtn');
const returnBtn = document.getElementById('returnBtn');
const submitBtn = document.getElementById('submitBtn');
const guessInput = document.getElementById('guessInput');
const message = document.getElementById('message');
const themeToggle = document.getElementById('themeToggle');

function pickRandomClueSet() {
    return clues[Math.floor(Math.random() * clues.length)];
}

function getDailyClueSet() {
    const today = new Date().toISOString().slice(0, 10);
    const seed = today.split('-').join('');
    const index = parseInt(seed) % clues.length;
    return clues[index];
}

function startGame(mode) {
    currentGuessIndex = 0;
    isGameOver = false;
    message.textContent = '';
    guessInput.value = '';
    board.innerHTML = '';
    cluesSection.innerHTML = '';
    gameContainer.style.display = 'block';

    currentClueSet = mode === 'daily' ? getDailyClueSet() : pickRandomClueSet();

    currentClueSet.clues.forEach(clue => {
        const p = document.createElement('p');
        p.textContent = '🧩 ' + clue;
        cluesSection.appendChild(p);
    });
}

function displayGuessFeedback(guess, correct) {
    const row = document.createElement('div');
    row.className = 'guess-row';

    const letterUsed = {};
    for (let i = 0; i < correct.length; i++) {
        const ch = correct[i];
        letterUsed[ch] = (letterUsed[ch] || 0) + 1;
    }

    const boxStates = Array(5).fill('absent');
    for (let i = 0; i < 5; i++) {
        if (guess[i] === correct[i]) {
            boxStates[i] = 'correct';
            letterUsed[guess[i]]--;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (boxStates[i] === 'correct') continue;
        if (correct.includes(guess[i]) && letterUsed[guess[i]] > 0) {
            boxStates[i] = 'present';
            letterUsed[guess[i]]--;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        const span = document.createElement('span');
        span.classList.add('letter-box', boxStates[i]);
        span.textContent = guess[i].toUpperCase();
        row.appendChild(span);
    }

    board.appendChild(row);
}

function handleGuess() {
    if (isGameOver) return;

    const guess = guessInput.value.toLowerCase().trim();
    if (guess.length !== 5 || !/^[a-z]{5}$/.test(guess)) {
        message.textContent = 'Enter a valid 5-letter word.';
        return;
    }

    displayGuessFeedback(guess, currentClueSet.answer);
    currentGuessIndex++;
    guessInput.value = '';

    if (guess === currentClueSet.answer) {
        message.textContent = '🎉 Correct! You solved it!';
        isGameOver = true;
    } else if (currentGuessIndex >= maxGuesses) {
        message.textContent = `❌ Out of tries. Answer was: ${currentClueSet.answer.toUpperCase()}`;
        isGameOver = true;
    }
}

submitBtn.addEventListener('click', handleGuess);

returnBtn.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    cluesSection.innerHTML = '';
    board.innerHTML = '';
    guessInput.value = '';
    message.textContent = '';
});

dailyBtn.addEventListener('click', () => startGame('daily'));
practiceBtn.addEventListener('click', () => startGame('practice'));

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});
