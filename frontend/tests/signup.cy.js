describe('Signup Page Tests', () => {
    beforeEach(() => {
        cy.visit('/signup');
    });

    it('should display password strength feedback', () => {
        cy.get('#signup-password').type('Weak1');
        cy.get('#password-strength').should('contain', 'ein Sonderzeichen');

        cy.get('#signup-password').clear().type('StrongP@ss1');
        cy.get('#password-strength').should('contain', 'Starkes Passwort!');
    });

    it('should show error when passwords do not match', () => {
        cy.get('#username').type('testuser');
        cy.get('#signup-password').type('StrongP@ss1');
        cy.get('#confirm-password').type('DifferentPass!');
        cy.get('#signup-form').submit();
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Die eingegebenen Passwörter stimmen nicht überein!');
        });
    });

    it('should successfully submit the form', () => {
        cy.get('#username').type('testuser');
        cy.get('#signup-password').type('StrongP@ss1');
        cy.get('#confirm-password').type('StrongP@ss1');
        cy.get('#signup-form').submit();
        cy.url().should('include', '/login');
    });
});
