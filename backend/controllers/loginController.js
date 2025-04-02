/**
 * Event listener for submitting the login form.
 * Checks the input values and validates them against stored user data.
 *
 * @param {Event} event - The submit event of the form.
 */
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Retrieve input values
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Check if all fields are filled
    if (username === '' || password === '') {
        showAlert('Bitte fülle alle Pflichtfelder aus!');
        return;
    }

    const loginData = {
        username: username,
        password: password,
    };

    await requestUser(loginData);
});