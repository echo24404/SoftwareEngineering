/**
 * @file calendar-flow.cy.js
 * @description
 * End-to-End test for the WGM8 calendar app using Cypress.
 * Simulates a user creating a calendar, adding an event, and verifying that it is displayed correctly.
 */

describe('Calendar App E2E Flow', () => {
    const calendarName = 'Testkalender E2E';
    const eventTitle = 'WG-Putzplan';
    const eventDate = '2025-04-01';

    it('creates a new calendar and adds an event', () => {
        // Navigate to the user selection page
        cy.visit('http://localhost:3000/select-users');

        // Fill in calendar name and select one user to share with
        cy.get('input[name="name"]').type(calendarName);
        cy.get('input[type="checkbox"]').first().check();

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Calendar list page: verify calendar was created and is listed
        cy.contains(calendarName).should('exist');

        // Navigate to the calendar
        cy.contains(calendarName).click();

        // Fill in and submit a new event
        cy.get('input[type="date"]').type(eventDate);
        cy.get('input[name="title"]').type(eventTitle);
        cy.contains('+ Termin hinzufügen').click();

        // Verify the event appears in the calendar view
        cy.contains(eventTitle).should('exist');
    });
});
