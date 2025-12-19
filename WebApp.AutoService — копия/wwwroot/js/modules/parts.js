// Модуль управления запчастями
class PartsModule {
    constructor() {
        this.name = 'parts';
        this.title = 'Запчасти';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.filterCategory = '';
    }

    async load() {
        this.render();
        this.bindEvents();
    }

    getTitle() {
        return this.title;
    }

    render() {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        const categories = this.getCategories();

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Запчасти</h2>
                    <div class="header-actions">
                        <div class="search-filter-row">
                            <div class="search-box">
                                <input type="text" 
                                       class="form-control search-input" 
                                       placeholder="Поиск запчастей..."
                                       value="${this.searchTerm}">
                                <i class="fas fa-search"></i>
                            </div>
                            <select class="form-control filter-select" id="category-filter">
                                <option value="">Все категории</option>
                                ${categories.map(cat => `
                                    <option value="${cat}" ${this.filterCategory === cat ? 'selected' : ''}>
                                        ${cat}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-outline" id="print-stock-btn">
                                <i class="fas fa-print"></i> Отчет
                            </button>
                            <button class="btn btn-primary" id="add-part-btn">
                                <i class="fas fa-plus"></i> Добавить
                            </button>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    ${this.isMobileView() ? this.renderMobileList() : this.renderTable()}
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    getFilteredParts() {
        let parts = dataManager.getParts();

        // Поиск
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            parts = parts.filter(part =>
                (part.name && part.name.toLowerCase().includes(term)) ||
                (part.code && part.code.toLowerCase().includes(term)) ||
                (part.description && part.description.toLowerCase().includes(term))
            );
        }

        // Фильтрация по категории
        if (this.filterCategory) {
            parts = parts.filter(part => part.category === this.filterCategory);
        }

        return parts;
    }

    getCategories() {
        const parts = dataManager.getParts();
        const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];
        return categories.sort();
    }

    renderTable() {
        const parts = this.getFilteredParts();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedParts = parts.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Наименование</th>
                        <th>Код</th>
                        <th>Категория</th>
                        <th>Остаток</th>
                        <th>Мин. запас</th>
                        <th>Цена (₽)</th>
                        <th>Стоимость запаса</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedParts.map(part => {
            const isLowStock = part.stock <= part.minStock;
            const stockValue = part.stock * part.price;

            return `
                            <tr class="${isLowStock ? 'table-warning' : ''}">
                                <td>
                                    <strong>${part.name || ''}</strong>
                                    ${part.manufacturer ? `<br><small class="text-muted">${part.manufacturer}</small>` : ''}
                                </td>
                                <td>${part.code || '-'}</td>
                                <td>${part.category || '-'}</td>
                                <td>
                                    <span class="stock-badge ${isLowStock ? 'stock-low' : 'stock-ok'}">
                                        ${part.stock || 0}
                                    </span>
                                </td>
                                <td>${part.minStock || 0}</td>
                                <td class="text-nowrap">${this.formatCurrency(part.price || 0)}</td>
                                <td class="text-nowrap">${this.formatCurrency(stockValue)}</td>
                                <td class="table-actions">
                                    <button class="action-btn stock-in" data-id="${part.id}" title="Приход">
                                        <i class="fas fa-arrow-down"></i>
                                    </button>
                                    <button class="action-btn stock-out" data-id="${part.id}" title="Расход">
                                        <i class="fas fa-arrow-up"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${part.id}" title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete" data-id="${part.id}" title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    }

    renderMobileList() {
        const parts = this.getFilteredParts();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedParts = parts.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedParts.map(part => {
            const isLowStock = part.stock <= part.minStock;

            return `
                        <div class="data-item ${isLowStock ? 'low-stock-item' : ''}">
                            <div class="data-row">
                                <span class="data-label">Запчасть:</span>
                                <span class="data-value">
                                    <strong>${part.name || ''}</strong>
                                    ${part.code ? `<br><small>Код: ${part.code}</small>` : ''}
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Категория:</span>
                                <span class="data-value">${part.category || '-'}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Остаток/Мин:</span>
                                <span class="data-value">
                                    <span class="stock-badge ${isLowStock ? 'stock-low' : 'stock-ok'}">
                                        ${part.stock || 0}
                                    </span> / ${part.minStock || 0}
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Цена:</span>
                                <span class="data-value">${this.formatCurrency(part.price || 0)}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Действия:</span>
                                <span class="data-value">
                                    <button class="action-btn stock-in" data-id="${part.id}">
                                        <i class="fas fa-arrow-down"></i>
                                    </button>
                                    <button class="action-btn stock-out" data-id="${part.id}">
                                        <i class="fas fa-arrow-up"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${part.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete" data-id="${part.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </span>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    renderPagination() {
        const parts = this.getFilteredParts();
        const totalItems = parts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.parts.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.parts.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.parts.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    bindEvents() {
        // Кнопка добавления
        document.getElementById('add-part-btn')?.addEventListener('click', () => this.showPartForm());

        // Кнопка печати отчета
        document.getElementById('print-stock-btn')?.addEventListener('click', () => this.printStockReport());

        // Поиск
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.render();
            });
        }

        // Фильтр по категории
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        // Обработчики кнопок действий
        setTimeout(() => {
            document.querySelectorAll('.action-btn.stock-in').forEach(btn => {
                btn.addEventListener('click', (e) => this.showStockInForm(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.stock-out').forEach(btn => {
                btn.addEventListener('click', (e) => this.showStockOutForm(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editPart(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => this.deletePart(e.currentTarget.dataset.id));
            });
        }, 100);
    }

    showPartForm(part = null) {
        const isEdit = !!part;
        const title = isEdit ? 'Редактировать запчасть' : 'Добавить запчасть';

        const categories = this.getCategories();

        const formHTML = `
            <form id="part-form">
                <div class="form-group">
                    <label class="form-label">Наименование *</label>
                    <input type="text" class="form-control" name="name" 
                           value="${part?.name || ''}" required>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Код/Артикул</label>
                            <input type="text" class="form-control" name="code" 
                                   value="${part?.code || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Категория</label>
                            <input type="text" class="form-control" name="category" 
                                   value="${part?.category || ''}" list="category-list">
                            <datalist id="category-list">
                                ${categories.map(cat => `<option value="${cat}">`).join('')}
                            </datalist>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Производитель</label>
                            <input type="text" class="form-control" name="manufacturer" 
                                   value="${part?.manufacturer || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Поставщик</label>
                            <input type="text" class="form-control" name="supplier" 
                                   value="${part?.supplier || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Цена закупки (₽) *</label>
                            <input type="number" class="form-control" name="costPrice" 
                                   value="${part?.costPrice || ''}" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Цена продажи (₽) *</label>
                            <input type="number" class="form-control" name="price" 
                                   value="${part?.price || ''}" min="0" step="0.01" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-4">
                        <div class="form-group">
                            <label class="form-label">Текущий остаток *</label>
                            <input type="number" class="form-control" name="stock" 
                                   value="${part?.stock || 0}" min="0" step="1" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="form-group">
                            <label class="form-label">Минимальный запас *</label>
                            <input type="number" class="form-control" name="minStock" 
                                   value="${part?.minStock || 0}" min="0" step="1" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="form-group">
                            <label class="form-label">Максимальный запас</label>
                            <input type="number" class="form-control" name="maxStock" 
                                   value="${part?.maxStock || ''}" min="0" step="1">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Место хранения</label>
                    <input type="text" class="form-control" name="location" 
                           value="${part?.location || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="form-control" name="description" rows="3">${part?.description || ''}</textarea>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Срок годности</label>
                            <input type="date" class="form-control" name="expiryDate" 
                                   value="${part?.expiryDate || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Единица измерения</label>
                            <select class="form-control" name="unit">
                                <option value="шт" ${part?.unit === 'шт' ? 'selected' : ''}>шт</option>
                                <option value="кг" ${part?.unit === 'кг' ? 'selected' : ''}>кг</option>
                                <option value="л" ${part?.unit === 'л' ? 'selected' : ''}>л</option>
                                <option value="м" ${part?.unit === 'м' ? 'selected' : ''}>м</option>
                                <option value="компл" ${part?.unit === 'компл' ? 'selected' : ''}>компл</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        `;

        showModal({
            title: title,
            content: formHTML,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: isEdit ? 'Сохранить' : 'Добавить',
                    type: 'primary',
                    handler: () => this.savePart(part?.id)
                }
            ]
        });
    }

    savePart(id = null) {
        const form = document.getElementById('part-form');
        if (!form) return;

        const formData = new FormData(form);
        const partData = Object.fromEntries(formData.entries());

        // Преобразуем числовые поля
        partData.costPrice = parseFloat(partData.costPrice) || 0;
        partData.price = parseFloat(partData.price) || 0;
        partData.stock = parseInt(partData.stock) || 0;
        partData.minStock = parseInt(partData.minStock) || 0;
        partData.maxStock = partData.maxStock ? parseInt(partData.maxStock) : null;

        // Валидация
        if (!partData.name || partData.costPrice < 0 || partData.price < 0) {
            showNotification('Заполните обязательные поля корректно', 'error');
            return;
        }

        if (id) {
            // Обновление существующего
            const success = dataManager.updatePart(id, partData);
            if (success) {
                showNotification('Запчасть обновлена', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Добавление новой
            const newPart = dataManager.addPart(partData);
            if (newPart) {
                showNotification('Запчасть добавлена', 'success');
                this.render();
                closeModal();
            }
        }
    }

    showStockInForm(partId) {
        const parts = dataManager.getParts();
        const part = parts.find(p => p.id === partId);

        if (!part) return;

        const formHTML = `
            <form id="stock-in-form">
                <div class="form-group">
                    <label class="form-label">Запчасть</label>
                    <input type="text" class="form-control" value="${part.name}" readonly>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Текущий остаток</label>
                            <input type="number" class="form-control" value="${part.stock}" readonly>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Количество для прихода *</label>
                            <input type="number" class="form-control" name="quantity" 
                                   min="1" value="1" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Цена закупки (₽)</label>
                            <input type="number" class="form-control" name="costPrice" 
                                   value="${part.costPrice}" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Номер накладной</label>
                            <input type="text" class="form-control" name="invoiceNumber">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Поставщик</label>
                    <input type="text" class="form-control" name="supplier" 
                           value="${part.supplier || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Примечание</label>
                    <textarea class="form-control" name="notes" rows="2"></textarea>
                </div>
            </form>
        `;

        showModal({
            title: 'Приход запчасти',
            content: formHTML,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Сохранить',
                    type: 'primary',
                    handler: () => this.processStockIn(partId)
                }
            ]
        });
    }

    processStockIn(partId) {
        const form = document.getElementById('stock-in-form');
        if (!form) return;

        const formData = new FormData(form);
        const stockData = Object.fromEntries(formData.entries());

        const quantity = parseInt(stockData.quantity);
        const costPrice = parseFloat(stockData.costPrice);

        if (quantity <= 0 || costPrice <= 0) {
            showNotification('Введите корректные значения', 'error');
            return;
        }

        // Обновляем остаток
        const success = dataManager.updatePartStock(partId, quantity);
        if (success) {
            // Логируем операцию
            const parts = dataManager.getParts();
            const part = parts.find(p => p.id === partId);

            const operation = {
                id: dataManager.generateId(),
                type: 'in',
                partId: partId,
                partName: part.name,
                quantity: quantity,
                costPrice: costPrice,
                totalCost: quantity * costPrice,
                invoiceNumber: stockData.invoiceNumber,
                supplier: stockData.supplier,
                notes: stockData.notes,
                date: new Date().toISOString(),
                user: 'Администратор'
            };

            dataManager.addStockOperation(operation);

            showNotification(`Приход ${quantity} шт. успешно зарегистрирован`, 'success');
            this.render();
            closeModal();
        }
    }

    showStockOutForm(partId) {
        const parts = dataManager.getParts();
        const part = parts.find(p => p.id === partId);

        if (!part) return;

        const formHTML = `
            <form id="stock-out-form">
                <div class="form-group">
                    <label class="form-label">Запчасть</label>
                    <input type="text" class="form-control" value="${part.name}" readonly>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Текущий остаток</label>
                            <input type="number" class="form-control" value="${part.stock}" readonly>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Количество для расхода *</label>
                            <input type="number" class="form-control" name="quantity" 
                                   min="1" max="${part.stock}" value="1" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Причина расхода</label>
                    <select class="form-control" name="reason" required>
                        <option value="sale">Продажа</option>
                        <option value="workorder">Заказ-наряд</option>
                        <option value="writeoff">Списание</option>
                        <option value="internal">Внутреннее использование</option>
                        <option value="other">Другое</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Документ-основание</label>
                    <input type="text" class="form-control" name="documentNumber">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Примечание</label>
                    <textarea class="form-control" name="notes" rows="2"></textarea>
                </div>
            </form>
        `;

        showModal({
            title: 'Расход запчасти',
            content: formHTML,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Сохранить',
                    type: 'primary',
                    handler: () => this.processStockOut(partId)
                }
            ]
        });
    }

    processStockOut(partId) {
        const form = document.getElementById('stock-out-form');
        if (!form) return;

        const formData = new FormData(form);
        const stockData = Object.fromEntries(formData.entries());

        const quantity = parseInt(stockData.quantity);

        if (quantity <= 0) {
            showNotification('Введите корректное количество', 'error');
            return;
        }

        // Проверяем остаток
        const parts = dataManager.getParts();
        const part = parts.find(p => p.id === partId);

        if (quantity > part.stock) {
            showNotification('Недостаточно товара на складе', 'error');
            return;
        }

        // Обновляем остаток (отрицательное значение для расхода)
        const success = dataManager.updatePartStock(partId, -quantity);
        if (success) {
            // Логируем операцию
            const operation = {
                id: dataManager.generateId(),
                type: 'out',
                partId: partId,
                partName: part.name,
                quantity: quantity,
                price: part.price,
                totalValue: quantity * part.price,
                reason: stockData.reason,
                documentNumber: stockData.documentNumber,
                notes: stockData.notes,
                date: new Date().toISOString(),
                user: 'Администратор'
            };

            dataManager.addStockOperation(operation);

            showNotification(`Расход ${quantity} шт. успешно зарегистрирован`, 'success');
            this.render();
            closeModal();
        }
    }

    editPart(id) {
        const parts = dataManager.getParts();
        const part = parts.find(p => p.id === id);
        if (part) {
            this.showPartForm(part);
        }
    }

    deletePart(id) {
        // Проверяем, используется ли запчасть в заказ-нарядах
        const workOrders = dataManager.getWorkOrders();
        const isUsed = workOrders.some(order =>
            order.parts?.some(p => p.partId === id)
        );

        const message = isUsed ?
            'Эта запчасть используется в заказ-нарядах. Удаление приведет к их изменению. Продолжить?' :
            'Вы уверены, что хотите удалить эту запчасть?';

        showModal({
            title: 'Удаление запчасти',
            content: `<p>${message}</p>`,
            size: 'sm',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Удалить',
                    type: 'danger',
                    handler: () => {
                        const success = dataManager.deletePart(id);
                        if (success) {
                            showNotification('Запчасть удалена', 'success');
                            this.render();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    printStockReport() {
        const parts = dataManager.getParts();
        const totalValue = parts.reduce((sum, part) => sum + (part.stock * part.price), 0);
        const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

        const printContent = `
            <div class="print-document">
                <div class="print-header">
                    <h1>Отчет по остаткам на складе</h1>
                    <p>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</p>
                    <p>Общая стоимость запаса: ${this.formatCurrency(totalValue)}</p>
                    <p>Запчастей с низким запасом: ${lowStockCount}</p>
                </div>
                
                <div class="print-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Наименование</th>
                                <th>Код</th>
                                <th>Категория</th>
                                <th>Остаток</th>
                                <th>Мин. запас</th>
                                <th>Цена (₽)</th>
                                <th>Стоимость запаса</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${parts.map(part => {
            const isLowStock = part.stock <= part.minStock;
            const stockValue = part.stock * part.price;

            return `
                                    <tr>
                                        <td>${part.name}</td>
                                        <td>${part.code || '-'}</td>
                                        <td>${part.category || '-'}</td>
                                        <td>${part.stock}</td>
                                        <td>${part.minStock || 0}</td>
                                        <td>${this.formatCurrency(part.price)}</td>
                                        <td>${this.formatCurrency(stockValue)}</td>
                                        <td>${isLowStock ? 'НИЗКИЙ ЗАПАС' : 'НОРМА'}</td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="6" class="text-right"><strong>ИТОГО:</strong></td>
                                <td><strong>${this.formatCurrency(totalValue)}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="print-footer">
                    <p>Всего позиций: ${parts.length}</p>
                    <p>Сформировал: Администратор</p>
                </div>
            </div>
        `;

        printDocument(printContent, 'Отчет по остаткам на складе');
    }

    changePage(page) {
        const parts = this.getFilteredParts();
        const totalPages = Math.ceil(parts.length / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    unload() {
        console.log('Parts module unloaded');
    }
}

// Добавляем методы в DataManager
DataManager.prototype.addPart = function (part) {
    part.id = this.generateId();
    part.createdAt = new Date().toISOString();
    this.data.parts.push(part);
    this.saveData();
    return part;
};

DataManager.prototype.updatePart = function (id, updates) {
    const index = this.data.parts.findIndex(p => p.id === id);
    if (index !== -1) {
        this.data.parts[index] = { ...this.data.parts[index], ...updates };
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.deletePart = function (id) {
    const index = this.data.parts.findIndex(p => p.id === id);
    if (index !== -1) {
        this.data.parts.splice(index, 1);
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.addStockOperation = function (operation) {
    if (!this.data.stockOperations) {
        this.data.stockOperations = [];
    }
    this.data.stockOperations.push(operation);
    this.saveData();
    return operation;
};

// Стили для модуля запчастей
const partsStyles = `
    .search-filter-row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .search-box {
        position: relative;
        width: 300px;
    }

    .search-input {
        padding-left: 2.5rem;
    }

    .search-box i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
    }

    .filter-select {
        width: 200px;
        height: 42px;
    }

    .stock-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        min-width: 40px;
        text-align: center;
    }

    .stock-ok {
        background-color: #d5f4e6;
        color: #27ae60;
    }

    .stock-low {
        background-color: #ffebee;
        color: #e74c3c;
    }

    .table-warning {
        background-color: #fff8e1 !important;
    }

    .low-stock-item {
        border-left: 4px solid #f39c12;
    }

    @media (max-width: 768px) {
        .header-actions {
            flex-direction: column;
            gap: 1rem;
        }
        
        .search-filter-row {
            flex-direction: column;
            width: 100%;
        }
        
        .search-box,
        .filter-select {
            width: 100%;
        }
        
        .btn-group {
            align-self: flex-end;
        }
    }
`;

const partsStyleSheet = document.createElement('style');
partsStyleSheet.textContent = partsStyles;
document.head.appendChild(partsStyleSheet);