// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state
let currentScene = "bedroom";
let playerW = 20;
let playerH = 30;
let playerX = 400;
let playerY = 300;
let playerSpeed = 3;
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// Room definition
const roomX = 50;
const roomY = 50;
const roomW = 700;
const roomH = 500;

// Fade transition variables
let fadeAlpha = 0;
let isFading = false;
let nextScene = "";
let sceneSwitch = false;

// Draw a more detailed bedroom
function drawBedroom() {
    // Fill the whole canvas with black (outside the room)
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw room background (wall color)
    ctx.fillStyle = "#e6f2ff";
    ctx.fillRect(roomX, roomY, roomW, roomH);

    // Draw room border (thick, dark wood)
    ctx.strokeStyle = "#8b4513";
    ctx.lineWidth = 10;
    ctx.strokeRect(roomX, roomY, roomW, roomH);

    // Draw bed
    ctx.fillStyle = "#a67c52"; // Bed frame
    ctx.fillRect(roomX + 100, roomY + 250, 200, 120); // Bed base
    ctx.fillStyle = "#fff"; // Mattress
    ctx.fillRect(roomX + 110, roomY + 250, 180, 110); // Mattress
    ctx.fillStyle = "#d9b38c"; // Pillows
    ctx.fillRect(roomX + 120, roomY + 250, 40, 30);
    ctx.fillRect(roomX + 170, roomY + 250, 40, 30);
    ctx.fillStyle = "#660000"; // Blanket
    ctx.fillRect(roomX + 120, roomY + 280, 160, 80);

    // Draw shelf (with books)
    ctx.fillStyle = "#d9b38c";
    ctx.fillRect(roomX + 500, roomY + 180, 100, 20); // Shelf
    ctx.fillStyle = "#333";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(roomX + 510 + i*18, roomY + 160, 12, 20); // Books
    }

    // Draw door (with handle)
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(roomX + 340, roomY + 420, 60, 80); // Door
    ctx.fillStyle = "#fff";
    ctx.fillRect(roomX + 370, roomY + 460, 10, 10); // Door handle

    // Draw rug (oval shape)
    ctx.fillStyle = "#b87333";
    ctx.beginPath();
    ctx.ellipse(roomX + 350, roomY + 350, 120, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw TV (with stand)
    ctx.fillStyle = "#222";
    ctx.fillRect(roomX + 300, roomY + 100, 80, 50); // TV
    ctx.fillStyle = "#999";
    ctx.fillRect(roomX + 335, roomY + 150, 10, 20); // TV stand

    // Draw LEDs (string lights above bed)
    ctx.fillStyle = "#ff4081";
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(roomX + 120 + i*20, roomY + 220, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw curtains (left and right of window)
    ctx.fillStyle = "#aab7b8";
    ctx.fillRect(roomX + 50, roomY + 100, 30, 120); // Left curtain
    ctx.fillRect(roomX + 620, roomY + 100, 30, 120); // Right curtain

    // Draw desk (next to bed)
    ctx.fillStyle = "#d9b38c";
    ctx.fillRect(roomX + 100, roomY + 180, 70, 60); // Desk top
    ctx.fillRect(roomX + 110, roomY + 240, 15, 40); // Leg
    ctx.fillRect(roomX + 150, roomY + 240, 15, 40); // Leg

    // Draw plant (on desk)
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.ellipse(roomX + 135, roomY + 175, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8BC34A";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(roomX + 135, roomY + 155 + i*5, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw poster (on wall)
    ctx.fillStyle = "#FFC107";
    ctx.fillRect(roomX + 550, roomY + 100, 50, 70);
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText("Arcade", roomX + 555, roomY + 135);
}

// Draw hallway (placeholder)
function drawHallway() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d9d9d9";
    ctx.fillRect(50, 50, 700, 500);
    ctx.strokeStyle = "#8b4513";
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 50, 700, 500);
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.fillText("Hallway", 350, 300);
}

// Draw player (black square with red cap)
function drawPlayer() {
    // Body
    ctx.fillStyle = "#000";
    ctx.fillRect(playerX, playerY, playerW, playerH);
    // Cap
    ctx.fillStyle = "#f00";
    ctx.fillRect(playerX, playerY - 5, playerW, 5);
}

// Draw fade overlay
function drawFade() {
    if (isFading) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        fadeAlpha += 0.02;
        if (fadeAlpha >= 1) {
            fadeAlpha = 0;
            isFading = false;
            currentScene = nextScene;
            sceneSwitch = true;
        }
    }
}

// Handle player movement and boundaries
function updatePlayer() {
    if (keys.ArrowUp) playerY -= playerSpeed;
    if (keys.ArrowDown) playerY += playerSpeed;
    if (keys.ArrowLeft) playerX -= playerSpeed;
    if (keys.ArrowRight) playerX += playerSpeed;

    // Keep player inside the room
    if (currentScene === "bedroom") {
        if (playerX < roomX) playerX = roomX;
        if (playerX + playerW > roomX + roomW) playerX = roomX + roomW - playerW;
        if (playerY < roomY) playerY = roomY;
        if (playerY + playerH > roomY + roomH) playerY = roomY + roomH - playerH;
    }
}

// Check for door exit
function checkExits() {
    if (currentScene === "bedroom") {
        // Check if player is at the door
        if (playerX + playerW/2 > roomX + 340 && playerX + playerW/2 < roomX + 400 &&
            playerY + playerH > roomY + 420 && playerY + playerH < roomY + 500) {
            isFading = true;
            nextScene = "hallway";
        }
    }
}

// Main game loop
function gameLoop() {
    // Clear the canvas (not strictly needed due to room draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current scene
    if (currentScene === "bedroom") {
        drawBedroom();
    } else if (currentScene === "hallway") {
        if (sceneSwitch) {
            // Reset player position for hallway
            playerX = 400;
            playerY = 150;
            sceneSwitch = false;
        }
        drawHallway();
    }

    // Draw player
    drawPlayer();

    // Update player position and check boundaries
    updatePlayer();

    // Check for door exit
    checkExits();

    // Draw fade overlay if fading
    drawFade();

    requestAnimationFrame(gameLoop);
}

// Keyboard input
window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
});

// Start the game
gameLoop();
