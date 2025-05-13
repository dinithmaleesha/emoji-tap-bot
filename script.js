// Get Telegram Web App instance
const tg = window.Telegram?.WebApp;
    
// Game elements
const splashScreen = document.getElementById('splash-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const playerNameEl = document.getElementById('player-name');
const avatarEl = document.getElementById('avatar');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const targetEmojiEl = document.getElementById('target-emoji');
const gameAreaEl = document.getElementById('game-area');

// Game variables
const emojis = [
  "🍕", "😎", "🐶", "🎉", "🚀", "😈", "🥳", "💩", "👽", "🦄", "🦊", "🍀", "🌟", "🌈", 
  "🎮", "💃", "🕺", "🎧", "🍓", "🌴", "🍦", "🍔", "🎩", "🦋", "👑", "🎯", "🕶️", "🌙", "🍇",
  "🐱", "🐻", "🦁", "🐷", "🐵", "🦒", "🦉", "🦔", "🌼", "🌻", "🍄", "💀", "⚡", "🏖️", "🧸",
  "🎬", "🎤", "📸", "🧑‍💻", "🍿", "🍉", "🍒", "🥕", "🍆", "🌽", "🥑", "🍋", "🍊", "🍌", "🧀",
  "🍩", "🧁", "🍫", "🍬", "🍪", "🍰", "🎂", "🍻", "🍷", "🍸", "🍾", "🍺", "🏆", "⚽", "🏀"
];

let chances = 3; // Initialize with 3 chances
let score = 0;
let correctEmoji = "";
let userName = "Player";
let userInitial = "U";
let gameActive = false;
let consecutiveCorrect = 0;
let gameLevel = 1;
let roundDelay = 300;

let timerInterval;
let timeLeft = 10;
let timerStarted = false;
const timerEl = document.getElementById('timer');

// Apply Telegram theme
function applyTelegramTheme() {
  if (tg && tg.colorScheme) {
    if (tg.colorScheme === 'dark') {
      document.body.classList.add('dark');
    }
    
    if (tg.themeParams) {
      document.documentElement.style.setProperty('--primary-color', tg.themeParams.button_color || '#2AABEE');
      document.documentElement.style.setProperty('--bg-light', tg.themeParams.bg_color || '#f5f5f5');
      document.documentElement.style.setProperty('--text-light', tg.themeParams.text_color || '#333333');
    }
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }
  }
}

// Get user info from Telegram
function getUserInfo() {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    userName = user.first_name || 'Player';
    userInitial = userName.charAt(0).toUpperCase();
    
    playerNameEl.textContent = userName;
    
    if (user.photo_url) {
      avatarEl.innerHTML = `<img src="${user.photo_url}" alt="${userName}" />`;
      avatarEl.classList.add('has-photo');
    } else {
      avatarEl.textContent = userInitial;
    }
  }
}

// Initialize the game
function init() {
  applyTelegramTheme();
  getUserInfo();
  
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);
  
  // setTimeout(() => {
  //   if (splashScreen.style.display !== 'none') {
  //     startGame();
  //   }
  // }, 3000);
}

// Start the game
function startGame() {
  score = 0;
  chances = 3;  // Reset chances
  consecutiveCorrect = 0;
  gameLevel = 1;
  updateScore();

  clearInterval(timerInterval);
  timeLeft = 10;
  timerStarted = false;
  updateTimerDisplay();
  
  splashScreen.style.opacity = '0';
  setTimeout(() => {
    splashScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    
    setTimeout(() => {
      gameScreen.classList.add('active');
      gameActive = true;
      nextRound();
    }, 100);
  }, 500);
}

// Restart the game
function restartGame() {
  clearInterval(timerInterval);
  timeLeft = 10;
  timerStarted = false;
  updateTimerDisplay();
  gameOverScreen.style.display = 'none';
  score = 0;
  chances = 3;
  consecutiveCorrect = 0;
  gameLevel = 1;
  updateScore();
  gameActive = true;
  nextRound();
}

