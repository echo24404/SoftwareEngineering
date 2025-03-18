
/**
 * Event listener for submitting the registration form.
 * Validates inputs, checks the username, and stores data.
 *
 * @param {Event} event - The submit event of the form.
 */
document.getElementById('signup-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Retrieve input values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if all fields are filled
    if (username === '' || password === '' || confirmPassword === '') {
        showAlert('Bitte fülle alle Pflichtfelder aus!');
        return;
    }

    // Check if the password matches the confirmation
    if (password !== confirmPassword) {
        showAlert('Die eingegebenen Passwörter stimmen nicht überein!');
        return;
    }

    // Check if password meets strength requirements
    if (!isPasswordStrong(password)) {
        showAlert('Das eingegebene Passwort entspricht nicht den Sicherheitsanforderungen!');
        return;
    }

    // Load image
    const image = document.getElementById("file-input").files[0];

    const signupData = {
        username: username,
        password: password,
        image: image
    }
});