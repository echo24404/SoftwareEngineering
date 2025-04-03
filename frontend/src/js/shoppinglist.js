// Warte, bis das DOM vollständig geladen ist, bevor der Code ausgeführt wird
document.addEventListener('DOMContentLoaded', () => {
    // Elementreferenzen aus dem DOM
    const categorySelect = document.getElementById('category-select');
    const itemList = document.getElementById('item-list');
    const addItemForm = document.getElementById('add-item-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const deleteCategoryBtn = document.getElementById('delete-category-btn');
    const filterInput = document.getElementById('filter-input');
    const sortBtn = document.getElementById('sort-btn');

    // Elemente für das Edit-Modal
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editItemNameInput = document.getElementById('edit-item-name');
    const editItemOldNameInput = document.getElementById('edit-item-old-name');
    const editItemCategoryInput = document.getElementById('edit-item-category');
    const cancelEditBtn = document.getElementById('cancel-edit');

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
       Funktion: loadItems
       Zweck: Lädt die Artikel für die ausgewählte Kategorie vom Server.
    =========================================================== */
    async function loadItems(category) {
        // Falls keine Kategorie ausgewählt wurde, leere die Artikelliste und die aktuelle Speicherung
        if (!category) {
            itemList.innerHTML = '';
            currentItems = [];
            return;
        }
        try {
            const res = await fetch(`/shoppinglist/items?category=${encodeURIComponent(category)}`);
            const items = await res.json();
            currentItems = items; // speichere die geladenen Artikel
            renderItems(items);  // rufe die Render-Funktion auf, um die Artikel darzustellen
        } catch (error) {
            console.error("Fehler beim Laden der Artikel:", error);
        }
    }

    /* ===========================================================
       Funktion: renderItems
       Zweck: Rendert die übergebenen Artikel in der Artikelliste im DOM.
    =========================================================== */
    function renderItems(items) {
        itemList.innerHTML = '';
        items.forEach(item => {
            // Erstelle ein Listenelement für jeden Artikel
            const li = document.createElement('li');
            li.dataset.item = item.name;

            // Erstelle und füge eine Checkbox hinzu, um den "done"-Status zu toggeln
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'toggle-done';
            checkbox.checked = item.done;
            checkbox.addEventListener('change', () => {
                toggleItemStatus(item.name);
            });
            li.appendChild(checkbox);


            // Erstelle ein Span für den Artikelnamen
            const spanName = document.createElement('span');
            spanName.className = 'item-name';
            spanName.textContent = item.name;
            // Falls der Artikel als erledigt markiert ist, füge die CSS-Klasse hinzu, die ihn durchstreicht
            if (item.done) {
                spanName.classList.add('item-done');
            }
            li.appendChild(spanName);


            // Erstelle einen Container für die Aktionsbuttons (Bearbeiten & Löschen)
            const btnContainer = document.createElement('div');
            btnContainer.className = 'btn-container';

            // Erstelle den "Bearbeiten"-Button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-item-btn';
            editBtn.textContent = 'Bearbeiten';
            editBtn.addEventListener('click', () => {
                openEditModal(item);
            });
            btnContainer.appendChild(editBtn);


            // Erstelle den "Löschen"-Button und speichere den Artikelnamen als Datensatz
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.textContent = 'Löschen';
            deleteBtn.dataset.item = item.name;
            btnContainer.appendChild(deleteBtn);

            li.appendChild(btnContainer);


            // Füge das Listenelement der Artikelliste hinzu
            itemList.appendChild(li);
        });
    }



    /* ===========================================================
          Funktion: openEditModal
          Zweck: Öffnet das Edit-Modal und füllt die Felder mit den Daten des zu bearbeitenden Artikels.
       =========================================================== */
    function openEditModal(item) {
        editItemNameInput.value = item.name;
        editItemOldNameInput.value = item.name;
        editItemCategoryInput.value = categorySelect.value;
        editModal.style.display = 'block';
    }

    /* ===========================================================
       Funktion: closeEditModal
       Zweck: Schließt das Edit-Modal.
    =========================================================== */
    function closeEditModal() {
        editModal.style.display = 'none';
    }

    // Event Listener: Bearbeitungsformular absenden (Artikel aktualisieren)
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = editItemCategoryInput.value;
        const oldItemName = editItemOldNameInput.value;
        const newItemName = editItemNameInput.value.trim();
        if (!newItemName) return;
        try {
            const res = await fetch('/shoppinglist/item', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, oldItemName, newItemName })
            });
            if (res.ok) {
                closeEditModal();
                loadItems(category);
            } else {
                const errorData = await res.json();
                alert("Fehler: " + errorData.error);
            }
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Artikels:", error);
        }
    });

    // Event Listener: Schließen des Edit-Modals bei Klick auf "Abbrechen"
    cancelEditBtn.addEventListener('click', closeEditModal);



    /* ===========================================================
           Funktion: Sortierfunktion
           Zweck: Schaltet zwischen alphabetischer Sortierung und Sortierung nach dem Ersteller (User) um.
        =========================================================== */
    sortBtn.addEventListener('click', () => {
        sortMode = (sortMode === 'alphabet') ? 'user' : 'alphabet';
        if (sortMode === 'alphabet') {
            const sorted = [...currentItems].sort((a, b) => a.name.localeCompare(b.name));
            currentItems = sorted;
            renderItems(sorted);
            sortBtn.textContent = 'Sortieren: Alphabetisch';
            updateOrder(sorted.map(item => item.name));
        } else {
            const sorted = [...currentItems].sort((a, b) => a.createdBy.toString().localeCompare(b.createdBy.toString()));
            currentItems = sorted;
            renderItems(sorted);
            sortBtn.textContent = 'Sortieren: Nach User';
            updateOrder(sorted.map(item => item.name));
        }
    });

    /* ===========================================================
           Funktion: updateOrder
           Zweck: Sendet die neue Reihenfolge der Artikel an den Server, um sie zu speichern.
        =========================================================== */
    async function updateOrder(newOrder) {
        const category = categorySelect.value;
        try {
            const res = await fetch('/shoppinglist/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, newOrder })
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Fehler beim Aktualisieren der Reihenfolge:", errorData.error);
            }
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Reihenfolge:", error);
        }
    }
    /* ===========================================================
           Funktionen: Drag & Drop
           Zweck: Ermöglichen das Verschieben von Artikeln in der Liste und Aktualisieren der Reihenfolge.
        =========================================================== */
    let dragSrcEl = null;
    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.item);
        this.classList.add('dragging');
    }
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    function handleDrop(e) {
        e.stopPropagation();
        if (dragSrcEl !== this) {
            const items = Array.from(itemList.children);
            const srcIndex = items.indexOf(dragSrcEl);
            const targetIndex = items.indexOf(this);
            if (srcIndex < targetIndex) {
                itemList.insertBefore(dragSrcEl, this.nextSibling);
            } else {
                itemList.insertBefore(dragSrcEl, this);
            }
            const newOrder = Array.from(itemList.children).map(li => li.dataset.item);
            updateOrder(newOrder);
        }
        return false;
    }
    function handleDragEnd() {
        this.classList.remove('dragging');
    }


    /* ===========================================================
       Event Listener: Kategorie Dropdown ändern
       Zweck: Lädt die Artikel der ausgewählten Kategorie.
    =========================================================== */
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        loadItems(category);
    });

    /* ===========================================================
       Event Listener: Neues Artikel-Formular absenden
       Zweck: Sendet einen POST-Request zum Erstellen eines neuen Artikels.
    =========================================================== */
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = categorySelect.value;
        const newItemName = document.getElementById('new-item-name').value.trim();
        if (!category || !newItemName) {
            alert("Bitte Kategorie auswählen und Artikelname eingeben.");
            return;
        }
        try {
            const res = await fetch('/shoppinglist/item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, itemName: newItemName })
            });
            if (res.ok) {
                document.getElementById('new-item-name').value = '';
                loadItems(category);
            } else {
                const errorData = await res.json();
                alert("Fehler: " + errorData.error);
            }
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Artikels:", error);
        }
    });

    /* ===========================================================
       Event Listener: Artikel löschen
       Zweck: Sendet einen DELETE-Request zum Löschen eines Artikels.
    =========================================================== */
    itemList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-item-btn')) {
            const category = categorySelect.value;
            const itemName = e.target.getAttribute('data-item');
            if (confirm(`Möchtest du den Artikel "${itemName}" löschen?`)) {
                try {
                    const res = await fetch('/shoppinglist/item', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ category, itemName })
                    });
                    if (res.ok) {
                        loadItems(category);
                    } else {
                        const errorData = await res.json();
                        alert("Fehler: " + errorData.error);
                    }
                } catch (error) {
                    console.error("Fehler beim Löschen des Artikels:", error);
                }
            }
        }
    });

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
