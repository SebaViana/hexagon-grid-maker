const canvas = document.getElementById("hexCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Hexagon size and grid dimensions
const hexSize = 40;
let idCounter = 0; // To generate unique IDs
let hexGrid = [];  // Store placed hexagons

// Initial offset for panning (to start at the center of the canvas)
let offsetX = canvas.width / 2;
let offsetY = canvas.height / 2;

// Variables to track panning state
let isDragging = false;
let startDragX, startDragY;

// Axial to pixel coordinates conversion (with offset for panning)
function axialToPixel(q, r) {
    const x = hexSize * Math.sqrt(3) * (q + r / 2) + offsetX;
    const y = hexSize * 3 / 2 * r + offsetY;
    return { x, y };
}

// Draw a single pointy-topped hexagon
function drawHexagon(x, y, size, id) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        // Adjust the angle to rotate hexagons for pointy-top
        const angle = Math.PI / 180 * (60 * i - 30);  // Subtract 30 degrees to rotate
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

let selectedHex = null; // Track the currently selected hexagon

// Function to check if a point is inside a hexagon
function isPointInHexagon(x, y, hexX, hexY, size) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);  // Same rotation for pointy-top
        points.push({
            x: hexX + size * Math.cos(angle),
            y: hexY + size * Math.sin(angle)
        });
    }

    // Check if the point (x, y) is inside the polygon formed by the hexagon's vertices
    let inside = false;
    for (let i = 0, j = 5; i < 6; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
                          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

// Place a new hexagon in the grid
function placeHex(q, r) {
    const { x, y } = axialToPixel(q, r);
    const hex = { id: idCounter++, q: q, r: r, x: x, y: y };
    hexGrid.push(hex); // Add the hex to the grid
    drawHexagon(x, y, hexSize, hex.id);
    
    // After placing, update the information of the currently selected hex if it exists
    if (selectedHex) {
        displayNeighbors(selectedHex);
    }
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
        return isPointInHexagon(x, y, hex.x, hex.y, hexSize);  // Use point-in-hexagon test
    });
    
    if (clickedHex) {
        // If an existing hex is clicked, set it as the selected hex and show its neighbors
        selectedHex = clickedHex;
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

// Function to generate export data
function generateExportData() {
    const exportData = {};
    
    hexGrid.forEach(hex => {
        const neighbors = getNeighbors(hex.q, hex.r);
        const movableNeighbors = neighbors.map(neighbor => {
            const existingHex = findHex(neighbor.q, neighbor.r);
            return existingHex ? existingHex.id : null;
        }).filter(id => id !== null); // Remove nulls
        
        exportData[hex.id] = movableNeighbors;
    });
    
    return exportData;
}

// Function to download the data as a JSON file
function downloadExportData() {
    const data = generateExportData();
    const dataStr = JSON.stringify(data, null, 2); // Pretty-print JSON
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "hexagon_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add event listener to the export button
document.getElementById("exportButton").addEventListener("click", downloadExportData);
