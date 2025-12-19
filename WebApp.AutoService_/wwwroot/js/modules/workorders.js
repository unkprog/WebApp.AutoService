// Модуль управления заказ-нарядами
class WorkOrdersModule {
    constructor() {
        this.name = 'workorders';
        this.title = 'Заказ-наряды';
        this.currentPage = 1;
        this.itemsPerPage = 10;
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

        const workOrders = dataManager.getWorkOrders();

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Заказ-наряды</h2>
                    <div>
                        <button class="btn btn-outline" id="print-workorders-btn">
                            <i class="fas fa-print"></i> Печать
                        </button>
                        <button class="btn btn-primary" id="add-workorder-btn">
                            <i class="fas fa-plus"></i> Создать
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    ${this.isMobileView() ? this.renderMobileList(workOrders) : this.renderTable(workOrders)}
                </div>
                ${this.renderPagination(workOrders.length)}
            </div>
        `;
    }

    renderTable(workOrders) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedOrders = workOrders.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Дата</th>
                        <th>Автомобиль</th>
                        <th>Клиент</th>
                        <th>Статус</th>
                        <th>Сумма</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedOrders.map(order => `
                        <tr>
                            <td>${order.number}</td>
                            <td>${this.formatDate(order.createdAt)}</td>
                            <td>${order.vehicleInfo || ''}</td>
                            <td>${order.clientName || ''}</td>
                            <td>
                                <span class="status-badge status-${order.status || 'new'}">
                                    ${this.getStatusText(order.status)}
                                </span>
                            </td>
                            <td>${this.formatCurrency(order.total || 0)}</td>
                            <td class="table-actions">
                                <button class="action-btn view" data-id="${order.id}" title="Просмотр">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" data-id="${order.id}" title="Редактировать">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn print" data-id="${order.id}" title="Печать">
                                    <i class="fas fa-print"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderMobileList(workOrders) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedOrders = workOrders.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedOrders.map(order => `
                    <div class="data-item">
                        <div class="data-row">
                            <span class="data-label">№ наряда:</span>
                            <span class="data-value">${order.number}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Дата:</span>
                            <span class="data-value">${this.formatDate(order.createdAt)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Клиент:</span>
                            <span class="data-value">${order.clientName || ''}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Статус:</span>
                            <span class="data-value status-badge status-${order.status || 'new'}">
                                ${this.getStatusText(order.status)}
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Сумма:</span>
                            <span class="data-value">${this.formatCurrency(order.total || 0)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Действия:</span>
                            <span class="data-value">
                                <button class="action-btn view" data-id="${order.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" data-id="${order.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn print" data-id="${order.id}">
                                    <i class="fas fa-print"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPagination(totalItems) {
        // Аналогично VehiclesModule
        return '';
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    formatDate(dateString) {
        if (!dateString) return '';
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
            'new': 'Новый',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    bindEvents() {
        // Кнопка создания
        const addBtn = document.getElementById('add-workorder-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showWorkOrderForm());
        }

        // Кнопка печати списка
        const printBtn = document.getElementById('print-workorders-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printWorkOrders());
        }

        // Другие обработчики...
    }

    showWorkOrderForm(order = null) {
        const isEdit = !!order;
        const title = isEdit ? 'Редактировать заказ-наряд' : 'Создать заказ-наряд';

        const vehicles = dataManager.getVehicles();
        const clients = dataManager.getClients();
        const services = dataManager.getServices();
        const parts = dataManager.getParts();

        const formHTML = `
            <form id="workorder-form">
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label class="form-label">Клиент</label>
                            <select class="form-control" name="clientId" required>
                                <option value="">Выберите клиента</option>
                                ${clients.map(client => `
                                    <option value="${client.id}" ${order?.clientId === client.id ? 'selected' : ''}>
                                        ${client.name} - ${client.phone}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group">
                            <label class="form-label">Автомобиль</label>
                            <select class="form-control" name="vehicleId" required>
                                <option value="">Выберите автомобиль</option>
                                ${vehicles.map(vehicle => `
                                    <option value="${vehicle.id}" ${order?.vehicleId === vehicle.id ? 'selected' : ''}>
                                        ${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card mt-3">
                    <div class="card-header">
                        <h4>Услуги</h4>
                        <button type="button" class="btn btn-sm btn-outline" id="add-service-btn">
                            <i class="fas fa-plus"></i> Добавить услугу
                        </button>
                    </div>
                    <div class="card-body" id="services-container">
                        <!-- Список услуг будет добавляться динамически -->
                    </div>
                </div>

                <div class="card mt-3">
                    <div class="card-header">
                        <h4>Запчасти</h4>
                        <button type="button" class="btn btn-sm btn-outline" id="add-part-btn">
                            <i class="fas fa-plus"></i> Добавить запчасть
                        </button>
                    </div>
                    <div class="card-body" id="parts-container">
                        <!-- Список запчастей будет добавляться динамически -->
                    </div>
                </div>

                <div class="form-group mt-3">
                    <label class="form-label">Примечания</label>
                    <textarea class="form-control" name="notes" rows="3">${order?.notes || ''}</textarea>
                </div>
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
                    handler: () => this.saveWorkOrder(order?.id)
                }
            ]
        });

        // Инициализация динамических полей
        this.initServiceRows();
        this.initPartRows();
    }

