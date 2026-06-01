// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 6;
const ballSpeed = 5;
const paddleSpeed = 6;
const computerSpeed = 4;
const winScore = 11;

// Player paddle
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Computer paddle
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: ballSpeed,
    dy: ballSpeed * 0.5,
    speed: ballSpeed
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = Math.max(0, Math.min(mouseY - paddleHeight / 2, canvas.height - paddleHeight));
});

// Update player paddle with arrow keys
function updatePlayer() {
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - paddleSpeed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - paddleHeight, player.y + paddleSpeed);
    }
}

// AI for computer paddle
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 20) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computerSpeed);
    } else if (computerCenter > ballCenter + 20) {
        computer.y = Math.max(0, computer.y - computerSpeed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision - Player
    if (
        ball.x - ball.radius <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height &&
        ball.dx < 0
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 2;
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.radius >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height &&
        ball.dx > 0
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 2;
    }

    // Scoring
    if (ball.x < 0) {
        computer.score++;
        resetBall();
    }
    if (ball.x > canvas.width) {
        player.score++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeed * 0.5 * (Math.random() > 0.5 ? 1 : -1);
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';

    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Update score display
function updateScores() {
    document.getElementById('player-score').textContent = player.score;
    document.getElementById('computer-score').textContent = computer.score;
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    updateScores();
    draw();

    // Check for winner
    if (player.score >= winScore) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        return;
    } else if (computer.score >= winScore) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();