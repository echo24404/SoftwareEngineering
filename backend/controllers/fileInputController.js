/**
 * @description Adds an event listener to the profile picture input field to select
 * and display an image preview.
 * @type {Event} The event object that is triggered on file selection.
 * @listens change event on the #fileInput input field.
 */
document.getElementById("file-input").addEventListener("change", function (event) {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const previewPic = document.getElementById("preview-pic");
            previewPic.src = e.target.result;
            previewPic.style.display = "block";
        };
        reader.readAsDataURL(file); // Read the file as a Data URL
    }
});

/**
 * @description Adds an event listener to the file input element that updates the text content
 *              of an element with the class "file-input-name" to display the selected file's name.
 *              If no file is selected, it displays "No file chosen".
 */
document.getElementById("file-input").addEventListener("change", function() {
    document.querySelector(".file-input-name").textContent = this.files.length > 0 ? this.files[0].name : "Keine Datei gewählt";
});