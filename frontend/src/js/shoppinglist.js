// Warte, bis das DOM vollständig geladen ist, bevor der Code ausgeführt wird
document.addEventListener('DOMContentLoaded', () => {
    // Elementreferenzen aus dem DOM
    const categorySelect = document.getElementById('category-select');
    const addCategoryForm = document.getElementById('add-category-form');
    const deleteCategoryBtn = document.getElementById('delete-category-btn');


    // Lokale Variablen zur Speicherung des aktuellen Zustands
    let currentItems = []; // speichert aktuell geladene Artikel
    let sortMode = 'alphabet'; // aktueller Sortiermodus: 'alphabet' oder 'user'

    /* ===========================================================
       Funktion: loadCategories
       Zweck: Lädt die Kategorien (Einkaufslisten) vom Server und füllt das Dropdown-Menü.
    =========================================================== */
    async function loadCategories() {
        try {
            const res = await fetch('/shoppinglist/categories');
            const categories = await res.json();
            // Setze das Dropdown zurück mit der Standardoption
            categorySelect.innerHTML = '<option value="">-- Auswahl --</option>';
            // Für jede geladene Kategorie einen <option>-Eintrag erstellen
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Kategorien:", error);
        }
    }


    /* ===========================================================
       Event Listener: Neues Kategorie-Formular absenden
       Zweck: Sendet einen POST-Request zum Erstellen einer neuen Kategorie.
    =========================================================== */
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCategoryName = document.getElementById('new-category-name').value.trim();
        if (!newCategoryName) {
            alert("Bitte einen Kategorienamen eingeben.");
            return;
        }
        try {
            const res = await fetch('/shoppinglist/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryName: newCategoryName })
            });
            if (res.ok) {
                document.getElementById('new-category-name').value = '';
                loadCategories();
            } else {
                const errorData = await res.json();
                alert("Fehler: " + errorData.error);
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Kategorie:", error);
        }
    });

    /* ===========================================================
       Event Listener: Kategorie löschen
       Zweck: Sendet einen DELETE-Request zum Löschen der aktuell ausgewählten Kategorie.
    =========================================================== */
    deleteCategoryBtn.addEventListener('click', async () => {
        const category = categorySelect.value;
        if (!category) {
            alert("Bitte eine Kategorie auswählen.");
            return;
        }
        if (confirm(`Möchtest du die Kategorie "${category}" löschen? Alle darin enthaltenen Artikel gehen verloren.`)) {
            try {
                const res = await fetch('/shoppinglist/category', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: category })
                });
                if (res.ok) {
                    loadCategories();
                    itemList.innerHTML = '';
                } else {
                    const errorData = await res.json();
                    alert("Fehler: " + errorData.error);
                }
            } catch (error) {
                console.error("Fehler beim Löschen der Kategorie:", error);
            }
        }
    });

    // Initialer Aufruf: Lade alle Kategorien beim Laden der Seite
    loadCategories();
});
