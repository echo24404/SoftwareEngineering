describe('Shopping List Page', () => {
    // Vor jedem Test wird die Seite besucht
    beforeEach(() => {
        // Passe die URL ggf. an deinen lokalen Server an
        cy.visit('/shoppinglist');
    });

    it('displays the heading "Einkaufsliste"', () => {
        // Prüft, ob die Seite die Überschrift enthält
        cy.contains('h1', 'Einkaufsliste').should('be.visible');
    });

    it('loads categories in the dropdown', () => {
        // Überprüft, ob das Dropdown existiert und die Standardoption enthält
        cy.get('#category-select').should('exist').and('contain', '-- Auswahl --');
    });

    it('creates a new category', () => {
        const newCategory = 'CypressTestCategory';

        // Tippe den neuen Kategorienamen ein und submitte das Formular
        cy.get('#new-category-name').type(newCategory);
        cy.get('#add-category-form').submit();

        // Überprüfe, ob das Dropdown die neue Kategorie enthält
        cy.get('#category-select').find('option').should('contain', newCategory);
    });

    it('deletes an existing category', () => {
        const categoryToDelete = 'CypressTestCategory';

        // Vorausgesetzt, die Kategorie wurde bereits angelegt (z.B. aus dem vorherigen Test)
        cy.get('#category-select').select(categoryToDelete);
        cy.get('#delete-category-btn').click();

        // Bestätige den Löschdialog (Cypress übernimmt standardmäßig den Bestätigungsdialog nicht – hier simulieren wir ihn)
        cy.on('window:confirm', () => true);

        // Überprüfe, dass die Kategorie nicht mehr im Dropdown enthalten ist
        cy.get('#category-select').find('option').should('not.contain', categoryToDelete);
    });

    // Neuer Test: Überprüft, dass die Artikelliste leer bleibt, wenn keine Kategorie ausgewählt ist
    it('shows an empty item list when no category is selected', () => {
        // Stelle sicher, dass keine Kategorie ausgewählt ist
        cy.get('#category-select').select('');
        // Überprüfe, dass das Element mit der ID item-list leer ist
        cy.get('#item-list').should('be.empty');
    });

    it('displays items when a valid category is selected', () => {
        // Wähle die Kategorie "Discounter" – diese muss in deiner JSON vorhanden sein
        cy.get('#category-select').select('Discounter');
        // Warte, bis mindestens ein Listeneintrag (li) in der Artikelliste erscheint
        cy.get('#item-list li').should('have.length.at.least', 1);
        // Überprüfe, ob ein bekannter Artikel ("TK Pizza") in der Liste vorhanden ist
        cy.get('#item-list').contains('TK Pizza').should('exist');
    });

    it('updates the order of items via API', () => {
        // Definiere eine neue Reihenfolge für Items in der Kategorie "Discounter"
        // (Passe die Item-Namen an, wie sie in deiner JSON oder in den Tests vorkommen.)
        const newOrder = ['Brot aus Backtheke', 'TK Pizza'];

        // Sende den PUT-Request an den updateOrder-Endpunkt
        cy.request({
            method: 'PUT',
            url: '/shoppinglist/order',
            body: { category: 'Discounter', newOrder }
        }).then((response) => {
            // Überprüfe, ob die Antwort erfolgreich ist und die neue Reihenfolge zurückgegeben wird
            expect(response.status).to.equal(200);
            expect(response.body.message).to.equal("Reihenfolge aktualisiert");
            // Optional: Überprüfe, ob das erste Item in der neuen Reihenfolge "Brot aus Backtheke" ist
            expect(response.body.items[0].name).to.equal('Brot aus Backtheke');
        });
    });

    it('shows an error when adding an item with no name', () => {
        // Wähle eine existierende Kategorie, z. B. "Discounter"
        cy.get('#category-select').select('Discounter');
        // Erstelle einen Stub, um den Alert abzufangen
        const alertStub = cy.stub();
        cy.on('window:alert', alertStub);
        // Leere das Feld für den neuen Artikelnamen und versuche das Formular abzuschicken
        cy.get('#new-item-name').clear();
        cy.get('#add-item-form').submit().then(() => {
            expect(alertStub.getCall(0)).to.be.calledWith("Bitte Kategorie auswählen und Artikelname eingeben.");
        });
    });

    it('toggles an existing item\'s "done" status', () => {
        // Wähle eine existierende Kategorie, z. B. "Discounter"
        cy.get('#category-select').select('Discounter');

        // Wir gehen davon aus, dass "TK Pizza" bereits in dieser Kategorie existiert
        // Falls nicht, bitte Item anpassen oder in der JSON hinterlegen
        const existingItem = 'TK Pizza';

        // Finde das existierende Item in der Liste
        cy.get('.item-list').contains(existingItem).should('exist');

        // Klicke auf die Checkbox, um den Status auf "done" zu setzen
        cy.get('.item-list')
            .contains(existingItem)
            .parent('li')
            .find('input.toggle-done')
            .click();

        // Überprüfe, ob der Artikel jetzt durchgestrichen ist (Klasse "item-done")
        cy.get('.item-list')
            .contains(existingItem)
            .should('have.class', 'item-done');

        // Klicke erneut, um den "done"-Status zurückzusetzen
        cy.get('.item-list')
            .contains(existingItem)
            .parent('li')
            .find('input.toggle-done')
            .click();

        // Jetzt sollte die Klasse "item-done" nicht mehr vorhanden sein
        cy.get('.item-list')
            .contains(existingItem)
            .should('not.have.class', 'item-done');
    });

    const category = 'Discounter';
    const createdItemName = 'CypressTempItem';
    const editedItemName = 'CypressTempItemEdited';

    it('creates a new item in the selected category', () => {
        // Wähle die Kategorie "Discounter"
        cy.get('#category-select').select(category);
        // Gebe den neuen Artikelnamen ein und sende das Formular ab
        cy.get('#new-item-name').clear().type(createdItemName);
        cy.get('#add-item-form').submit();
        // Überprüfe, dass der Artikel in der Artikelliste erscheint
        cy.get('.item-list').contains(createdItemName).should('exist');
    });

    it('edits the created item', () => {
        // Wähle erneut die Kategorie "Discounter"
        cy.get('#category-select').select(category);
        // Öffne den Bearbeiten-Dialog für das gerade erstellte Item
        cy.get('.item-list')
            .contains(createdItemName)
            .parent('li')
            .within(() => {
                cy.get('.edit-item-btn').click();
            });
        // Das Edit-Modal sollte sichtbar sein
        cy.get('#edit-modal').should('be.visible');
        // Ändere den Artikelnamen und sende das Formular ab
        cy.get('#edit-item-name').clear().type(editedItemName);
        cy.get('#edit-form').submit();
        // Das Modal sollte geschlossen sein und der neue Name sollte in der Liste erscheinen
        cy.get('#edit-modal').should('not.be.visible');
        cy.get('.item-list').contains(editedItemName).should('exist');
    });

    it('deletes the edited item', () => {
        // Wähle die Kategorie "Discounter"
        cy.get('#category-select').select(category);
        // Finde das bearbeitete Item und klicke auf den Löschen-Button
        cy.get('.item-list')
            .contains(editedItemName)
            .parent('li')
            .within(() => {
                cy.get('.delete-item-btn').click();
            });
        // Simuliere die Bestätigung des Löschdialogs
        cy.on('window:confirm', () => true);
        // Überprüfe, dass das Item nicht mehr in der Liste vorhanden ist
        cy.get('.item-list').contains(editedItemName).should('not.exist');
    });

});
