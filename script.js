const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state
let currentScene = "bedroom";
let playerX = 400;
let playerY = 300;
let playerW = 20;
let playerH = 20;
let playerSpeed = 3;
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, e: false };

let currentText = "";
let currentSpeaker = "";
let textBoxVisible = false;
let textBoxTimer = 0;
const textBoxMessages = [
    "This door is locked.",
    "I don't need to go in here!",
    "Let's go downstairs!",
    "There's nothing in there for me.",
    "Let's go the other way! Downstairs!"
];

let roomExits = {
    bedroom: { x: 400, y: 450, w: 50, h: 30, to: "hallway" },
    hallway: { x: 400, y: 100, w: 50, h: 30, to: "bedroom" }
};
let hallwayDoors = [
    { x: 200, y: 300, w: 40, h: 70, room: "kitchen" },
    { x: 300, y: 300, w: 40, h: 70, room: "living_room" },
    { x: 400, y: 300, w: 40, h: 70, room: "dining_room" },
    { x: 500, y: 300, w: 40, h: 70, room: "gaming_room" },
    { x: 600, y: 300, w: 40, h: 70, room: "parents_room" }
];
let downstairsExit = { x: 700, y: 500, w: 70, h: 30, to: "kitchen" };

// Furniture for bedroom
const bedroomFurniture = [
    { type: "bed", x: 200, y: 150, w: 150, h: 70 },
    { type: "shelf", x: 550, y: 180, w: 40, h: 100 },
    { type: "door", x: 375, y: 450, w: 50, h: 30 },
    { type: "rug", x: 300, y: 350, w: 200, h: 80 },
    { type: "tv", x: 350, y: 100, w: 50, h: 30 },
    { type: "leds", x: 200, y: 80, w: 150, h: 10 }
];

// Draw a text bubble above a position
function drawTextBubble(x, y, speaker, text) {
    const bubblePadding = 10;
    const bubbleMargin = 5;
    const textX = x;
    const textY = y - 40;
    ctx.font = "16px Arial";
    const textWidth = ctx.measureText(text).width;
    const bubbleWidth = textWidth + bubblePadding * 2;
    const bubbleHeight = 40;
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = textY - bubbleHeight + 10;

    // Bubble
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Speaker name
    ctx.fillStyle = "#444";
    ctx.font = "bold 14px Arial";
    ctx.fillText(speaker, bubbleX + bubblePadding, bubbleY + 20);

    // Text
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(text, bubbleX + bubblePadding, bubbleY + 40);
}

