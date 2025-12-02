const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const PLAYER_SIZE = 20;
const BULLET_RADIUS = 3;
const ENEMY_SIZE = 15;
const GAME_SPEED = 1000 / 60; // 60 FPS

// --- Game State ---
let player = { x: canvas.width / 2, y: canvas.height - 30, health: 3 };
let bullets = [];
let enemies = [];
let score = 0;
let isShooting = false;
let gameInterval;

// --- Input Handling (Mouse) ---
canvas.addEventListener('mousemove', (e) => {
    // Center the player ship on the cursor
    player.x = e.clientX - canvas.getBoundingClientRect().left - PLAYER_SIZE / 2;
    
    // Clamp the player position within the canvas boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - PLAYER_SIZE) player.x = canvas.width - PLAYER_SIZE;
});

canvas.addEventListener('mousedown', () => { isShooting = true; });
canvas.addEventListener('mouseup', () => { isShooting = false; });
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        isShooting = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isShooting = false;
    }
});


// --- Drawing Functions ---
function drawPlayer() {
    ctx.fillStyle = '#2ecc71'; // Green spaceship
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    
    // Simple cockpit/design element
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(player.x + PLAYER_SIZE / 4, player.y + PLAYER_SIZE / 4, PLAYER_SIZE / 2, PLAYER_SIZE / 2);
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#f1c40f'; // Yellow bullet
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    ctx.fillStyle = '#e74c3c'; // Red enemies (asteroids/ships)
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
}

function drawHealth() {
    ctx.fillStyle = '#e74c3c';
    ctx.font = '16px Arial';
    ctx.fillText('Health: ' + player.health, canvas.width - 80, 25);
}

// --- Game Logic ---
function updateGame() {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update Bullets
    bullets.forEach(bullet => {
        bullet.y -= 5;
    });
    bullets = bullets.filter(bullet => bullet.y > 0);

    // 3. Update Enemies
    enemies.forEach(enemy => {
        enemy.y += 2;
    });
    enemies = enemies.filter(enemy => enemy.y < canvas.height);
    
    // 4. Enemy Spawner
    if (Math.random() < 0.02) { // 2% chance per frame to spawn a new enemy
        enemies.push({
            x: Math.random() * (canvas.width - ENEMY_SIZE),
            y: 0
        });
    }

    // 5. Shooting logic (Rate limit)
    if (isShooting && Date.now() - (player.lastShot || 0) > 200) {
        bullets.push({ x: player.x + PLAYER_SIZE / 2, y: player.y });
        player.lastShot = Date.now();
    }
    
    // 6. Collision Detection (Bullet vs Enemy)
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x > enemy.x && 
                bullet.x < enemy.x + ENEMY_SIZE && 
                bullet.y > enemy.y && 
                bullet.y < enemy.y + ENEMY_SIZE
            ) {
                // Hit! Remove both bullet and enemy
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
            }
        });
    });

    // 7. Collision Detection (Player vs Enemy)
    enemies.forEach((enemy, eIndex) => {
        if (
            player.x < enemy.x + ENEMY_SIZE &&
            player.x + PLAYER_SIZE > enemy.x &&
            player.y < enemy.y + ENEMY_SIZE &&
            player.y + PLAYER_SIZE > enemy.y
        ) {
            // Player hit!
            enemies.splice(eIndex, 1);
            player.health--;
        }
    });

    // 8. Game Over Check
    if (player.health <= 0) {
        clearInterval(gameInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2 - 60, canvas.height / 2 + 20);
        return; // Stop drawing and updating
    }

    // 9. Draw all elements
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawScore();
    drawHealth();
}

// Start the game loop
gameInterval = setInterval(updateGame, GAME_SPEED);
