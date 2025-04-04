/**
 * @description Sends user data to the server to create a new user.
 * @async
 * @param {Object} signupData The user data to be sent to the server.
 * @returns {Promise<void>} A promise that resolves when the request completes.
 */
async function sendSignupData(signupData) {
    if (signupData == null) {
        return;
    }

    const formData = new FormData();

    formData.append('image', signupData.image);

    formData.append('data', JSON.stringify({
        username: signupData.username,
        password: signupData.password,
    }));

    try {
        const response = await fetch("/api/tasks/", {
            method: "POST",
            body: formData
        });

        await response.json();

        if (response.ok) {
            if (window.location) {
                window.location.href = '/tasks';
            }
        } else {
            showAlert("Der Benutzer konnte nicht angelegt werden. Der Benutzername existiert bereits oder die Daten konnten nicht verarbeitet werden.");
        }
    } catch (error) {
        console.error("Error by sending the data:", error);
    }
}

module.exports = sendSignupData;
