/**
 * Sends a request to retrieve a user by their username and logs in if successful.
 * @param {Object} userData - The login data containing username and password.
 * @returns {Promise<void>} A promise that resolves once the user data has been processed.
 */
async function requestUser(userData) {
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.success) {
                window.location.href = "/index";
            }
        } else {
            showAlert("Die Zugangsdaten sind nicht gültig.")
        }
    } catch (error) {
        console.error("Error by sending the data:", error);
    }
}
