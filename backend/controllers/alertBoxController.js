/**
 * Displays a custom alert modal with a message and optional buttons.
 * The alert can have an "OK" button and optionally a "No" or "Cancel" button.
 * Interactions with the rest of the page are disabled while the alert is displayed.
 *
 * @param {string} message - The message to display in the alert.
 * @param {boolean} [showNoButton=false] - Whether to display a "No" or "Cancel" button in addition to the "OK" button.
 * @param {function} [callback=null] - The callback function to execute after the alert is closed. The function receives a boolean indicating whether "OK" (`true`) or "No"/"Cancel" (`false`) was clicked.
 */

function showAlert(message, showNoButton = false, callback = null) {
    // Remove existing alert if present
    let existingAlert = document.getElementById('custom-alert-overlay');
    if (existingAlert) existingAlert.remove();

    // Disable scrolling but keep alert clickable
    document.body.style.overflow = 'hidden';

    // Disable keyboard input
    document.addEventListener('keydown', disableKeyboardInput);

    // Create the alert container (overlay)
    let alertOverlay = document.createElement('div');
    alertOverlay.id = 'custom-alert-overlay';
    alertOverlay.innerHTML = `
        <div class="alert-content">
            <p>${message}</p>
            <button id="ok-btn">${showNoButton ? 'Ja' : 'OK'}</button>
            ${showNoButton ? '<button id="no-btn">Nein</button>' : ''}
        </div>
    `;

    document.body.appendChild(alertOverlay);

    document.getElementById('ok-btn').onclick = function () {
        closeAlert();
        if (callback) callback(true);
    };

    if (showNoButton) {
        document.getElementById('no-btn').onclick = function () {
            closeAlert();
            if (callback) callback(false);
        };
    }
}

/**
 * Closes the custom alert modal by removing the overlay and re-enabling user interactions.
 * Restores scrolling and pointer events after the alert is closed.
 */
function closeAlert() {
    let alertOverlay = document.getElementById('custom-alert-overlay');
    if (alertOverlay) alertOverlay.remove();

    // Re-enable scrolling
    document.body.style.overflow = '';

    // Re-enable keyboard input
    document.removeEventListener('keydown', disableKeyboardInput);
}

/**
 * Prevents all keyboard input by blocking default key actions.
 *
 * @param {KeyboardEvent} event - The keyboard event triggered by a key press.
 */
function disableKeyboardInput(event) {
    event.preventDefault();
}