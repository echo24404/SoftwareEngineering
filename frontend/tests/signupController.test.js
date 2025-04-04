// signupController.test.js

// Simuliere HTML-Elemente
document.body.innerHTML = `
    <form id="signup-form">
        <input type="text" id="username" />
        <input type="password" id="signup-password" />
        <input type="password" id="confirm-password" />
        <input type="file" id="file-input" />
        <div id="password-strength"></div>
    </form>
`;

// Importiere die Controller-Datei, die den Event-Listener enthält
const { isPasswordStrong } = require('../../backend/controllers/signupController');

describe("Passwort-Validierung", () => {
    test("Akzeptiert ein starkes Passwort", () => {
        const passwordInput = document.getElementById('signup-password');
        const passwordStrengthIndicator = document.getElementById('password-strength');

        // Teste ein starkes Passwort
        passwordInput.value = "Strong1@Password";
        passwordInput.dispatchEvent(new Event('input')); // Löst das 'input'-Event aus

        // Überprüfe, ob der Text für ein starkes Passwort angezeigt wird
        expect(passwordStrengthIndicator.innerHTML).toContain("Starkes Passwort!");
    });

    test("Gibt eine Fehlermeldung für ein schwaches Passwort aus", () => {
        const passwordInput = document.getElementById('signup-password');
        const passwordStrengthIndicator = document.getElementById('password-strength');

        // Teste ein schwaches Passwort
        passwordInput.value = "weak";
        passwordInput.dispatchEvent(new Event('input'));

        // Überprüfe, ob das Passwort den Anforderungen nicht entspricht
        expect(passwordStrengthIndicator.innerHTML).toContain("mindestens 8 Zeichen");
    });
});
