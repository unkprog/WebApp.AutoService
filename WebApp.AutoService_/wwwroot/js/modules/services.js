// Модуль управления услугами
class ServicesModule {
    constructor() {
        this.name = 'services';
        this.title = 'Услуги';
        this.currentPage = 1;
        this.itemsPerPage = 10;
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
                    <h2 class="card-title">Услуги</h2>
                    <div class="header-actions">
                        <div class="filter-box">
                            <select class="form-control filter-select" id="category-filter">
                                <option value="">Все категории</option>
                                ${categories.map(cat => `
                                    <option value="${cat}" ${this.filterCategory === cat ? 'selected' : ''}>
                                        ${cat}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <button class="btn btn-primary" id="add-service-btn">
                            <i class="fas fa-plus"></i> Добавить услугу
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

    getFilteredServices() {
        let services = dataManager.getServices();

        // Фильтрация по категории
        if (this.filterCategory) {
            services = services.filter(service => service.category === this.filterCategory);
        }

        return services;
    }

    getCategories() {
        const services = dataManager.getServices();
        const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
        return categories.sort();
    }

    renderTable() {
        const services = this.getFilteredServices();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedServices = services.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Наименование</th>
                        <th>Категория</th>
                        <th>Описание</th>
                        <th>Цена (₽)</th>
                        <th>Длительность</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedServices.map(service => `
                        <tr>
                            <td>
                                <strong>${service.name || ''}</strong>
                                ${service.code ? `<br><small class="text-muted">Код: ${service.code}</small>` : ''}
                            </td>
                            <td>${service.category || '-'}</td>
                            <td>${service.description ? this.truncateText(service.description, 50) : '-'}</td>
                            <td class="text-nowrap">${this.formatCurrency(service.price || 0)}</td>
                            <td>${service.duration ? `${service.duration} мин` : '-'}</td>
                            <td class="table-actions">
                                <button class="action-btn edit" data-id="${service.id}" title="Редактировать">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${service.id}" title="Удалить">
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
        const services = this.getFilteredServices();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedServices = services.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedServices.map(service => `
                    <div class="data-item">
                        <div class="data-row">
                            <span class="data-label">Услуга:</span>
                            <span class="data-value">
                                <strong>${service.name || ''}</strong>
                                ${service.code ? `<br><small>Код: ${service.code}</small>` : ''}
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Категория:</span>
                            <span class="data-value">${service.category || '-'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Цена:</span>
                            <span class="data-value">${this.formatCurrency(service.price || 0)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Длительность:</span>
                            <span class="data-value">${service.duration ? `${service.duration} мин` : '-'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Действия:</span>
                            <span class="data-value">
                                <button class="action-btn edit" data-id="${service.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${service.id}">
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
        const services = this.getFilteredServices();
        const totalItems = services.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.services.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.services.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.services.changePage(${this.currentPage + 1})">
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
        document.getElementById('add-service-btn')?.addEventListener('click', () => this.showServiceForm());

        // Фильтр по категории
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        // Обработчики кнопок действий
        setTimeout(() => {
            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editService(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteService(e.currentTarget.dataset.id));
            });
        }, 100);
    }

    showServiceForm(service = null) {
        const isEdit = !!service;
        const title = isEdit ? 'Редактировать услугу' : 'Добавить услугу';

        const categories = this.getCategories();

        const formHTML = `
            <form id="service-form">
                <div class="form-group">
                    <label class="form-label">Наименование услуги *</label>
                    <input type="text" class="form-control" name="name" 
                           value="${service?.name || ''}" required>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Код услуги</label>
                            <input type="text" class="form-control" name="code" 
                                   value="${service?.code || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Категория</label>
                            <input type="text" class="form-control" name="category" 
                                   value="${service?.category || ''}" list="category-list">
                            <datalist id="category-list">
                                ${categories.map(cat => `<option value="${cat}">`).join('')}
                            </datalist>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Цена (₽) *</label>
                            <input type="number" class="form-control" name="price" 
                                   value="${service?.price || ''}" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Длительность (минуты)</label>
                            <input type="number" class="form-control" name="duration" 
                                   value="${service?.duration || ''}" min="1">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="form-control" name="description" rows="3">${service?.description || ''}</textarea>
                </div>
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Стоимость материалов (₽)</label>
                            <input type="number" class="form-control" name="materialCost" 
                                   value="${service?.materialCost || ''}" min="0" step="0.01">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Норма времени (часы)</label>
                            <input type="number" class="form-control" name="standardTime" 
                                   value="${service?.standardTime || ''}" min="0" step="0.1">
                        </div>
                    </div>
                </div>
                
                <div class="form-check mt-3">
                    <input type="checkbox" class="form-check-input" name="isActive" 
                           id="isActive" ${service?.isActive !== false ? 'checked' : ''}>
                    <label class="form-check-label" for="isActive">Услуга активна</label>
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
                    handler: () => this.saveService(service?.id)
                }
            ]
        });
    }

    saveService(id = null) {
        const form = document.getElementById('service-form');
        if (!form) return;

        const formData = new FormData(form);
        const serviceData = Object.fromEntries(formData.entries());

        // Преобразуем числовые поля
        serviceData.price = parseFloat(serviceData.price) || 0;
        serviceData.duration = serviceData.duration ? parseInt(serviceData.duration) : null;
        serviceData.materialCost = serviceData.materialCost ? parseFloat(serviceData.materialCost) : 0;
        serviceData.standardTime = serviceData.standardTime ? parseFloat(serviceData.standardTime) : null;
        serviceData.isActive = form.querySelector('#isActive').checked;

        // Валидация
        if (!serviceData.name || serviceData.price <= 0) {
            showNotification('Заполните обязательные поля: название и цена', 'error');
            return;
        }

        if (id) {
            // Обновление существующего
            const success = dataManager.updateService(id, serviceData);
            if (success) {
                showNotification('Услуга обновлена', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Добавление новой
            const newService = dataManager.addService(serviceData);
            if (newService) {
                showNotification('Услуга добавлена', 'success');
                this.render();
                closeModal();
            }
        }
    }

    editService(id) {
        const services = dataManager.getServices();
        const service = services.find(s => s.id === id);
        if (service) {
            this.showServiceForm(service);
        }
    }

    deleteService(id) {
        // Проверяем, используется ли услуга в заказ-нарядах
        const workOrders = dataManager.getWorkOrders();
        const isUsed = workOrders.some(order =>
            order.services?.some(s => s.serviceId === id)
        );

        const message = isUsed ?
            'Эта услуга используется в заказ-нарядах. Удаление приведет к их изменению. Продолжить?' :
            'Вы уверены, что хотите удалить эту услугу?';

        showModal({
            title: 'Удаление услуги',
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
                        const success = dataManager.deleteService(id);
                        if (success) {
                            showNotification('Услуга удалена', 'success');
                            this.render();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    changePage(page) {
        const services = this.getFilteredServices();
        const totalPages = Math.ceil(services.length / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    unload() {
        console.log('Services module unloaded');
    }
}

// Добавляем методы в DataManager
DataManager.prototype.addService = function (service) {
    service.id = this.generateId();
    service.createdAt = new Date().toISOString();
    this.data.services.push(service);
    this.saveData();
    return service;
};

DataManager.prototype.updateService = function (id, updates) {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index !== -1) {
        this.data.services[index] = { ...this.data.services[index], ...updates };
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.deleteService = function (id) {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index !== -1) {
        this.data.services.splice(index, 1);
        this.saveData();
        return true;
    }
    return false;
};

// Стили для модуля услуг
const serviceStyles = `
    .filter-box {
        min-width: 200px;
    }

    .filter-select {
        height: 42px;
    }

    @media (max-width: 768px) {
        .header-actions {
            flex-direction: column;
            gap: 1rem;
        }
        
        .filter-box {
            width: 100%;
        }
    }
`;

const serviceStyleSheet = document.createElement('style');
serviceStyleSheet.textContent = serviceStyles;
document.head.appendChild(serviceStyleSheet);