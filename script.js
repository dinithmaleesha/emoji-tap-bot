// Initialize the Telegram Web App API
const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe.user;

// Display user's name in the UI (on top of score)
document.getElementById("player-name").textContent = `Player: ${user.first_name}`;

const emojis = ["🍕", "😎", "🐶", "🎉", "🚀", "😈", "🥳", "💩", "👽"];
let score = 0;
let correctEmoji = "";

// Update the score UI to show player's name and score
document.getElementById("score").textContent = `Score: 0`;

document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  score = 0;
  document.getElementById("score").textContent = `Score: 0`;
  nextRound();
}

function nextRound() {
  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = "";

  // Pick correct emoji
  correctEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  // Show target emoji
  const target = document.createElement("div");
  target.textContent = `Tap: ${correctEmoji}`;
  target.style.fontSize = "24px";
  gameArea.appendChild(target);

  // Create buttons with emojis
  let options = shuffle([...emojis]).slice(0, 4);
  if (!options.includes(correctEmoji)) options[0] = correctEmoji;
  options = shuffle(options);

  options.forEach(emoji => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    btn.textContent = emoji;
    btn.onclick = () => handleTap(emoji);
    gameArea.appendChild(btn);
  });
}

function handleTap(tappedEmoji) {
  if (tappedEmoji === correctEmoji) {
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
    nextRound();
  } else {
    alert(`Wrong emoji! Game Over. Final Score: ${score}`);
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
