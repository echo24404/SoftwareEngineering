describe("Signup Page Tests", () => {
    beforeEach(() => {
        cy.visit("/signup"); // Gehe zur Signup-Seite
    });

    it("should display the signup form", () => {
        cy.get("form").should("exist"); // Prüft, ob das Formular existiert
    });

    it("should allow user to enter credentials", () => {
        cy.get("input[name='username']").type("TestUser");
        cy.get("input[name='password']").type("SecurePassword123!");
        cy.get("input[type='file']").attachFile("test-image.png"); // Falls es ein Bild gibt

        cy.get("button[type='submit']").click();

        cy.url().should("include", "/tasks"); // Nach der Registrierung sollte die Seite weiterleiten
    });

    it("should show an error for an existing user", () => {
        cy.get("input[name='username']").type("ExistingUser");
        cy.get("input[name='password']").type("Password123!");
        cy.get("button[type='submit']").click();

        cy.contains("User with this name already exists."); // Prüft, ob die Fehlermeldung erscheint
    });

    it("should show an error for missing credentials", () => {
        cy.get("button[type='submit']").click();
        cy.contains("Please enter a username and password");
    });
});

