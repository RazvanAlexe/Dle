let currentClueSet = null;
let currentGuessIndex = 0;
const maxGuesses = 6;
let isGameOver = false;
let currentMode = 'practice';

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
const shareBox = document.getElementById('shareBox');

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
    currentMode = mode;
    currentGuessIndex = 0;
    isGameOver = false;
    message.textContent = '';
    guessInput.value = '';
    board.innerHTML = '';
    cluesSection.innerHTML = '';
    shareBox.style.display = 'none';
    gameContainer.style.display = 'block';
    guessInput.disabled = false;
    submitBtn.disabled = false;

    currentClueSet = mode === 'daily' ? getDailyClueSet() : pickRandomClueSet();

    if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const key = `cluedle_played_${today}`;
        const alreadyPlayed = localStorage.getItem(key);
        if (alreadyPlayed) {
            isGameOver = true;
            message.textContent = "🛑 You've already played today's Cluedle.";
            guessInput.disabled = true;
            submitBtn.disabled = true;
            return;
        }
    }

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
        letterUsed[correct[i]] = (letterUsed[correct[i]] || 0) + 1;
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

function endGame(solved) {
    isGameOver = true;
    guessInput.disabled = true;
    submitBtn.disabled = true;

    if (currentMode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`cluedle_played_${today}`, solved ? 'win' : 'fail');
    }

    // Build result grid
    let result = `🧩 Cluedle ${solved ? currentGuessIndex : 'X'}/${maxGuesses}\n`;
    const rows = document.querySelectorAll('.guess-row');

    rows.forEach(row => {
        row.querySelectorAll('.letter-box').forEach(box => {
            if (box.classList.contains('correct')) result += '🟩';
            else if (box.classList.contains('present')) result += '🟨';
            else result += '⬛';
        });
        result += '\n';
    });

    shareBox.style.display = 'block';
    shareBox.querySelector('textarea').value = result.trim();
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
        endGame(true);
    } else if (currentGuessIndex >= maxGuesses) {
        message.textContent = `❌ Out of tries. Answer was: ${currentClueSet.answer.toUpperCase()}`;
        endGame(false);
    }
}

function copyResult() {
    const textarea = document.querySelector('#shareBox textarea');
    textarea.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}

// Event Listeners
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
