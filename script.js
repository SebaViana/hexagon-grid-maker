const canvas = document.getElementById("hexCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Hexagon size and grid dimensions
const hexSize = 40;
let idCounter = 0; // To generate unique IDs
let hexGrid = [];  // Store placed hexagons

// Offset for panning
let offsetX = 0;
let offsetY = 0;

// Variables to track panning state
let isDragging = false;
let startDragX, startDragY;

// Axial to pixel coordinates conversion (with offset for panning)
function axialToPixel(q, r) {
    const x = hexSize * Math.sqrt(3) * (q + r / 2) + offsetX;
    const y = hexSize * 3 / 2 * r + offsetY;
    return { x, y };
}

// Draw a single hexagon
function drawHexagon(x, y, size, id) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i);
        const x_i = x + size * Math.cos(angle);
        const y_i = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x_i, y_i);
        else ctx.lineTo(x_i, y_i);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Add ID to the center of the hexagon
    ctx.fillStyle = "#000";
    ctx.fillText(id, x - size / 3, y + size / 6);
}

// Place a new hexagon in the grid
function placeHex(q, r) {
    const { x, y } = axialToPixel(q, r);
    const hex = { id: idCounter++, q: q, r: r, x: x, y: y };
    hexGrid.push(hex); // Add the hex to the grid
    drawHexagon(x, y, hexSize, hex.id);
}

// Get neighbors of a hex by axial coordinates
function getNeighbors(q, r) {
    const directions = [
        { q: 1, r: 0 },       // Right
        { q: -1, r: 0 },      // Left
        { q: 0, r: 1 },       // Bottom-right
        { q: 0, r: -1 },      // Top-left
        { q: 1, r: -1 },      // Top-right
        { q: -1, r: 1 },      // Bottom-left
    ];

    return directions.map(dir => {
        const neighborQ = q + dir.q;
        const neighborR = r + dir.r;
        return { q: neighborQ, r: neighborR };
    });
}

// Find if a hex exists at the given axial coordinates
function findHex(q, r) {
    return hexGrid.find(hex => hex.q === q && hex.r === r);
}

// Display selected hex and its movable neighbors (by ID)
function displayNeighbors(hex) {
    const neighborList = document.getElementById("neighborList");
    neighborList.innerHTML = ''; // Clear old list
    
    const selectedLi = document.createElement("li");
    selectedLi.textContent = `Selected Hex ID: ${hex.id}`;
    neighborList.appendChild(selectedLi);

    const neighbors = getNeighbors(hex.q, hex.r);
    neighbors.forEach(neighbor => {
        const existingHex = findHex(neighbor.q, neighbor.r);
        if (existingHex) {
            const li = document.createElement("li");
            li.textContent = `Movable to Hex ID: ${existingHex.id}`;
            neighborList.appendChild(li);
        }
    });
}

// Handle click event on canvas to either select a hex or place a new one
canvas.addEventListener("click", function (event) {
    if (isDragging) return; // Ignore clicks while dragging

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find if the click is on an existing hex
    const clickedHex = hexGrid.find(hex => {
        const dx = x - (hex.x - offsetX);
        const dy = y - (hex.y - offsetY);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < hexSize;
    });
    
    if (clickedHex) {
        // If an existing hex is clicked, show its neighbors
        displayNeighbors(clickedHex);
    } else {
        // Try to place a new hex if clicked in a valid neighboring position
        for (const hex of hexGrid) {
            const neighbors = getNeighbors(hex.q, hex.r);
            for (const neighbor of neighbors) {
                // Check if the neighbor position is empty and the click is within range
                if (!findHex(neighbor.q, neighbor.r)) {
                    const { x: neighborX, y: neighborY } = axialToPixel(neighbor.q, neighbor.r);
                    const dx = x - neighborX;
                    const dy = y - neighborY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < hexSize) {
                        placeHex(neighbor.q, neighbor.r);
                        return;
                    }
                }
            }
        }
    }
});

// Mouse down event to start dragging
canvas.addEventListener("mousedown", function (event) {
    isDragging = true;
    startDragX = event.clientX - offsetX;
    startDragY = event.clientY - offsetY;
});

// Mouse move event to handle dragging
canvas.addEventListener("mousemove", function (event) {
    if (isDragging) {
        offsetX = event.clientX - startDragX;
        offsetY = event.clientY - startDragY;
        redrawHexes();  // Redraw all hexagons with new offsets
    }
});

// Mouse up event to stop dragging
canvas.addEventListener("mouseup", function () {
    isDragging = false;
});

// Redraw all hexagons with updated offsets
function redrawHexes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    hexGrid.forEach(hex => {
        const { x, y } = axialToPixel(hex.q, hex.r);
        drawHexagon(x, y, hexSize, hex.id);
    });
}

// Start with a single hexagon in the center (q = 0, r = 0)
placeHex(0, 0);
