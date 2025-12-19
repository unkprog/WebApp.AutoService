// Модуль управления накладными
class InvoicesModule {
    constructor() {
        this.name = 'invoices';
        this.title = 'Накладные';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filterStatus = '';
        this.startDate = '';
        this.endDate = '';
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

        const statuses = ['все', 'черновик', 'ожидает оплаты', 'оплачен', 'отменен'];

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Накладные</h2>
                    <div class="header-actions">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Статус:</label>
                                <select class="form-control filter-select" id="status-filter">
                                    ${statuses.map(status => `
                                        <option value="${status}" ${this.filterStatus === status ? 'selected' : ''}>
                                            ${this.getStatusText(status)}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>С:</label>
                                <input type="date" class="form-control date-filter" 
                                       id="start-date" value="${this.startDate}">
                            </div>
                            <div class="filter-group">
                                <label>По:</label>
                                <input type="date" class="form-control date-filter" 
                                       id="end-date" value="${this.endDate}">
                            </div>
                            <button class="btn btn-outline" id="reset-filters-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <button class="btn btn-primary" id="add-invoice-btn">
                            <i class="fas fa-plus"></i> Создать накладную
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    ${this.isMobileView() ? this.renderMobileList() : this.renderTable()}
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    getFilteredInvoices() {
        let invoices = dataManager.getInvoices();

        // Фильтрация по статусу
        if (this.filterStatus && this.filterStatus !== 'все') {
            invoices = invoices.filter(invoice =>
                invoice.status?.toLowerCase() === this.filterStatus.toLowerCase()
            );
        }

        // Фильтрация по дате
        if (this.startDate) {
            const start = new Date(this.startDate);
            invoices = invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate >= start;
            });
        }

        if (this.endDate) {
            const end = new Date(this.endDate);
            end.setHours(23, 59, 59, 999);
            invoices = invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate <= end;
            });
        }

        return invoices;
    }

    renderTable() {
        const invoices = this.getFilteredInvoices();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedInvoices = invoices.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>№ накладной</th>
                        <th>Дата</th>
                        <th>Клиент</th>
                        <th>Автомобиль</th>
                        <th>Сумма (₽)</th>
                        <th>Статус</th>
                        <th>Срок оплаты</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedInvoices.map(invoice => {
            const isOverdue = this.isInvoiceOverdue(invoice);

            return `
                            <tr class="${isOverdue ? 'table-danger' : ''}">
                                <td>
                                    <strong>${invoice.number || ''}</strong>
                                    ${invoice.type ? `<br><small class="text-muted">${this.getInvoiceTypeText(invoice.type)}</small>` : ''}
                                </td>
                                <td>${this.formatDate(invoice.createdAt)}</td>
                                <td>${invoice.clientName || '-'}</td>
                                <td>${invoice.vehicleInfo || '-'}</td>
                                <td class="text-nowrap">${this.formatCurrency(invoice.total || 0)}</td>
                                <td>
                                    <span class="status-badge status-${invoice.status || 'draft'}">
                                        ${this.getStatusText(invoice.status)}
                                    </span>
                                </td>
                                <td class="${isOverdue ? 'text-danger' : ''}">
                                    ${invoice.dueDate ? this.formatDate(invoice.dueDate) : '-'}
                                </td>
                                <td class="table-actions">
                                    <button class="action-btn view" data-id="${invoice.id}" title="Просмотр">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${invoice.id}" title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn print" data-id="${invoice.id}" title="Печать">
                                        <i class="fas fa-print"></i>
                                    </button>
                                    <button class="action-btn payment" data-id="${invoice.id}" title="Оплата">
                                        <i class="fas fa-money-bill"></i>
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
        const invoices = this.getFilteredInvoices();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedInvoices = invoices.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedInvoices.map(invoice => {
            const isOverdue = this.isInvoiceOverdue(invoice);

            return `
                        <div class="data-item ${isOverdue ? 'overdue-invoice' : ''}">
                            <div class="data-row">
                                <span class="data-label">Накладная:</span>
                                <span class="data-value">
                                    <strong>${invoice.number || ''}</strong>
                                    ${invoice.type ? `<br><small>${this.getInvoiceTypeText(invoice.type)}</small>` : ''}
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Дата:</span>
                                <span class="data-value">${this.formatDate(invoice.createdAt)}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Клиент:</span>
                                <span class="data-value">${invoice.clientName || '-'}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Сумма:</span>
                                <span class="data-value">${this.formatCurrency(invoice.total || 0)}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Статус:</span>
                                <span class="data-value">
                                    <span class="status-badge status-${invoice.status || 'draft'}">
                                        ${this.getStatusText(invoice.status)}
                                    </span>
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Действия:</span>
                                <span class="data-value">
                                    <button class="action-btn view" data-id="${invoice.id}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${invoice.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn print" data-id="${invoice.id}">
                                        <i class="fas fa-print"></i>
                                    </button>
                                    <button class="action-btn payment" data-id="${invoice.id}">
                                        <i class="fas fa-money-bill"></i>
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
        const invoices = this.getFilteredInvoices();
        const totalItems = invoices.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.invoices.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.invoices.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.invoices.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    bindEvents() {
        // Кнопка создания накладной
        document.getElementById('add-invoice-btn')?.addEventListener('click', () => this.showInvoiceForm());

        // Фильтры
        document.getElementById('status-filter')?.addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        document.getElementById('start-date')?.addEventListener('change', (e) => {
            this.startDate = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        document.getElementById('end-date')?.addEventListener('change', (e) => {
            this.endDate = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
            this.filterStatus = '';
            this.startDate = '';
            this.endDate = '';
            this.currentPage = 1;
            this.render();
        });

        // Обработчики кнопок действий
        setTimeout(() => {
            document.querySelectorAll('.action-btn.view').forEach(btn => {
                btn.addEventListener('click', (e) => this.viewInvoice(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editInvoice(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.print').forEach(btn => {
                btn.addEventListener('click', (e) => this.printInvoice(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.payment').forEach(btn => {
                btn.addEventListener('click', (e) => this.processPayment(e.currentTarget.dataset.id));
            });
        }, 100);
    }

    showInvoiceForm(invoice = null) {
        const isEdit = !!invoice;
        const title = isEdit ? 'Редактировать накладную' : 'Создать накладную';

        const clients = dataManager.getClients();
        const vehicles = dataManager.getVehicles();
        const services = dataManager.getServices();
        const parts = dataManager.getParts();

        const formHTML = `
            <form id="invoice-form">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Тип накладной</label>
                            <select class="form-control" name="type" required>
                                <option value="sale" ${invoice?.type === 'sale' ? 'selected' : ''}>Продажа</option>
                                <option value="service" ${invoice?.type === 'service' ? 'selected' : ''}>Услуги</option>
                                <option value="parts" ${invoice?.type === 'parts' ? 'selected' : ''}>Запчасти</option>
                                <option value="combined" ${invoice?.type === 'combined' ? 'selected' : ''}>Комбинированная</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Дата накладной</label>
                            <input type="date" class="form-control" name="invoiceDate" 
                                   value="${invoice?.invoiceDate || this.getTodayDate()}" required>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Клиент *</label>
                            <select class="form-control" name="clientId" required>
                                <option value="">Выберите клиента</option>
                                ${clients.map(client => `
                                    <option value="${client.id}" ${invoice?.clientId === client.id ? 'selected' : ''}>
                                        ${client.name} - ${client.phone}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Автомобиль</label>
                            <select class="form-control" name="vehicleId">
                                <option value="">Выберите автомобиль</option>
                                ${vehicles.map(vehicle => `
                                    <option value="${vehicle.id}" ${invoice?.vehicleId === vehicle.id ? 'selected' : ''}>
                                        ${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card mt-3">
                    <div class="card-header">
                        <h4>Позиции накладной</h4>
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-outline" id="add-service-invoice-btn">
                                <i class="fas fa-tools"></i> Услуга
                            </button>
                            <button type="button" class="btn btn-sm btn-outline" id="add-part-invoice-btn">
                                <i class="fas fa-cog"></i> Запчасть
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table" id="invoice-items-table">
                                <thead>
                                    <tr>
                                        <th>Тип</th>
                                        <th>Наименование</th>
                                        <th>Количество</th>
                                        <th>Цена (₽)</th>
                                        <th>Сумма (₽)</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="invoice-items-body">
                                    <!-- Позиции будут добавляться динамически -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" class="text-right"><strong>Итого:</strong></td>
                                        <td id="invoice-total">0.00 ₽</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Статус</label>
                            <select class="form-control" name="status">
                                <option value="draft" ${invoice?.status === 'draft' ? 'selected' : ''}>Черновик</option>
                                <option value="pending" ${invoice?.status === 'pending' ? 'selected' : ''}>Ожидает оплаты</option>
                                <option value="paid" ${invoice?.status === 'paid' ? 'selected' : ''}>Оплачен</option>
                                <option value="cancelled" ${invoice?.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Срок оплаты</label>
                            <input type="date" class="form-control" name="dueDate" 
                                   value="${invoice?.dueDate || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-group mt-3">
                    <label class="form-label">Примечания</label>
                    <textarea class="form-control" name="notes" rows="3">${invoice?.notes || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Способ оплаты</label>
                    <select class="form-control" name="paymentMethod">
                        <option value="cash" ${invoice?.paymentMethod === 'cash' ? 'selected' : ''}>Наличные</option>
                        <option value="card" ${invoice?.paymentMethod === 'card' ? 'selected' : ''}>Банковская карта</option>
                        <option value="transfer" ${invoice?.paymentMethod === 'transfer' ? 'selected' : ''}>Безналичный расчет</option>
                        <option value="other" ${invoice?.paymentMethod === 'other' ? 'selected' : ''}>Другое</option>
                    </select>
                </div>

                <input type="hidden" name="items" id="invoice-items-data">
            </form>
        `;

        showModal({
            title: title,
            content: formHTML,
            size: 'lg',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: isEdit ? 'Сохранить' : 'Создать',
                    type: 'primary',
                    handler: () => this.saveInvoice(invoice?.id)
                }
            ]
        });

        // Инициализация динамических полей
        this.initInvoiceItems();
        if (isEdit && invoice.items) {
            this.loadInvoiceItems(invoice.items);
        }
    }

    initInvoiceItems() {
        const services = dataManager.getServices();
        const parts = dataManager.getParts();

        // Кнопка добавления услуги
        document.getElementById('add-service-invoice-btn')?.addEventListener('click', () => {
            const itemsBody = document.getElementById('invoice-items-body');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Услуга</td>
                <td>
                    <select class="form-control service-select" onchange="window.app.modules.invoices.updateInvoiceItemPrice(this)">
                        <option value="">Выберите услугу</option>
                        ${services.map(service => `
                            <option value="${service.id}" data-price="${service.price}">
                                ${service.name} - ${this.formatCurrency(service.price)}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control quantity" value="1" min="1" 
                           onchange="window.app.modules.invoices.calculateInvoiceTotal()">
                </td>
                <td>
                    <input type="number" class="form-control price" readonly>
                </td>
                <td class="item-total">0.00 ₽</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" 
                            onclick="window.app.modules.invoices.removeInvoiceItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;

            itemsBody.appendChild(row);
            this.calculateInvoiceTotal();
        });

        // Кнопка добавления запчасти
        document.getElementById('add-part-invoice-btn')?.addEventListener('click', () => {
            const itemsBody = document.getElementById('invoice-items-body');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Запчасть</td>
                <td>
                    <select class="form-control part-select" onchange="window.app.modules.invoices.updateInvoiceItemPrice(this)">
                        <option value="">Выберите запчасть</option>
                        ${parts.map(part => `
                            <option value="${part.id}" data-price="${part.price}" data-stock="${part.stock}">
                                ${part.name} (остаток: ${part.stock}) - ${this.formatCurrency(part.price)}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control quantity" value="1" min="1" 
                           onchange="window.app.modules.invoices.calculateInvoiceTotal()">
                </td>
                <td>
                    <input type="number" class="form-control price" readonly>
                </td>
                <td class="item-total">0.00 ₽</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" 
                            onclick="window.app.modules.invoices.removeInvoiceItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;

            itemsBody.appendChild(row);
            this.calculateInvoiceTotal();
        });
    }

    updateInvoiceItemPrice(select) {
        const price = select.selectedOptions[0]?.dataset.price || 0;
        const row = select.closest('tr');
        const priceInput = row.querySelector('.price');
        priceInput.value = price;
        this.calculateInvoiceTotal();
    }

    removeInvoiceItem(button) {
        const row = button.closest('tr');
        row.remove();
        this.calculateInvoiceTotal();
    }

    calculateInvoiceTotal() {
        let total = 0;

        document.querySelectorAll('#invoice-items-body tr').forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            const price = parseFloat(row.querySelector('.price').value) || 0;
            const itemTotal = quantity * price;

            const totalCell = row.querySelector('.item-total');
            totalCell.textContent = this.formatCurrency(itemTotal);

            total += itemTotal;
        });

        document.getElementById('invoice-total').textContent = this.formatCurrency(total);

        // Сохраняем данные позиций в скрытое поле
        this.saveInvoiceItems();
    }

    saveInvoiceItems() {
        const items = [];

        document.querySelectorAll('#invoice-items-body tr').forEach(row => {
            const type = row.cells[0].textContent;
            const select = row.querySelector('select');
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            const price = parseFloat(row.querySelector('.price').value) || 0;

            if (select.value) {
                items.push({
                    type: type === 'Услуга' ? 'service' : 'part',
                    id: select.value,
                    name: select.selectedOptions[0]?.text?.split(' - ')[0] || '',
                    quantity: quantity,
                    price: price,
                    total: quantity * price
                });
            }
        });

        document.getElementById('invoice-items-data').value = JSON.stringify(items);
    }

    loadInvoiceItems(items) {
        if (!items || !Array.isArray(items)) return;

        items.forEach(item => {
            if (item.type === 'service') {
                document.getElementById('add-service-invoice-btn')?.click();
            } else {
                document.getElementById('add-part-invoice-btn')?.click();
            }

            // Устанавливаем значения в последнюю добавленную строку
            const rows = document.querySelectorAll('#invoice-items-body tr');
            const lastRow = rows[rows.length - 1];

            if (lastRow) {
                const select = lastRow.querySelector('select');
                const quantityInput = lastRow.querySelector('.quantity');
                const priceInput = lastRow.querySelector('.price');

                // Находим нужный вариант в select
                const options = Array.from(select.options);
                const option = options.find(opt => opt.value === item.id);

                if (option) {
                    select.value = item.id;
                    quantityInput.value = item.quantity;
                    priceInput.value = item.price;

                    // Обновляем цену
                    this.updateInvoiceItemPrice(select);
                }
            }
        });
    }

    saveInvoice(id = null) {
        const form = document.getElementById('invoice-form');
        if (!form) return;

        const formData = new FormData(form);
        const invoiceData = Object.fromEntries(formData.entries());

        // Парсим данные позиций
        try {
            invoiceData.items = JSON.parse(invoiceData.items || '[]');
        } catch (error) {
            invoiceData.items = [];
        }

        // Расчет общей суммы
        invoiceData.total = invoiceData.items.reduce((sum, item) => sum + (item.total || 0), 0);

        // Валидация
        if (!invoiceData.clientId || invoiceData.items.length === 0) {
            showNotification('Заполните обязательные поля: клиент и минимум одна позиция', 'error');
            return;
        }

        if (id) {
            // Обновление существующей
            const success = dataManager.updateInvoice(id, invoiceData);
            if (success) {
                showNotification('Накладная обновлена', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Создание новой
            const newInvoice = dataManager.addInvoice(invoiceData);
            if (newInvoice) {
                showNotification('Накладная создана', 'success');
                this.render();
                closeModal();
            }
        }
    }

    viewInvoice(id) {
        const invoices = dataManager.getInvoices();
        const invoice = invoices.find(i => i.id === id);

        if (!invoice) return;

        const viewHTML = `
            <div class="invoice-detail">
                <div class="print-header">
                    <h2>Накладная № ${invoice.number}</h2>
                    <p>Дата: ${this.formatDate(invoice.createdAt)}</p>
                    <p>Тип: ${this.getInvoiceTypeText(invoice.type)}</p>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12 col-md-6">
                        <h4>Информация о клиенте</h4>
                        <div class="detail-item">
                            <strong>Клиент:</strong> ${invoice.clientName || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Автомобиль:</strong> ${invoice.vehicleInfo || '-'}
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <h4>Детали накладной</h4>
                        <div class="detail-item">
                            <strong>Статус:</strong> 
                            <span class="status-badge status-${invoice.status || 'draft'}">
                                ${this.getStatusText(invoice.status)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <strong>Способ оплаты:</strong> ${this.getPaymentMethodText(invoice.paymentMethod)}
                        </div>
                        <div class="detail-item">
                            <strong>Срок оплаты:</strong> ${invoice.dueDate ? this.formatDate(invoice.dueDate) : '-'}
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h4>Позиции накладной</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Тип</th>
                                    <th>Наименование</th>
                                    <th>Количество</th>
                                    <th>Цена (₽)</th>
                                    <th>Сумма (₽)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(invoice.items || []).map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.type === 'service' ? 'Услуга' : 'Запчасть'}</td>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${this.formatCurrency(item.price)}</td>
                                        <td>${this.formatCurrency(item.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="5" class="text-right"><strong>ИТОГО:</strong></td>
                                    <td><strong>${this.formatCurrency(invoice.total || 0)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                ${invoice.notes ? `
                    <div class="mt-4">
                        <h4>Примечания</h4>
                        <div class="notes-box">
                            ${invoice.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        showModal({
            title: `Накладная ${invoice.number}`,
            content: viewHTML,
            size: 'lg',
            buttons: [
                {
                    text: 'Печать',
                    type: 'primary',
                    handler: () => {
                        closeModal();
                        this.printInvoice(id);
                    }
                },
                {
                    text: 'Закрыть',
                    type: 'secondary',
                    handler: () => closeModal()
                }
            ]
        });
    }

    editInvoice(id) {
        const invoices = dataManager.getInvoices();
        const invoice = invoices.find(i => i.id === id);
        if (invoice) {
            this.showInvoiceForm(invoice);
        }
    }

    printInvoice(id) {
        const invoices = dataManager.getInvoices();
        const invoice = invoices.find(i => i.id === id);

        if (invoice) {
            const content = PrintComponent.generateInvoiceHTML(invoice);
            PrintComponent.printDocument(content, `Накладная ${invoice.number}`);
        }
    }

    processPayment(id) {
        const invoices = dataManager.getInvoices();
        const invoice = invoices.find(i => i.id === id);

        if (!invoice) return;

        const formHTML = `
            <form id="payment-form">
                <div class="form-group">
                    <label class="form-label">Накладная</label>
                    <input type="text" class="form-control" 
                           value="${invoice.number} - ${this.formatCurrency(invoice.total || 0)}" readonly>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Сумма к оплате (₽) *</label>
                            <input type="number" class="form-control" name="amount" 
                                   value="${invoice.total || 0}" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Дата оплаты *</label>
                            <input type="date" class="form-control" name="paymentDate" 
                                   value="${this.getTodayDate()}" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Способ оплаты *</label>
                    <select class="form-control" name="paymentMethod" required>
                        <option value="cash" ${invoice.paymentMethod === 'cash' ? 'selected' : ''}>Наличные</option>
                        <option value="card" ${invoice.paymentMethod === 'card' ? 'selected' : ''}>Банковская карта</option>
                        <option value="transfer" ${invoice.paymentMethod === 'transfer' ? 'selected' : ''}>Безналичный расчет</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Номер документа/чека</label>
                    <input type="text" class="form-control" name="documentNumber">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Примечание</label>
                    <textarea class="form-control" name="notes" rows="2"></textarea>
                </div>
            </form>
        `;

        showModal({
            title: 'Оплата накладной',
            content: formHTML,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Подтвердить оплату',
                    type: 'primary',
                    handler: () => this.confirmPayment(id)
                }
            ]
        });
    }

    confirmPayment(id) {
        const form = document.getElementById('payment-form');
        if (!form) return;

        const formData = new FormData(form);
        const paymentData = Object.fromEntries(formData.entries());

        const amount = parseFloat(paymentData.amount);

        if (amount <= 0) {
            showNotification('Введите корректную сумму', 'error');
            return;
        }

        // Обновляем статус накладной
        const success = dataManager.updateInvoiceStatus(id, 'paid', paymentData);
        if (success) {
            showNotification('Оплата подтверждена', 'success');
            this.render();
            closeModal();
        }
    }

    isInvoiceOverdue(invoice) {
        if (invoice.status !== 'pending' || !invoice.dueDate) return false;

        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return dueDate < today;
    }

    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    getStatusText(status) {
        const statusMap = {
            'draft': 'Черновик',
            'pending': 'Ожидает оплаты',
            'paid': 'Оплачен',
            'cancelled': 'Отменен'
        };
        return statusMap[status?.toLowerCase()] || status || 'Черновик';
    }

    getInvoiceTypeText(type) {
        const typeMap = {
            'sale': 'Продажа',
            'service': 'Услуги',
            'parts': 'Запчасти',
            'combined': 'Комбинированная'
        };
        return typeMap[type] || type;
    }

    getPaymentMethodText(method) {
        const methodMap = {
            'cash': 'Наличные',
            'card': 'Банковская карта',
            'transfer': 'Безналичный расчет',
            'other': 'Другое'
        };
        return methodMap[method] || method;
    }

    changePage(page) {
        const invoices = this.getFilteredInvoices();
        const totalPages = Math.ceil(invoices.length / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    unload() {
        console.log('Invoices module unloaded');
    }
}

// Добавляем методы в DataManager
DataManager.prototype.updateInvoice = function (id, updates) {
    const index = this.data.invoices.findIndex(i => i.id === id);
    if (index !== -1) {
        this.data.invoices[index] = { ...this.data.invoices[index], ...updates };
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.updateInvoiceStatus = function (id, status, paymentData = null) {
    const index = this.data.invoices.findIndex(i => i.id === id);
    if (index !== -1) {
        this.data.invoices[index].status = status;
        this.data.invoices[index].paymentDate = paymentData?.paymentDate || new Date().toISOString();

        if (paymentData) {
            this.data.invoices[index].paymentMethod = paymentData.paymentMethod;
            this.data.invoices[index].paymentDocument = paymentData.documentNumber;

            // Добавляем запись о платеже
            if (!this.data.payments) {
                this.data.payments = [];
            }

            this.data.payments.push({
                id: this.generateId(),
                invoiceId: id,
                invoiceNumber: this.data.invoices[index].number,
                amount: parseFloat(paymentData.amount),
                date: paymentData.paymentDate,
                method: paymentData.paymentMethod,
                documentNumber: paymentData.documentNumber,
                notes: paymentData.notes
            });
        }

        this.saveData();
        return true;
    }
    return false;
};

// Стили для модуля накладных
const invoicesStyles = `
    .filters-row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .filter-group label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--primary-color);
    }

    .filter-select,
    .date-filter {
        height: 38px;
        min-width: 150px;
    }

    .status-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .status-draft {
        background-color: #f5f5f5;
        color: #757575;
    }

    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }

    .status-paid {
        background-color: #d4edda;
        color: #155724;
    }

    .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
    }

    .table-danger {
        background-color: #ffebee !important;
    }

    .overdue-invoice {
        border-left: 4px solid #e74c3c;
    }

    .invoice-detail .print-header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }

    .invoice-detail h4 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .invoice-detail .detail-item {
        margin-bottom: 0.8rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #eee;
    }

    .invoice-detail .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    @media (max-width: 768px) {
        .header-actions {
            flex-direction: column;
            gap: 1rem;
        }
        
        .filters-row {
            flex-wrap: wrap;
            width: 100%;
        }
        
        .filter-group {
            flex: 1;
            min-width: calc(50% - 0.5rem);
        }
        
        .filter-select,
        .date-filter {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .filter-group {
            min-width: 100%;
        }
    }
`;

const invoicesStyleSheet = document.createElement('style');
invoicesStyleSheet.textContent = invoicesStyles;
document.head.appendChild(invoicesStyleSheet);