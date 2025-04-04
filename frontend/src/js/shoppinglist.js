/**
 * Initialisiert die Anwendung, nachdem das DOM vollständig geladen wurde.
 *
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category-select');
    const itemList = document.getElementById('item-list');
    const addItemForm = document.getElementById('add-item-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const deleteCategoryBtn = document.getElementById('delete-category-btn');
    const filterInput = document.getElementById('filter-input');
    const sortBtn = document.getElementById('sort-btn');

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editItemNameInput = document.getElementById('edit-item-name');
    const editItemOldNameInput = document.getElementById('edit-item-old-name');
    const editItemCategoryInput = document.getElementById('edit-item-category');
    const cancelEditBtn = document.getElementById('cancel-edit');

    let currentItems = []; // Speichert aktuell geladene Artikel
    let sortMode = 'alphabet'; // Mögliche Werte: 'alphabet' oder 'user'

    /**
     * Sendet einen POST-Request, um den "done"-Status eines Artikels zu toggeln.
     * Nach dem Toggle werden die Artikel neu geladen, damit die UI aktualisiert wird.
     *
     * @async
     * @function toggleItemStatus
     * @param {string} itemName - Der Name des Artikels, dessen Status getoggled werden soll.
     * @returns {Promise<void>}
     */
    async function toggleItemStatus(itemName) {
        const category = categorySelect.value;
        try {
            const res = await fetch('/shoppinglist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, itemName })
            });
            if (!res.ok) {
                const errorData = await res.json();
                alert("Fehler: " + errorData.error);
            } else {
                loadItems(category);
            }
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Status:", error);
        }
    }

    /**
     * Lädt die Kategorien vom Server und füllt das Dropdown-Menü.
     *
     * @async
     * @function loadCategories
     * @returns {Promise<void>}
     */
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

    /**
     * Lädt die Artikel der ausgewählten Kategorie vom Server.
     *
     * @async
     * @function loadItems
     * @param {string} category - Der Name der Kategorie.
     * @returns {Promise<void>}
     */
    async function loadItems(category) {
        if (!category) {
            itemList.innerHTML = '';
            currentItems = [];
            return;
        }
        try {
            const res = await fetch(`/shoppinglist/items?category=${encodeURIComponent(category)}`);
            const items = await res.json();
            currentItems = items;
            renderItems(items);
        } catch (error) {
            console.error("Fehler beim Laden der Artikel:", error);
        }
    }

    /**
     * Rendert die Artikel in der Liste im DOM.
     *
     * @function renderItems
     * @param {Array<Object>} items - Array der Artikel.
     * @returns {void}
     */
    function renderItems(items) {
        itemList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.setAttribute('draggable', 'true');
            li.dataset.item = item.name;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'toggle-done';
            checkbox.checked = item.done;
            checkbox.addEventListener('change', () => {
                toggleItemStatus(item.name);
            });
            li.appendChild(checkbox);

            const spanName = document.createElement('span');
            spanName.className = 'item-name';
            spanName.textContent = item.name;
            if (item.done) {
                spanName.classList.add('item-done');
            }
            li.appendChild(spanName);

            const spanCreatedBy = document.createElement('span');
            spanCreatedBy.className = 'created-by';
            spanCreatedBy.textContent = `Erstellt von User ${item.createdBy}`;
            li.appendChild(spanCreatedBy);

            const btnContainer = document.createElement('div');
            btnContainer.className = 'btn-container';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-item-btn';
            editBtn.textContent = 'Bearbeiten';
            editBtn.addEventListener('click', () => {
                openEditModal(item);
            });
            btnContainer.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.textContent = 'Löschen';
            deleteBtn.dataset.item = item.name;
            btnContainer.appendChild(deleteBtn);

            li.appendChild(btnContainer);

            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

            itemList.appendChild(li);
        });
    }

    /**
     * Öffnet das Edit-Modal und füllt die Eingabefelder mit den Daten des zu bearbeitenden Artikels.
     *
     * @function openEditModal
     * @param {Object} item - Der zu bearbeitende Artikel.
     * @returns {void}
     */
    function openEditModal(item) {
        editItemNameInput.value = item.name;
        editItemOldNameInput.value = item.name;
        editItemCategoryInput.value = categorySelect.value;
        editModal.style.display = 'block';
    }

    /**
     * Schließt das Edit-Modal.
     *
     * @function closeEditModal
     * @returns {void}
     */
    function closeEditModal() {
        editModal.style.display = 'none';
    }

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

    cancelEditBtn.addEventListener('click', closeEditModal);

    /**
     * Filtert die aktuell geladenen Artikel anhand der Benutzereingabe.
     *
     * @event input
     */
    filterInput.addEventListener('input', () => {
        const query = filterInput.value.toLowerCase();
        const filtered = currentItems.filter(item => item.name.toLowerCase().includes(query));
        renderItems(filtered);
    });

    /**
     * Wechselt zwischen alphabetischer Sortierung und Sortierung nach dem Ersteller (User).
     *
     * @event click
     */
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

    /**
     * Sendet die neue Reihenfolge der Artikel an den Server, damit sie gespeichert wird.
     *
     * @async
     * @function updateOrder
     * @param {Array<string>} newOrder - Array der neuen Reihenfolge der Artikelnamen.
     * @returns {Promise<void>}
     */
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

    /**
     * Event-Handler: Startet den Drag-Vorgang.
     *
     * @function handleDragStart
     * @param {DragEvent} e - Das Drag-Event.
     * @returns {void}
     */
    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.item);
        this.classList.add('dragging');
    }

    /**
     * Event-Handler: Erlaubt das Überfahren eines Drag-Elements.
     *
     * @function handleDragOver
     * @param {DragEvent} e - Das Drag-Event.
     * @returns {boolean} Gibt false zurück, um das Standardverhalten zu unterbinden.
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    /**
     * Event-Handler: Behandelt das Drop-Event und aktualisiert die Reihenfolge der Artikel.
     *
     * @function handleDrop
     * @param {DragEvent} e - Das Drag-Event.
     * @returns {boolean} Gibt false zurück, um das Standardverhalten zu unterbinden.
     */
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

    /**
     * Event-Handler: Beendet den Drag-Vorgang.
     *
     * @function handleDragEnd
     * @returns {void}
     */
    function handleDragEnd() {
        this.classList.remove('dragging');
    }

    /**
     * Lädt die Artikel der ausgewählten Kategorie, wenn das Dropdown geändert wird.
     *
     * @event change
     */
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        loadItems(category);
    });

    /**
     * Sendet einen POST-Request zum Erstellen eines neuen Artikels.
     *
     * @event submit
     */
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

    /**
     * Sendet einen DELETE-Request zum Löschen eines Artikels.
     *
     * @event click
     */
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

    /**
     * Sendet einen POST-Request zum Erstellen einer neuen Kategorie.
     *
     * @event submit
     */
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

    /**
     * Sendet einen DELETE-Request zum Löschen der aktuell ausgewählten Kategorie.
     *
     * @event click
     */
    deleteCategoryBtn.addEventListener('click', async () => {
        const category = categorySelect.value;
        if (!category) {
            alert("Bitte eine Kategorie auswählen.");
            return;
        }
        if (confirm(`Möchtest du die Liste "${category}" löschen? Alle darin enthaltenen Artikel gehen verloren.`)) {
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
