document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category-select');
    const addCategoryForm = document.getElementById('add-category-form');
    const deleteCategoryBtn = document.getElementById('delete-category-btn');

    // Funktion, um Kategorien vom Server zu laden und ins Dropdown zu füllen
    async function loadCategories() {
        try {
            const res = await fetch('/shoppinglist/categories');
            const categories = await res.json();
            categorySelect.innerHTML = '<option value="">-- Auswahl --</option>';
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

    // Event-Listener für das Formular zur Erstellung einer neuen Kategorie
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('new-category-name');
        const newCategoryName = input.value.trim();
        if (!newCategoryName) {
            alert("Bitte einen Kategorienamen eingeben.");
            return;
        }
        console.log("Erstelle Kategorie:", newCategoryName);
        try {
            const res = await fetch('/shoppinglist/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryName: newCategoryName })
            });
            if (res.ok) {
                const result = await res.json();
                console.log("Kategorie erstellt:", result);
                input.value = '';
                loadCategories();
            } else {
                const errorData = await res.json();
                alert("Fehler: " + errorData.error);
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Kategorie:", error);
        }
    });

    // Event-Listener für den Button zum Löschen der aktuellen Kategorie
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
                    const result = await res.json();
                    console.log("Kategorie gelöscht:", result);
                    loadCategories();
                } else {
                    const errorData = await res.json();
                    alert("Fehler: " + errorData.error);
                }
            } catch (error) {
                console.error("Fehler beim Löschen der Kategorie:", error);
            }
        }
    });

    // Kategorien beim Laden der Seite holen
    loadCategories();
});
