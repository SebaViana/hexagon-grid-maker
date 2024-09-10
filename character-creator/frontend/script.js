document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("character-form");
    const output = document.getElementById("character-output");
    const imagePreview = document.getElementById("image-preview");
    const imageInput = document.getElementById("image");


    // Make sure no default form action happens
    form.onsubmit = function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Only submit if certain conditions are met
        if (form.checkValidity()) {
            // Create FormData object from the form
            const formData = new FormData(form);

            // Make POST request to backend
            fetch('http://localhost:3000/characters', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response received:", data);
                output.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error:', error);
                output.textContent = 'Error submitting form. Check the console for details.';
            });
        } else {
            output.textContent = 'Please fill out all required fields.';
        }
    };

    imageInput.addEventListener("change", function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = new Image();

                img.onload = function() {
                    // Validate image dimensions
                    if (img.width === 300 && img.height === 400) {
                        // Display the image if it has correct dimensions
                        const imgElement = document.createElement("img");
                        imgElement.src = e.target.result;
                        imgElement.alt = "Vista previa de la imagen";
                        imgElement.style.maxWidth = "100%"; // Limit image size
                        imgElement.style.height = "auto"; // Maintain image aspect ratio
                        imagePreview.innerHTML = ''; // Clear previous preview
                        imagePreview.appendChild(imgElement);
                    } else {
                        // Display error message if dimensions are incorrect
                        imagePreview.innerHTML = `<p style="color: red;">Error: La imagen debe tener una resolución de 300x400 píxeles. La imagen seleccionada tiene ${img.width}x${img.height} píxeles.</p>`;
                    }
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = ''; // Clear preview if no image
        }
    });
});

