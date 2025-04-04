
// Überprüfen, ob `document` definiert ist (was darauf hinweist, dass der Code im Browser läuft)
if (typeof document !== "undefined") {
    // Hier wird der Event-Listener hinzugefügt
    document.getElementById('signup-password').addEventListener('input', function () {
        const password = this.value;
        const strengthIndicator = document.getElementById('password-strength');

        let message = "<span>Ein starkes Passwort muss folgendes beinhalten:</span><br>";

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
}

function isPasswordStrong(password) {
    const criteria = [
        /.{8,}/, // Mindestens 8 Zeichen
        /[A-Z]/, // Mindestens ein Großbuchstabe
        /[a-z]/, // Mindestens ein Kleinbuchstabe
        /\d/, // Mindestens eine Zahl
        /[!@#$%^&*(),.?":{}|<>]/ // Mindestens ein Sonderzeichen
    ];

    return criteria.every(regex => regex.test(password));
}

// Event-Listener für das Formular-Submit
if (typeof document !== "undefined") {
    document.getElementById('signup-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (username === '' || password === '' || confirmPassword === '') {
            showAlert('Bitte fülle alle Pflichtfelder aus!');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Die eingegebenen Passwörter stimmen nicht überein!');
            return;
        }

        if (!isPasswordStrong(password)) {
            showAlert('Das eingegebene Passwort entspricht nicht den Sicherheitsanforderungen!');
            return;
        }

        const image = document.getElementById("file-input").files[0];

        const signupData = {
            username: username,
            password: password,
            image: image
        }

        await sendSignupData(signupData);
    });
}