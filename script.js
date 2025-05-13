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

let score = 0;
let correctEmoji = "";
let userName = "Player";
let userInitial = "U";
let gameActive = false;
let consecutiveCorrect = 0;
let gameLevel = 1;
let roundDelay = 300;

// Apply Telegram theme if available
function applyTelegramTheme() {
  if (tg && tg.colorScheme) {
    if (tg.colorScheme === 'dark') {
      document.body.classList.add('dark');
    }
    
    // If Telegram provides theme colors, we can use them
    if (tg.themeParams) {
      document.documentElement.style.setProperty('--primary-color', tg.themeParams.button_color || '#2AABEE');
      document.documentElement.style.setProperty('--bg-light', tg.themeParams.bg_color || '#f5f5f5');
      document.documentElement.style.setProperty('--text-light', tg.themeParams.text_color || '#333333');
    }
  } else {
    // Fallback for when not in Telegram or during development
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }
  }
}

// Get user info from Telegram if available
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
  
  // Set up event listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);
  
  // Auto close splash after a delay (3 seconds)
  setTimeout(() => {
    if (splashScreen.style.display !== 'none') {
      startGame();
    }
  }, 3000);
}

// Start the game
function startGame() {
  score = 0;
  consecutiveCorrect = 0;
  gameLevel = 1;
  updateScore();
  
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
  gameOverScreen.style.display = 'none';
  score = 0;
  consecutiveCorrect = 0;
  gameLevel = 1;
  updateScore();
  gameActive = true;
  nextRound();
}

// Update the score display
function updateScore() {
  scoreEl.textContent = `Score: ${score}`;
  finalScoreEl.textContent = score;
}

// Start the next round
function nextRound() {
  if (!gameActive) return;
  
  // Clear game area
  gameAreaEl.innerHTML = '';
  
  // Pick correct emoji
  correctEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  targetEmojiEl.textContent = correctEmoji;
  
  // Create grid of emojis (5x5)
  const gridSize = 26;
  let options = shuffle([...emojis]).slice(0, gridSize - 1);
  
  // Make sure correct emoji is in the grid
  if (!options.includes(correctEmoji)) {
    options[0] = correctEmoji;
  }
  options = shuffle(options);
  
  // Add emojis to the grid with staggered animation
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

// Handle emoji tap
function handleTap(tappedEmoji, button) {
  if (!gameActive) return;
  
  if (tappedEmoji === correctEmoji) {
    // Correct tap
    button.classList.add('correct');
    score += gameLevel;
    consecutiveCorrect++;
    
    // Level up every 5 consecutive correct answers
    if (consecutiveCorrect >= 5) {
      gameLevel++;
      consecutiveCorrect = 0;
    }
    
    updateScore();
    
    // Brief delay before next round
    setTimeout(() => {
      nextRound();
    }, roundDelay);
  } else {
    // Wrong tap
    button.classList.add('wrong');
    gameActive = false;
    
    // Show game over after a brief delay
    setTimeout(() => {
      gameOverScreen.style.display = 'flex';
    }, 1000);
  }
}

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Expand main game area to fill viewport
function adjustGameAreaSize() {
  const headerHeight = document.querySelector('.header').offsetHeight;
  const targetHeight = document.querySelector('.target-container').offsetHeight;
  const containerPadding = 40;
  const windowHeight = window.innerHeight;
  
  const availableHeight = windowHeight - headerHeight - targetHeight - containerPadding;
  gameAreaEl.style.height = `${availableHeight}px`;
}

// Initialize the game when document is loaded
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', adjustGameAreaSize);

// If Telegram Web App is available, set up back button handler
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