document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category-select');

    // Funktion, um Kategorien vom Server zu laden und ins Dropdown zu füllen
    async function loadCategories() {
        try {
            const res = await fetch('/shoppinglist/categories');
            const categories = await res.json();
            // Dropdown zurücksetzen
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

    // Kategorien beim Laden der Seite holen
    loadCategories();
});
