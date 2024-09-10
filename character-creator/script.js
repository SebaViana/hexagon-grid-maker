document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("character-form");
    const output = document.getElementById("character-output");
    const imagePreview = document.getElementById("image-preview");
    const imageInput = document.getElementById("image");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar que la página se recargue

        // Obtener los valores del formulario
        const name = document.getElementById("name").value;
        const race = document.getElementById("race").value; // Obtener el valor de raza
        const characterClass = document.getElementById("class").value;
        const strength = document.getElementById("strength").value;
        const dexterity = document.getElementById("dexterity").value;
        const intelligence = document.getElementById("intelligence").value;
        const luck = document.getElementById("luck").value; // Obtener el valor de suerte
        const health = document.getElementById("health").value; // Obtener el valor de salud
        const imageFile = imageInput.files[0];

        // Crear un objeto del personaje
        const character = {
            name: name, // Incluir nombre en el objeto
            race: race, // Incluir raza en el objeto
            class: characterClass,
            attributes: {
                strength: strength,
                dexterity: dexterity,
                intelligence: intelligence,
                luck: luck, // Incluir suerte en el objeto
                health: health // Incluir salud en el objeto
            }
        };

        // Mostrar la información del personaje
        output.textContent = JSON.stringify(character, null, 2);
    });

    imageInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    // Validar las dimensiones de la imagen
                    if (img.width === 300 && img.height === 400) {
                        // Mostrar la imagen si tiene las dimensiones correctas
                        const imgElement = document.createElement("img");
                        imgElement.src = e.target.result;
                        imgElement.alt = "Vista previa de la imagen";
                        imgElement.style.maxWidth = "100%"; // Limitar el tamaño de la imagen
                        imgElement.style.height = "auto"; // Mantener la proporción de la imagen
                        imagePreview.innerHTML = ''; // Limpiar la vista previa anterior
                        imagePreview.appendChild(imgElement);
                    } else {
                        // Mostrar mensaje de error si las dimensiones son incorrectas
                        imagePreview.innerHTML = `<p style="color: red;">Error: La imagen debe tener una resolución de 300x400 píxeles. La imagen seleccionada tiene ${img.width}x${img.height} píxeles.</p>`;
                    }
                };

                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = ''; // Limpiar la vista previa si no hay imagen
        }
    });
});
