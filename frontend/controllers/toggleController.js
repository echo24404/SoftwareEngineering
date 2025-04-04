const PASS_VISIBLE = "/assets/img/auth/iconPasswordVisible.png";
const PASS_HIDDEN = "/assets/img/auth/iconPasswordHidden.png";

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