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

        cy.get('input[type="date"]').type(eventDate);
        cy.get('input[name="title"]').type(eventTitle);
        cy.contains('+ Termin hinzufügen').click();

        cy.contains(eventTitle).should('exist');
    });
});
