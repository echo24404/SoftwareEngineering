// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

describe('Kalender-App E2E Flow', () => {
    const calendarName = 'Testkalender E2E';
    const eventTitle = 'WG-Putzplan';
    const eventDate = '2025-04-01';

    it('erstellt neuen Kalender und fügt einen Termin hinzu', () => {
        cy.visit('http://localhost:3000/select-users');

        cy.get('input[name="name"]').type(calendarName);

        cy.get('input[type="checkbox"]').first().check();

        cy.get('button[type="submit"]').click();

        cy.contains(calendarName).should('exist');

        cy.contains(calendarName).click();

        // Termin hinzufügen
        cy.get('input[type="date"]').type(eventDate);
        cy.get('input[name="title"]').type(eventTitle);
        cy.contains('+ Termin hinzufügen').click();

        cy.contains(eventTitle).should('exist');
    });
});