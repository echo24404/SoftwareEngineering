
/**
 * Listens for input in the password field and evaluates password strength.
 */
document.getElementById('signup-password').addEventListener('input', function () {
    const password = this.value;
    const strengthIndicator = document.getElementById('password-strength');

    // password info
    let message = "<span>Ein starkes Passwort muss folgendes beinhalten:</span><br>";

    // strange password criteria
    const criteria = [
        { regex: /.{8,}/, message: "mindestens 8 Zeichen" },
        { regex: /[A-Z]/, message: "ein Großbuchstabe (A-Z)" },
        { regex: /[a-z]/, message: "ein Kleinbuchstabe (a-z)" },
        { regex: /\d/, message: "eine Zahl (0-9)" },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "ein Sonderzeichen (!@#$%^&*)" }
    ];

    const remainingCriteria = criteria
        .filter(rule => !rule.regex.test(password))
        .map(rule => `<li>${rule.message}</li>`);

    if (remainingCriteria.length === 0) {
        strengthIndicator.innerHTML = `<p class="strong-password"> Starkes Passwort!</p>`;
    } else {
        strengthIndicator.innerHTML = `
        <p class="strengthIndicator-message">${message}</p>
        <ul class="remaining-criteria">
            ${remainingCriteria.join("")}
        </ul>
        `;
    }
});

/**
 * Checks if the password meets all strength criteria.
 * @param {string} password - The entered password.
 * @returns {boolean} - Returns true if the password meets all criteria, otherwise false.
 */
function isPasswordStrong(password) {
    const criteria = [
        /.{8,}/, // At least 8 characters
        /[A-Z]/, // At least one uppercase letter
        /[a-z]/, // At least one lowercase letter
        /\d/, // At least one digit
        /[!@#$%^&*(),.?":{}|<>]/ // At least one special character
    ];

    return criteria.every(regex => regex.test(password));
}

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

const PASS_VISIBLE = "/frontend/public/img/auth/iconPasswordVisible.png";
const PASS_HIDDEN = "/frontend/public/img/auth/iconPasswordHidden.png";

/**
 * @description Toggles the visibility of specific elements based on the input ID and associated icon.
 *              It checks if the input ID is related to password visibility or the search filter.
 * @param {string} inputId - The ID of the input element (e.g., password fields or search bar).
 */
function toggleVisibility(inputId) {
    const icon = document.querySelector('.toggle-item img');

    if (inputId === 'signup-password' || inputId === 'confirm-password' || inputId === 'login-password') {
        setPasswordVisibility(inputId, icon);
    }
}

/**
 * @description Toggles the visibility of a password field. Changes the input type between 'password' and 'text'.
 *              Also updates the visibility icon to reflect the current state of the password field.
 * @param {string} inputId - The ID of the input element (e.g., 'signup-password').
 * @param {HTMLElement} icon - The icon element whose `src` will be updated based on the password visibility.
 */
function setPasswordVisibility(inputId, icon) {
    const element = document.getElementById(inputId);

    if (element.type === 'password') {
        element.type = 'text';
        icon.src = PASS_VISIBLE;
    } else {
        element.type = 'password';
        icon.src = PASS_HIDDEN;
    }
}

window.toggleVisibility = toggleVisibility;