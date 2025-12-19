// Модуль управления клиентами
class ClientsModule {
    constructor() {
        this.name = 'clients';
        this.title = 'Клиенты';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
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

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Клиенты</h2>
                    <div class="header-actions">
                        <div class="search-box">
                            <input type="text" 
                                   class="form-control search-input" 
                                   placeholder="Поиск клиентов..."
                                   value="${this.searchTerm}">
                            <i class="fas fa-search"></i>
                        </div>
                        <button class="btn btn-primary" id="add-client-btn">
                            <i class="fas fa-plus"></i> Добавить клиента
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

    getFilteredClients() {
        let clients = dataManager.getClients();

        // Поиск
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            clients = clients.filter(client =>
                (client.name && client.name.toLowerCase().includes(term)) ||
                (client.phone && client.phone.includes(term)) ||
                (client.email && client.email.toLowerCase().includes(term))
            );
        }

        return clients;
    }

    renderTable() {
        const clients = this.getFilteredClients();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedClients = clients.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Автомобили</th>
                        <th>Последнее посещение</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedClients.map(client => `
                        <tr>
                            <td>
                                <div class="client-name">
                                    <strong>${client.name || 'Не указано'}</strong>
                                    <small class="text-muted">${client.id}</small>
                                </div>
                            </td>
                            <td>${client.phone || '-'}</td>
                            <td>${client.email || '-'}</td>
                            <td>${this.getClientVehiclesCount(client.id)}</td>
                            <td>${this.formatDate(client.lastVisit)}</td>
                            <td class="table-actions">
                                <button class="action-btn view" data-id="${client.id}" title="Просмотр">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" data-id="${client.id}" title="Редактировать">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${client.id}" title="Удалить">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderMobileList() {
        const clients = this.getFilteredClients();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedClients = clients.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedClients.map(client => `
                    <div class="data-item">
                        <div class="data-row">
                            <span class="data-label">Клиент:</span>
                            <span class="data-value">
                                <strong>${client.name || 'Не указано'}</strong>
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Телефон:</span>
                            <span class="data-value">${client.phone || '-'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Email:</span>
                            <span class="data-value">${client.email || '-'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Автомобилей:</span>
                            <span class="data-value">${this.getClientVehiclesCount(client.id)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Действия:</span>
                            <span class="data-value">
                                <button class="action-btn view" data-id="${client.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" data-id="${client.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${client.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPagination() {
        const clients = this.getFilteredClients();
        const totalItems = clients.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.clients.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.clients.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.clients.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    getClientVehiclesCount(clientId) {
        const vehicles = dataManager.getVehicles();
        return vehicles.filter(v => v.ownerId === clientId).length;
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    bindEvents() {
        // Кнопка добавления
        document.getElementById('add-client-btn')?.addEventListener('click', () => this.showClientForm());

        // Поиск
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.render();
            });
        }

        // Обработчики кнопок действий
        setTimeout(() => {
            document.querySelectorAll('.action-btn.view').forEach(btn => {
                btn.addEventListener('click', (e) => this.viewClient(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editClient(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteClient(e.currentTarget.dataset.id));
            });
        }, 100);
    }

    showClientForm(client = null) {
        const isEdit = !!client;
        const title = isEdit ? 'Редактировать клиента' : 'Добавить клиента';

        const formHTML = `
            <form id="client-form">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Фамилия</label>
                            <input type="text" class="form-control" name="lastName" 
                                   value="${client?.lastName || ''}" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Имя</label>
                            <input type="text" class="form-control" name="firstName" 
                                   value="${client?.firstName || ''}" required>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Отчество</label>
                            <input type="text" class="form-control" name="middleName" 
                                   value="${client?.middleName || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Дата рождения</label>
                            <input type="date" class="form-control" name="birthDate" 
                                   value="${client?.birthDate || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Телефон</label>
                    <input type="tel" class="form-control" name="phone" 
                           value="${client?.phone || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" 
                           value="${client?.email || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Адрес</label>
                    <textarea class="form-control" name="address" rows="2">${client?.address || ''}</textarea>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Паспорт серия</label>
                            <input type="text" class="form-control" name="passportSeries" 
                                   value="${client?.passportSeries || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Паспорт номер</label>
                            <input type="text" class="form-control" name="passportNumber" 
                                   value="${client?.passportNumber || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Примечания</label>
                    <textarea class="form-control" name="notes" rows="3">${client?.notes || ''}</textarea>
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
                    handler: () => this.saveClient(client?.id)
                }
            ]
        });
    }

    saveClient(id = null) {
        const form = document.getElementById('client-form');
        if (!form) return;

        const formData = new FormData(form);
        const clientData = Object.fromEntries(formData.entries());

        // Формируем полное имя
        clientData.name = `${clientData.lastName || ''} ${clientData.firstName || ''} ${clientData.middleName || ''}`.trim();

        // Валидация
        if (!clientData.firstName || !clientData.lastName || !clientData.phone) {
            showNotification('Заполните обязательные поля: ФИО и телефон', 'error');
            return;
        }

        if (id) {
            // Обновление существующего
            const success = dataManager.updateClient(id, clientData);
            if (success) {
                showNotification('Клиент обновлен', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Добавление нового
            const newClient = dataManager.addClient(clientData);
            if (newClient) {
                showNotification('Клиент добавлен', 'success');
                this.render();
                closeModal();
            }
        }
    }

    viewClient(id) {
        const clients = dataManager.getClients();
        const client = clients.find(c => c.id === id);
        const vehicles = dataManager.getVehicles().filter(v => v.ownerId === id);
        const workOrders = dataManager.getWorkOrders().filter(wo => wo.clientId === id);

        if (!client) return;

        const viewHTML = `
            <div class="client-detail">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <h4>Основная информация</h4>
                        <div class="detail-item">
                            <strong>ФИО:</strong> ${client.name || 'Не указано'}
                        </div>
                        <div class="detail-item">
                            <strong>Телефон:</strong> ${client.phone || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong> ${client.email || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Адрес:</strong> ${client.address || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Дата рождения:</strong> ${client.birthDate ? this.formatDate(client.birthDate) : '-'}
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <h4>Паспортные данные</h4>
                        <div class="detail-item">
                            <strong>Серия/Номер:</strong> 
                            ${client.passportSeries || '-'} / ${client.passportNumber || '-'}
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <h4>Автомобили (${vehicles.length})</h4>
                    ${vehicles.length > 0 ? `
                        <div class="table-container mt-2">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Марка/Модель</th>
                                        <th>Гос. номер</th>
                                        <th>VIN</th>
                                        <th>Год</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${vehicles.map(vehicle => `
                                        <tr>
                                            <td>${vehicle.brand} ${vehicle.model}</td>
                                            <td>${vehicle.licensePlate || '-'}</td>
                                            <td>${vehicle.vin || '-'}</td>
                                            <td>${vehicle.year || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">Нет автомобилей</p>'}
                </div>

                <div class="mt-4">
                    <h4>История заказов (${workOrders.length})</h4>
                    ${workOrders.length > 0 ? `
                        <div class="table-container mt-2">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>№ заказа</th>
                                        <th>Дата</th>
                                        <th>Автомобиль</th>
                                        <th>Сумма</th>
                                        <th>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${workOrders.map(order => `
                                        <tr>
                                            <td>${order.number}</td>
                                            <td>${this.formatDate(order.createdAt)}</td>
                                            <td>${order.vehicleInfo || '-'}</td>
                                            <td>${this.formatCurrency(order.total || 0)}</td>
                                            <td>
                                                <span class="status-badge status-${order.status || 'new'}">
                                                    ${this.getStatusText(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">Нет заказов</p>'}
                </div>

                ${client.notes ? `
                    <div class="mt-4">
                        <h4>Примечания</h4>
                        <div class="notes-box">
                            ${client.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        showModal({
            title: `Клиент: ${client.name}`,
            content: viewHTML,
            size: 'lg',
            buttons: [
                {
                    text: 'Закрыть',
                    type: 'secondary',
                    handler: () => closeModal()
                }
            ]
        });
    }

    editClient(id) {
        const clients = dataManager.getClients();
        const client = clients.find(c => c.id === id);
        if (client) {
            this.showClientForm(client);
        }
    }

    deleteClient(id) {
        showModal({
            title: 'Удаление клиента',
            content: '<p>Вы уверены, что хотите удалить этого клиента? Все связанные автомобили и заказы будут сохранены.</p>',
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
                        const success = dataManager.deleteClient(id);
                        if (success) {
                            showNotification('Клиент удален', 'success');
                            this.render();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    changePage(page) {
        const clients = this.getFilteredClients();
        const totalPages = Math.ceil(clients.length / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
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
            'new': 'Новый',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    unload() {
        console.log('Clients module unloaded');
    }
}

// Добавляем методы в DataManager
DataManager.prototype.updateClient = function (id, updates) {
    const index = this.data.clients.findIndex(c => c.id === id);
    if (index !== -1) {
        this.data.clients[index] = { ...this.data.clients[index], ...updates };
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.deleteClient = function (id) {
    const index = this.data.clients.findIndex(c => c.id === id);
    if (index !== -1) {
        this.data.clients.splice(index, 1);
        this.saveData();
        return true;
    }
    return false;
};

// Стили для модуля клиентов
const clientStyles = `
    .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
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

    .client-name small {
        display: block;
        font-size: 0.8rem;
        color: #999;
    }

    .client-detail .detail-item {
        margin-bottom: 0.8rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #eee;
    }

    .client-detail .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .client-detail h4 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .notes-box {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: var(--border-radius);
        border-left: 4px solid var(--secondary-color);
    }

    @media (max-width: 768px) {
        .header-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
        }
        
        .search-box {
            width: 100%;
        }
    }
`;

const clientStyleSheet = document.createElement('style');
clientStyleSheet.textContent = clientStyles;
document.head.appendChild(clientStyleSheet);