// Draw bedroom
function drawBedroom() {
    ctx.fillStyle = "#e6f2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw furniture
    bedroomFurniture.forEach(item => {
        ctx.fillStyle = "#b3c6e0";
        if (item.type === "bed") ctx.fillStyle = "#a67c52";
        if (item.type === "rug") ctx.fillStyle = "#b87333";
        if (item.type === "tv") ctx.fillStyle = "#222";
        if (item.type === "leds") ctx.fillStyle = "#ff4081";
        ctx.fillRect(item.x, item.y, item.w, item.h);
    });

    // Draw door
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(roomExits.bedroom.x, roomExits.bedroom.y, roomExits.bedroom.w, roomExits.bedroom.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(roomExits.bedroom.x + 35, roomExits.bedroom.y + 5, 10, 20);
}

// Draw hallway
function drawHallway() {
    ctx.fillStyle = "#d9d9d9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw doors
    hallwayDoors.forEach(door => {
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(door.x, door.y, door.w, door.h);
        ctx.fillStyle = "#fff";
        ctx.fillRect(door.x + 30, door.y + 25, 5, 20);
    });

    // Draw downstairs exit
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(downstairsExit.x, downstairsExit.y, downstairsExit.w, downstairsExit.h);
    ctx.fillStyle = "#fff";
    ctx.fillText("Downstairs", downstairsExit.x + 10, downstairsExit.y + 20);
}

// Draw kitchen
function drawKitchen() {
    ctx.fillStyle = "#fff8e1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mom by sink
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(300, 200, 40, 80); // Mom
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(350, 280, 80, 30); // Sink

    if (textBoxVisible) {
        drawTextBubble(320, 180, "Mom", currentText);
    }
}

// Draw living room
function drawLivingRoom() {
    ctx.fillStyle = "#e8f5e9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cousins
    ctx.fillStyle = "#81c784";
    ctx.fillRect(200, 250, 30, 60); // Cousin 1
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(250, 230, 30, 60); // Cousin 2

    if (textBoxVisible) {
        drawTextBubble(230, 220, "Cousin", currentText);
    }
}

// Draw other rooms (placeholder)
function drawOtherRoom(roomName) {
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.fillText(roomName, 350, 300);
}

// Draw player (black square with red cap)
function drawPlayer() {
    ctx.fillStyle = "#000";
    ctx.fillRect(playerX, playerY, playerW, playerH);
    ctx.fillStyle = "#f00";
    ctx.fillRect(playerX, playerY - 5, playerW, 5);
}

// Check if player is at an exit
function checkExits() {
    if (currentScene === "bedroom") {
        if (playerX > roomExits.bedroom.x && playerX < roomExits.bedroom.x + roomExits.bedroom.w &&
            playerY > roomExits.bedroom.y && playerY < roomExits.bedroom.y + roomExits.bedroom.h) {
            currentScene = "hallway";
            playerX = 400;
            playerY = 150;
        }
    } else if (currentScene === "hallway") {
        if (playerX > roomExits.hallway.x && playerX < roomExits.hallway.x + roomExits.hallway.w &&
            playerY > roomExits.hallway.y && playerY < roomExits.hallway.y + roomExits.hallway.h) {
            currentScene = "bedroom";
            playerX = 400;
            playerY = 400;
        }
        // Check hallway doors
        hallwayDoors.forEach(door => {
            if (playerX > door.x && playerX < door.x + door.w &&
                playerY > door.y && playerY < door.y + door.h) {
                if (door.room === "parents_room") {
                    showRandomTextBox("You", "This door is locked.");
                } else if (keys.e) {
                    showRandomTextBox("You", textBoxMessages[Math.floor(Math.random() * textBoxMessages.length)]);
                }
            }
        });
        // Check downstairs exit
        if (playerX > downstairsExit.x && playerX < downstairsExit.x + downstairsExit.w &&
            playerY > downstairsExit.y && playerY < downstairsExit.y + downstairsExit.h) {
            currentScene = "kitchen";
            playerX = 320;
            playerY = 280;
        }
    } else if (currentScene === "kitchen") {
        if (keys.e && playerX > 290 && playerX < 350 && playerY > 180 && playerY < 280) {
            showTextBox("Mom", "Have fun, and be home before dark!");
        }
    } else if (currentScene === "living_room") {
        if (keys.e && (
            (playerX > 190 && playerX < 230 && playerY > 240 && playerY < 310) ||
            (playerX > 240 && playerX < 280 && playerY > 220 && playerY < 290)
        )) {
            showTextBox("Cousin", "Let's go to the arcade!");
        }
    }
}

// Show a random text box
function showRandomTextBox(speaker, overrideText) {
    currentSpeaker = speaker;
    currentText = overrideText || textBoxMessages[Math.floor(Math.random() * textBoxMessages.length)];
    textBoxVisible = true;
    textBoxTimer = 0;
}

// Show a text box
function showTextBox(speaker, text) {
    currentSpeaker = speaker;
    currentText = text;
    textBoxVisible = true;
    textBoxTimer = 0;
}

// Main game loop
function gameLoop() {
    // Handle movement
    if (keys.ArrowUp) playerY -= playerSpeed;
    if (keys.ArrowDown) playerY += playerSpeed;
    if (keys.ArrowLeft) playerX -= playerSpeed;
    if (keys.ArrowRight) playerX += playerSpeed;

    // Boundaries
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerW) playerX = canvas.width - playerW;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - playerH) playerY = canvas.height - playerH;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current scene
    if (currentScene === "bedroom") drawBedroom();
    else if (currentScene === "hallway") drawHallway();
    else if (currentScene === "kitchen") drawKitchen();
    else if (currentScene === "living_room") drawLivingRoom();
    else drawOtherRoom(currentScene);

    // Draw player
    drawPlayer();

    // Check for exits and interactions
    checkExits();

    // Draw text box if visible
    if (textBoxVisible) {
        if (currentScene === "kitchen") {
            drawTextBubble(320, 180, currentSpeaker, currentText);
        } else if (currentScene === "living_room") {
            drawTextBubble(230, 220, currentSpeaker, currentText);
        } else {
            drawTextBubble(playerX + playerW/2, playerY, currentSpeaker, currentText);
        }
        textBoxTimer++;
        if (textBoxTimer > 120) { // 2 seconds at 60fps
            textBoxVisible = false;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Keyboard input
window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
    if (e.key === "e") keys.e = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
    if (e.key === "e") keys.e = false;
});

// Start the game
gameLoop();
