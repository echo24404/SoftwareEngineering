describe('Login Page', () => {
    const validUser = {
        username: 'testuser',
        password: 'securepassword123'
    };

    const invalidUser = {
        username: 'wronguser',
        password: 'wrongpassword'
    };

    beforeEach(() => {
        cy.visit('/login');
    });

    it('should render the login form', () => {
        cy.get('#login-username').should('exist');
        cy.get('#login-password').should('exist');
    });

    it('should show error when fields are empty', () => {
        cy.get('#login-form').submit();
        cy.contains('Bitte fülle alle Pflichtfelder aus!').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
        cy.get('#login-username').type(invalidUser.username);
        cy.get('#login-password').type(invalidUser.password);
        cy.get('#login-form').submit();
        cy.contains('Die Zugangsdaten sind nicht gültig.').should('be.visible');
    });

    it('should login successfully and redirect', () => {
        cy.get('#login-username').type(validUser.username);
        cy.get('#login-password').type(validUser.password);
        cy.get('#login-form').submit();


        cy.url().should('include', '/');
    });
});
