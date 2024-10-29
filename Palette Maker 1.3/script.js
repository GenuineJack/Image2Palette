const imageUpload = document.getElementById('image-upload');
const shuffleColorsButton = document.getElementById('shuffle-colors');
const saveImageButton = document.getElementById('save-image');
const imagePreview = document.getElementById('image-preview');
const colorPaletteContainer = document.getElementById('color-palette');
const finalCanvas = document.getElementById('final-canvas');
const resultContainer = document.getElementById('result');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

const ctx = finalCanvas.getContext('2d');
const logoUrl = 'https://images.squarespace-cdn.com/content/v1/658488e71ebc22517acdad54/d971cfa2-73cf-4357-bb0d-a50098b2b7df/FINE-ART-BC-LOGO.jpg';

let colorThief = new ColorThief();
let uploadedImageSrc = '';
let currentColors = [];

// Handle image upload and initial palette generation
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImageSrc = e.target.result;
            imagePreview.src = uploadedImageSrc;
            imagePreview.style.display = 'block';
            generateNewPalette();
            resultContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Function to generate a new palette
function generateNewPalette() {
    const tempImage = new Image();
    tempImage.src = uploadedImageSrc;
    tempImage.onload = function() {
        const allColors = colorThief.getPalette(tempImage, 20);
        
        // Randomly select 5 unique colors
        const selectedColors = [];
        const usedIndexes = new Set();
        
        while (selectedColors.length < 5 && usedIndexes.size < allColors.length) {
            const randomIndex = Math.floor(Math.random() * allColors.length);
            if (!usedIndexes.has(randomIndex)) {
                usedIndexes.add(randomIndex);
                selectedColors.push(allColors[randomIndex]);
            }
        }
        
        currentColors = selectedColors;
        displayColors(currentColors);
    };
}

// Shuffle Colors button handler
shuffleColorsButton.addEventListener('click', generateNewPalette);

// Display colors with modern styling
function displayColors(colors) {
    colorPaletteContainer.innerHTML = '';

    colors.forEach(color => {
        const colorBlockContainer = document.createElement('div');
        colorBlockContainer.classList.add('color-block-container');

        const hexColor = rgbToHex(color[0], color[1], color[2]);
        
        colorBlockContainer.innerHTML = `
            <div class="color-block" style="background-color: ${hexColor}"></div>
            <div class="hex-code">${hexColor.toUpperCase()}</div>
            <button class="copy-btn">
                <i class="fas fa-copy"></i>
                Copy
            </button>
        `;

        // Add click handlers for copying
        const copyElements = [
            colorBlockContainer.querySelector('.color-block'),
            colorBlockContainer.querySelector('.hex-code'),
            colorBlockContainer.querySelector('.copy-btn')
        ];

        copyElements.forEach(element => {
            element.addEventListener('click', () => {
                copyToClipboard(hexColor.toUpperCase());
            });
        });

        colorPaletteContainer.appendChild(colorBlockContainer);
    });
}

// Helper function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// Copy to clipboard with toast notification
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${text} to clipboard`);
    });
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Save image functionality
saveImageButton.addEventListener('click', () => {
    finalCanvas.width = 1080;
    finalCanvas.height = 1080;

    // Fill canvas with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw the uploaded image
    const image = new Image();
    image.src = uploadedImageSrc;
    image.onload = function() {
        const maxImageWidth = finalCanvas.width - 40;
        const maxImageHeight = finalCanvas.height - 200;
        const imageAspectRatio = image.naturalWidth / image.naturalHeight;

        let resizedImageWidth, resizedImageHeight;
        if (image.naturalWidth > image.naturalHeight) {
            resizedImageWidth = Math.min(maxImageWidth, image.naturalWidth);
            resizedImageHeight = resizedImageWidth / imageAspectRatio;
        } else {
            resizedImageHeight = Math.min(maxImageHeight, image.naturalHeight);
            resizedImageWidth = resizedImageHeight * imageAspectRatio;
        }

        const imageX = (finalCanvas.width - resizedImageWidth) / 2;
        const imageY = 20;
        ctx.drawImage(image, imageX, imageY, resizedImageWidth, resizedImageHeight);

        // Draw the color palette
        const paletteY = imageY + resizedImageHeight + 25;
        currentColors.forEach((color, index) => {
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            const colorX = imageX + index * 110;
            ctx.fillRect(colorX, paletteY, 100, 100);

            const hexCode = rgbToHex(color[0], color[1], color[2]);
            ctx.fillStyle = "#000000";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(hexCode.toUpperCase(), colorX + 50, paletteY + 55);
        });

        // Draw the logo
        const logo = new Image();
        logo.src = logoUrl;
        logo.crossOrigin = "Anonymous";
        logo.onload = function() {
            const logoWidth = 200;
            const logoHeight = logo.height * (logoWidth / logo.width);
            const logoX = finalCanvas.width - logoWidth - 20;
            const logoY = paletteY + 100 - logoHeight;
            ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

            // Save the final image
            saveCanvasAsImage();
        };
    };
});

// Save the canvas content as a PNG
function saveCanvasAsImage() {
    const link = document.createElement('a');
    link.download = 'image_with_palette_and_logo.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
}

// Reset app when clicking logo
document.getElementById('logo').addEventListener('click', () => {
    imagePreview.style.display = 'none';
    resultContainer.style.display = 'none';
    colorPaletteContainer.innerHTML = '';
    imageUpload.value = '';
});