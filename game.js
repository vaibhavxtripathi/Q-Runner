const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const promptElement = document.getElementById('prompt');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game state
let gameActive = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 3;
let lastPromptUpdate = 0;

// Update high score display
highScoreElement.textContent = `HIGH SCORE: ${highScore}`;

// Player
const player = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    speed: 5
};

// Arrays for game objects
let coins = [];
let obstacles = [];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Enter' && !gameActive) {
        restartGame();
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Spawn coin
function spawnCoin() {
    if (Math.random() < 0.02) {
        coins.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20
        });
    }
}

// Spawn obstacle
function spawnObstacle() {
    if (Math.random() < 0.01) {
        obstacles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 40),
            width: 20,
            height: 40
        });
    }
}

// Update prompt message
function updatePrompt(message, duration = 1000) {
    const now = Date.now();
    if (now - lastPromptUpdate > duration) {
        promptElement.textContent = message;
        lastPromptUpdate = now;
    }
}

// Update game state
function update() {
    if (!gameActive) return;

    // Player movement
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

    // Update coins
    coins.forEach(coin => coin.x -= gameSpeed);
    coins = coins.filter(coin => coin.x > -coin.width);

    // Update obstacles
    obstacles.forEach(obstacle => obstacle.x -= gameSpeed);
    obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);

    // Collision detection - coins
    coins.forEach((coin, index) => {
        if (player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coins.splice(index, 1);
            score += 10;
            scoreElement.textContent = `SCORE: ${score}`;
            updatePrompt(`[SUCCESS] Collected coin! +10 points`);
        }
    });

    // Collision detection - obstacles
    obstacles.forEach((obstacle, index) => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    });

    // Spawn new objects
    spawnCoin();
    spawnObstacle();

    // Increase game speed
    gameSpeed = 3 + Math.floor(score / 100);

    // Update prompt with game speed
    if (gameSpeed > 3) {
        updatePrompt(`[INFO] Speed increased to ${gameSpeed}`, 2000);
    }
}

// Game over
function gameOver() {
    gameActive = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = `HIGH SCORE: ${highScore}`;
        updatePrompt(`[NEW HIGH SCORE] ${highScore}`, 2000);
    }
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = `FINAL SCORE: ${score}`;
    promptElement.textContent = "Game Over! Press [ENTER] to restart";
}

// Restart game
function restartGame() {
    gameActive = true;
    score = 0;
    gameSpeed = 3;
    player.y = canvas.height / 2;
    coins = [];
    obstacles = [];
    scoreElement.textContent = 'SCORE: 0';
    gameOverElement.style.display = 'none';
    updatePrompt("Game started! Use arrow keys to move");
}

restartButton.addEventListener('click', restartGame);

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px Consolas';
    ctx.fillText('@', player.x, player.y + 20);

    // Draw coins
    ctx.fillStyle = '#00ff00';
    coins.forEach(coin => {
        ctx.fillText('$', coin.x, coin.y + 20);
    });

    // Draw obstacles
    ctx.fillStyle = '#00ff00';
    obstacles.forEach(obstacle => {
        ctx.fillText('#', obstacle.x, obstacle.y + 20);
    });

    // Draw border
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop(); 