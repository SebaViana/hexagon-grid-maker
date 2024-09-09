const canvas = document.getElementById("hexCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 1024;
canvas.height = 720;

// Hexagon size and grid dimensions
const hexSize = 40;
let idCounter = 0; // To generate unique IDs
let hexGrid = [];  // Store placed hexagons

// Axial to pixel coordinates conversion
function axialToPixel(q, r) {
    const x = hexSize * Math.sqrt(3) * (q + r / 2);
    const y = hexSize * 3 / 2 * r;
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
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find if the click is on an existing hex
    const clickedHex = hexGrid.find(hex => {
        const dx = x - hex.x;
        const dy = y - hex.y;
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

// Start with a single hexagon in the center (q = 0, r = 0)
placeHex(0, 0);