function updateScore() {
  scoreEl.textContent = `Score: ${score} | Chances: ${chances}`;
  finalScoreEl.textContent = score;
}

// Start the next round
function nextRound() {
  if (!gameActive || chances <= 0) return; 
  
  gameAreaEl.innerHTML = '';
  
  correctEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  targetEmojiEl.textContent = correctEmoji;
  
  // grid of emojis (4x5)
  const gridSize = 21;
  let options = shuffle([...emojis]).slice(0, gridSize - 1);
  
  if (!options.includes(correctEmoji)) {
    options[0] = correctEmoji;
  }
  options = shuffle(options);
  
  options.forEach((emoji, index) => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.style.opacity = '0';
    btn.style.animation = `fadeIn 0.3s ease forwards ${index * 0.02}s`;
    
    btn.addEventListener('click', () => handleTap(emoji, btn));
    gameAreaEl.appendChild(btn);
  });
}

function handleTap(tappedEmoji, button) {
  if (!gameActive || chances <= 0) return;  // Stop the game if no chances left

  // Start timer
  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  if (tappedEmoji === correctEmoji) {
    // ✅ Correct tap
    button.classList.add('correct');
    resetTimer();

    timeLeft = Math.max(3, 10 - gameLevel); 
    updateTimerDisplay();

    score += gameLevel;
    consecutiveCorrect++;

    if (score >= 50 && chances < 4) {
      chances++;
    }

    if (consecutiveCorrect >= 5) {
      gameLevel++;
      consecutiveCorrect = 0;

      timeLeft = Math.max(3, 10 - gameLevel); 
      updateTimerDisplay();

      roundDelay = Math.max(100, 300 - (gameLevel * 20));
    }

    updateScore();

    setTimeout(() => {
      nextRound();
    }, roundDelay);

  } else {
    // ❌ Wrong tap
    button.classList.add('wrong');
    chances--;
    resetTimer();
    
    if (chances <= 0) {
      gameActive = false;
      setTimeout(() => {
        showGameOver();
      }, 800);
    } else {
      updateScore();
      setTimeout(() => {
        nextRound();
      }, 800);
    }
  }
}

function resetTimer() {
  timeLeft = 10;
  updateTimerDisplay();
  const timerFill = document.getElementById('timer-fill');
  timerFill.style.transition = 'none';
  timerFill.style.width = '100%';
  
  setTimeout(() => {
    timerFill.style.transition = 'width 1s linear';
  }, 50);
}

function startTimer() {
  timeLeft = 10;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameActive = false;
      timerStarted = false;
      showGameOver();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerFill = document.getElementById('timer-fill');
  
  const percentage = (timeLeft / 10) * 100; 
  timerFill.style.width = `${percentage}%`;

  if (timeLeft <= 3) {
    timerFill.style.backgroundColor = 'red';
  } else if (timeLeft <= 6) {
    timerFill.style.backgroundColor = 'orange';
  } else {
    timerFill.style.backgroundColor = 'green';
  }
}

function showGameOver() {
  gameOverScreen.style.display = 'flex';
}

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function adjustGameAreaSize() {
  const headerHeight = document.querySelector('.header').offsetHeight;
  const targetHeight = document.querySelector('.target-container').offsetHeight;
  const containerPadding = 40;
  const windowHeight = window.innerHeight;
  
  const availableHeight = windowHeight - headerHeight - targetHeight - containerPadding;
  gameAreaEl.style.height = `${availableHeight}px`;
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', adjustGameAreaSize);

if (tg) {
  tg.BackButton.onClick(() => {
    if (gameScreen.classList.contains('active')) {
      gameActive = false;
      gameScreen.classList.remove('active');
      
      setTimeout(() => {
        gameScreen.style.display = 'none';
        splashScreen.style.display = 'flex';
        splashScreen.style.opacity = '1';
      }, 300);
      
      return true;
    }
    return false;
  });
}