    initServiceRows() {
        const container = document.getElementById('services-container');
        const addBtn = document.getElementById('add-service-btn');

        addBtn.addEventListener('click', () => {
            const services = dataManager.getServices();
            const serviceSelect = `
                <select class="form-control service-select">
                    <option value="">Выберите услугу</option>
                    ${services.map(service => `
                        <option value="${service.id}" data-price="${service.price}">
                            ${service.name} - ${this.formatCurrency(service.price)}
                        </option>
                    `).join('')}
                </select>
            `;

            const row = document.createElement('div');
            row.className = 'row mb-2';
            row.innerHTML = `
                <div class="col-6">
                    ${serviceSelect}
                </div>
                <div class="col-4">
                    <input type="number" class="form-control quantity" value="1" min="1">
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger remove-row">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            container.appendChild(row);

            // Обработчик изменения услуги
            const select = row.querySelector('.service-select');
            select.addEventListener('change', (e) => {
                this.calculateTotal();
            });

            // Обработчик удаления строки
            row.querySelector('.remove-row').addEventListener('click', () => {
                row.remove();
                this.calculateTotal();
            });
        });
    }

    calculateTotal() {
        // Расчет общей суммы
        let total = 0;

        // Сумма услуг
        document.querySelectorAll('#services-container .row').forEach(row => {
            const select = row.querySelector('.service-select');
            const quantity = row.querySelector('.quantity').value;
            const price = select.selectedOptions[0]?.dataset.price || 0;
            total += price * quantity;
        });

        // Сумма запчастей
        document.querySelectorAll('#parts-container .row').forEach(row => {
            const select = row.querySelector('.part-select');
            const quantity = row.querySelector('.quantity').value;
            const price = select.selectedOptions[0]?.dataset.price || 0;
            total += price * quantity;
        });

        // Обновление отображения суммы
        const totalElement = document.querySelector('.modal-total');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    printWorkOrders() {
        const workOrders = dataManager.getWorkOrders();

        const printContent = `
            <div class="print-document">
                <div class="print-header">
                    <h1>Список заказ-нарядов</h1>
                    <p>Дата печати: ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
                
                <div class="print-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата</th>
                                <th>Клиент</th>
                                <th>Автомобиль</th>
                                <th>Статус</th>
                                <th>Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workOrders.map(order => `
                                <tr>
                                    <td>${order.number}</td>
                                    <td>${this.formatDate(order.createdAt)}</td>
                                    <td>${order.clientName || ''}</td>
                                    <td>${order.vehicleInfo || ''}</td>
                                    <td>${this.getStatusText(order.status)}</td>
                                    <td>${this.formatCurrency(order.total || 0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="print-footer">
                    <p>Всего заказ-нарядов: ${workOrders.length}</p>
                    <p>Общая сумма: ${this.formatCurrency(workOrders.reduce((sum, o) => sum + (o.total || 0), 0))}</p>
                </div>
            </div>
        `;

        printDocument(printContent, 'Список заказ-нарядов');
    }

    // Другие методы...
}