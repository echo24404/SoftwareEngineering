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

    // Append image file to FormData
    formData.append('image', signupData.image);

    // Append JSON data as a string
    formData.append('data', JSON.stringify({
        username: signupData.username,
        password: signupData.password,
    }));

    try {
        const response = await fetch("/api/register/", {
            method: "POST",
            body: formData
        });

        await response.json();

        if (response.ok) {
            window.location.href = '/recipes';
        } else {
            showAlert("Der Benutzer konnte nicht angelegt werden. Der Benutzername existiert bereits oder die Daten konnten nicht verarbeitet werden.");
        }
    } catch (error) {
        console.error("Error by sending the data:", error);
    }
}