const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');
const hexSizeInput = document.getElementById('hexSize');
const hexColorInput = document.getElementById('hexColor');
const sizeValue = document.getElementById('sizeValue');
const imageUpload = document.getElementById('imageUpload');
const imageScaleInput = document.getElementById('imageScale');
const scaleValue = document.getElementById('scaleValue');

let hexSize = parseInt(hexSizeInput.value);
let hexColor = hexColorInput.value;
let imageScale = parseFloat(imageScaleInput.value);
let image = new Image();
let imageLoaded = false;

// Convert axial coordinates to pixel coordinates
function axialToPixel(q, r) {
    const x = hexSize * Math.sqrt(3) * (q + r / 2) + canvas.width / 2;
    const y = hexSize * 3 / 2 * r + canvas.height / 2;
    return { x, y };
}

// Draw a hexagon and clip the image to this shape
function drawHexagon(x, y, size, color) {
    const hex = [];
    for (let i = 0; i < 6; i++) {
        hex.push({
            x: x + size * Math.cos(Math.PI / 3 * i),
            y: y + size * Math.sin(Math.PI / 3 * i)
        });
    }

    ctx.beginPath();
    ctx.moveTo(hex[0].x, hex[0].y);
    for (let i = 1; i < 6; i++) {
        ctx.lineTo(hex[i].x, hex[i].y);
    }
    ctx.closePath();
    
    // Clip to hexagon shape
    ctx.clip();
    
    // Draw the image inside the clipped hexagon
    const imgX = x - (size * imageScale);
    const imgY = y - (size * imageScale);
    const imgSize = size * 2 * imageScale; // Adjust image size based on scale
    if (imageLoaded) {
        ctx.drawImage(image, imgX, imgY, imgSize, imgSize);
    }
    
    // Reset clip region
    ctx.restore();
    
    // Draw the hexagon border
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

// Update the canvas with the current hexagon size, color, image, and scale
function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { x, y } = axialToPixel(0, 0); // Center the hexagon
    
    // Save the context state before clipping
    ctx.save();
    
    drawHexagon(x, y, hexSize, hexColor);
}

// Handle image file input
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.onload = function() {
                imageLoaded = true;
                updateCanvas();
            };
        };
        reader.readAsDataURL(file);
    }
});

// Event listeners for the controls
hexSizeInput.addEventListener('input', function() {
    hexSize = parseInt(this.value);
    sizeValue.textContent = hexSize;
    updateCanvas();
});

hexColorInput.addEventListener('input', function() {
    hexColor = this.value;
    updateCanvas();
});

imageScaleInput.addEventListener('input', function() {
    imageScale = parseFloat(this.value);
    scaleValue.textContent = imageScale;
    updateCanvas();
});

// Initial draw
updateCanvas();
