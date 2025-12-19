export class Sidebar {
    constructor(documentConstructor) {
        this.docConstructor = documentConstructor;
        this.currentDirectory = null;
        this.initialize();
    }

    initialize() {
        this.setupTabSwitching();
        this.setupTemplateSelection();
        this.setupDirectoryManagement();
        this.setupElementDragAndDrop();
        this.loadDocumentList();
        this.setupSearch();
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchToTab(tabName);
            });
        });
    }

    switchToTab(tabName) {
        // Обновляем активные кнопки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Показываем соответствующий контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Загружаем данные для активной вкладки
        switch (tabName) {
            case 'documents':
                this.loadDocumentList();
                break;
            case 'directories':
                this.loadDirectories();
                break;
        }
    }

    setupTemplateSelection() {
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const templateType = e.currentTarget.dataset.type;
                this.selectTemplate(templateType);
            });
        });
    }

    selectTemplate(templateType) {
        this.docConstructor.selectTemplate(templateType);

        // Показываем уведомление
        this.showNotification(`Шаблон "${this.getTemplateName(templateType)}" выбран`);
    }

    getTemplateName(type) {
        const names = {
            'invoice': 'Накладная',
            'contract': 'Договор',
            'act': 'Акт выполненных работ',
            'order': 'Приказ',
            'application': 'Заявление',
            'custom': 'Пустой документ'
        };
        return names[type] || type;
    }

    setupDirectoryManagement() {
        document.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const directoryName = e.currentTarget.querySelector('span').textContent;
                this.openDirectory(directoryName);
            });
        });

        // Добавление нового элемента в справочник
        document.getElementById('add-directory-item').addEventListener('click', () => {
            this.addDirectoryItem();
        });
    }

    openDirectory(directoryName) {
        this.currentDirectory = directoryName;
        const directoryData = this.getDirectoryData(directoryName);
        this.renderDirectoryTable(directoryData);

        document.getElementById('directory-title').textContent = directoryName;
        document.getElementById('directory-modal').classList.add('active');
    }

    getDirectoryData(directoryName) {
        // Получаем данные из localStorage или используем демо-данные
        const storedData = localStorage.getItem(`directory_${directoryName}`);

        if (storedData) {
            return JSON.parse(storedData);
        }

        // Демо-данные
        const demoData = {
            'Контрагенты': {
                headers: ['Код', 'Наименование', 'ИНН', 'КПП', 'Адрес', 'Телефон'],
                rows: [
                    ['001', 'ООО "Ромашка"', '1234567890', '123456789', 'г. Москва', '+7 (999) 123-45-67'],
                    ['002', 'ИП Иванов И.И.', '0987654321', '', 'г. Санкт-Петербург', '+7 (888) 765-43-21']
                ]
            },
            'Товары/Услуги': {
                headers: ['Артикул', 'Наименование', 'Ед. изм.', 'Цена', 'Категория'],
                rows: [
                    ['001', 'Ноутбук Asus', 'шт.', '45000', 'Техника'],
                    ['002', 'Мышь беспроводная', 'шт.', '1500', 'Аксессуары']
                ]
            },
            'Организации': {
                headers: ['Код', 'Наименование', 'ИНН', 'КПП', 'Юр. адрес'],
                rows: [
                    ['001', 'ООО "Наша компания"', '123456789012', '123456789', 'г. Москва, ул. Ленина, д. 1']
                ]
            },
            'Сотрудники': {
                headers: ['Таб. номер', 'ФИО', 'Должность', 'Отдел', 'Телефон'],
                rows: [
                    ['001', 'Иванов Иван Иванович', 'Менеджер', 'Продажи', '+7 (999) 111-11-11'],
                    ['002', 'Петрова Мария Сергеевна', 'Бухгалтер', 'Финансы', '+7 (999) 222-22-22']
                ]
            },
            'Статьи затрат': {
                headers: ['Код', 'Наименование', 'Тип', 'Счет учета'],
                rows: [
                    ['001', 'Заработная плата', 'Постоянные', '26'],
                    ['002', 'Аренда офиса', 'Постоянные', '44']
                ]
            }
        };

        return demoData[directoryName] || { headers: [], rows: [] };
    }

    renderDirectoryTable(data) {
        const container = document.getElementById('directory-table-container');

        let html = `
            <table class="directory-table">
                <thead>
                    <tr>
                        ${data.headers.map(header => `<th>${header}</th>`).join('')}
                        <th width="100">Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.rows.forEach((row, rowIndex) => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += `
                <td class="directory-actions">
                    <button class="btn-select-directory" data-row="${rowIndex}" title="Выбрать">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-edit-directory" data-row="${rowIndex}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-directory" data-row="${rowIndex}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;

        // Добавляем обработчики для кнопок действий
        this.setupDirectoryActions(data);
    }

    setupDirectoryActions(data) {
        // Выбор элемента справочника
        document.querySelectorAll('.btn-select-directory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowIndex = parseInt(e.currentTarget.dataset.row);
                const rowData = data.rows[rowIndex];
                this.selectDirectoryItem(rowData);
            });
        });

        // Редактирование элемента
        document.querySelectorAll('.btn-edit-directory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowIndex = parseInt(e.currentTarget.dataset.row);
                this.editDirectoryItem(rowIndex, data);
            });
        });

        // Удаление элемента
        document.querySelectorAll('.btn-delete-directory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowIndex = parseInt(e.currentTarget.dataset.row);
                this.deleteDirectoryItem(rowIndex, data);
            });
        });
    }

    selectDirectoryItem(itemData) {
        // В реальном приложении здесь можно вставить данные в текущий документ
        console.log('Выбран элемент справочника:', itemData);
        this.showNotification(`Элемент "${itemData[1]}" выбран из справочника`);
    }

    editDirectoryItem(rowIndex, data) {
        // Создаем модальное окно для редактирования
        const rowData = data.rows[rowIndex];
        let formHTML = '<div class="directory-edit-form">';

        data.headers.forEach((header, index) => {
            formHTML += `
                <div class="form-group">
                    <label>${header}:</label>
                    <input type="text" value="${rowData[index] || ''}" id="edit-field-${index}">
                </div>
            `;
        });

        formHTML += `
            <div class="form-actions">
                <button class="btn btn-primary" id="save-edit-directory">Сохранить</button>
                <button class="btn btn-secondary" id="cancel-edit-directory">Отмена</button>
            </div>
        </div>`;

        // Показываем модальное окно редактирования
        const modal = this.createModal('Редактирование элемента', formHTML);
        document.body.appendChild(modal);

        // Обработчики для кнопок
        document.getElementById('save-edit-directory').addEventListener('click', () => {
            const newRow = [];
            data.headers.forEach((_, index) => {
                newRow.push(document.getElementById(`edit-field-${index}`).value);
            });

            data.rows[rowIndex] = newRow;
            this.saveDirectoryData(this.currentDirectory, data);
            this.renderDirectoryTable(data);
            modal.remove();
            this.showNotification('Элемент справочника обновлен');
        });

        document.getElementById('cancel-edit-directory').addEventListener('click', () => {
            modal.remove();
        });
    }

    deleteDirectoryItem(rowIndex, data) {
        if (confirm('Удалить этот элемент из справочника?')) {
            data.rows.splice(rowIndex, 1);
            this.saveDirectoryData(this.currentDirectory, data);
            this.renderDirectoryTable(data);
            this.showNotification('Элемент справочника удален');
        }
    }

    addDirectoryItem() {
        const directoryData = this.getDirectoryData(this.currentDirectory);

        let formHTML = '<div class="directory-add-form">';

        directoryData.headers.forEach((header, index) => {
            formHTML += `
                <div class="form-group">
                    <label>${header}:</label>
                    <input type="text" id="add-field-${index}" placeholder="Введите ${header.toLowerCase()}">
                </div>
            `;
        });

        formHTML += `
            <div class="form-actions">
                <button class="btn btn-primary" id="save-add-directory">Добавить</button>
                <button class="btn btn-secondary" id="cancel-add-directory">Отмена</button>
            </div>
        </div>`;

        const modal = this.createModal('Добавление нового элемента', formHTML);
        document.body.appendChild(modal);

        document.getElementById('save-add-directory').addEventListener('click', () => {
            const newRow = [];
            directoryData.headers.forEach((_, index) => {
                newRow.push(document.getElementById(`add-field-${index}`).value);
            });

            directoryData.rows.push(newRow);
            this.saveDirectoryData(this.currentDirectory, directoryData);
            this.renderDirectoryTable(directoryData);
            modal.remove();
            this.showNotification('Новый элемент добавлен в справочник');
        });

        document.getElementById('cancel-add-directory').addEventListener('click', () => {
            modal.remove();
        });
    }

    saveDirectoryData(directoryName, data) {
        localStorage.setItem(`directory_${directoryName}`, JSON.stringify(data));
    }

    setupElementDragAndDrop() {
        const elements = document.querySelectorAll('.element-item.draggable');

        elements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                const elementType = e.currentTarget.dataset.type;
                e.dataTransfer.setData('text/plain', elementType);
                e.dataTransfer.effectAllowed = 'copy';
                element.classList.add('dragging');
            });

            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
            });
        });
    }

    loadDocumentList() {
        const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        const listContainer = document.getElementById('document-list');

        if (savedDocuments.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Нет сохраненных документов</p>
                </div>
            `;
            return;
        }

        let html = '';
        savedDocuments.forEach((doc, index) => {
            const date = new Date(doc.createdAt || Date.now());
            const formattedDate = date.toLocaleDateString('ru-RU');

            html += `
                <div class="document-list-item" data-index="${index}">
                    <div class="document-icon">
                        <i class="fas ${this.getDocumentIcon(doc.type)}"></i>
                    </div>
                    <div class="document-info">
                        <div class="document-name">${doc.title || 'Без названия'}</div>
                        <div class="document-meta">
                            <span class="document-type">${this.getDocumentTypeName(doc.type)}</span>
                            <span class="document-date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="btn-load-document" title="Открыть">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="btn-delete-document" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;

        // Добавляем обработчики для загрузки и удаления документов
        document.querySelectorAll('.btn-load-document').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.closest('.document-list-item').dataset.index);
                this.loadDocument(index);
            });
        });

        document.querySelectorAll('.btn-delete-document').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.closest('.document-list-item').dataset.index);
                this.deleteDocument(index);
            });
        });

        // Загрузка по клику на весь элемент
        document.querySelectorAll('.document-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.document-actions')) {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.loadDocument(index);
                }
            });
        });
    }

    getDocumentIcon(type) {
        const icons = {
            'invoice': 'fa-file-invoice',
            'contract': 'fa-handshake',
            'act': 'fa-file-contract',
            'order': 'fa-clipboard-list',
            'application': 'fa-envelope',
            'custom': 'fa-file-alt'
        };
        return icons[type] || 'fa-file-alt';
    }

    loadDocument(index) {
        const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        if (savedDocuments[index]) {
            this.docConstructor.currentDocument = savedDocuments[index];
            this.docConstructor.currentPage = 0;
            this.docConstructor.renderDocument();
            this.docConstructor.updateDocumentInfo();
            this.showNotification(`Документ "${savedDocuments[index].title}" загружен`);
        }
    }

    deleteDocument(index) {
        if (confirm('Удалить этот документ?')) {
            const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
            savedDocuments.splice(index, 1);
            localStorage.setItem('documents', JSON.stringify(savedDocuments));
            this.loadDocumentList();
            this.showNotification('Документ удален');
        }
    }

    setupSearch() {
        const searchInputs = document.querySelectorAll('.search-input');

        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const tab = e.target.closest('.tab-content').id;

                switch (tab) {
                    case 'documents-tab':
                        this.searchDocuments(searchTerm);
                        break;
                }
            });
        });
    }

    searchDocuments(searchTerm) {
        const items = document.querySelectorAll('.document-list-item');

        items.forEach(item => {
            const name = item.querySelector('.document-name').textContent.toLowerCase();
            const type = item.querySelector('.document-type').textContent.toLowerCase();

            if (name.includes(searchTerm) || type.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    loadDirectories() {
        // Здесь можно загрузить статистику по справочникам
        const directoryItems = document.querySelectorAll('.directory-item');

        directoryItems.forEach(item => {
            const directoryName = item.querySelector('span').textContent;
            const data = this.getDirectoryData(directoryName);
            const count = data.rows.length;

            // Добавляем счетчик элементов
            let counter = item.querySelector('.item-counter');
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'item-counter';
                item.appendChild(counter);
            }
            counter.textContent = `(${count})`;
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    showNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Добавляем CSS анимации
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}