// Модуль управления автомобилями
class VehiclesModule {
    constructor() {
        this.name = 'vehicles';
        this.title = 'Автомобили';
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

        const vehicles = dataManager.getVehicles();

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Список автомобилей</h2>
                    <button class="btn btn-primary" id="add-vehicle-btn">
                        <i class="fas fa-plus"></i> Добавить автомобиль
                    </button>
                </div>
                <div class="table-container">
                    ${this.isMobileView() ? this.renderMobileList(vehicles) : this.renderTable(vehicles)}
                </div>
                ${this.renderPagination(vehicles.length)}
            </div>
        `;
    }

    renderTable(vehicles) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedVehicles = vehicles.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Марка</th>
                        <th>Модель</th>
                        <th>Год</th>
                        <th>VIN</th>
                        <th>Гос. номер</th>
                        <th>Владелец</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedVehicles.map(vehicle => `
                        <tr>
                            <td>${vehicle.brand || ''}</td>
                            <td>${vehicle.model || ''}</td>
                            <td>${vehicle.year || ''}</td>
                            <td>${vehicle.vin || ''}</td>
                            <td>${vehicle.licensePlate || ''}</td>
                            <td>${vehicle.ownerName || ''}</td>
                            <td class="table-actions">
                                <button class="action-btn edit" data-id="${vehicle.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${vehicle.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderMobileList(vehicles) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedVehicles = vehicles.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedVehicles.map(vehicle => `
                    <div class="data-item">
                        <div class="data-row">
                            <span class="data-label">Марка/Модель:</span>
                            <span class="data-value">${vehicle.brand || ''} ${vehicle.model || ''}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Гос. номер:</span>
                            <span class="data-value">${vehicle.licensePlate || ''}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Владелец:</span>
                            <span class="data-value">${vehicle.ownerName || ''}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Действия:</span>
                            <span class="data-value">
                                <button class="action-btn edit" data-id="${vehicle.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete" data-id="${vehicle.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.vehicles.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.vehicles.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.vehicles.changePage(${this.currentPage + 1})">
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
        const addBtn = document.getElementById('add-vehicle-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showVehicleForm());
        }

        // Кнопки редактирования
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editVehicle(id);
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteVehicle(id);
            });
        });
    }

    showVehicleForm(vehicle = null) {
        const isEdit = !!vehicle;
        const title = isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль';

        const formHTML = `
            <form id="vehicle-form">
                <div class="form-group">
                    <label class="form-label">Марка</label>
                    <input type="text" class="form-control" name="brand" 
                           value="${vehicle?.brand || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Модель</label>
                    <input type="text" class="form-control" name="model" 
                           value="${vehicle?.model || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Год выпуска</label>
                    <input type="number" class="form-control" name="year" 
                           value="${vehicle?.year || ''}" min="1900" max="${new Date().getFullYear()}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">VIN номер</label>
                    <input type="text" class="form-control" name="vin" 
                           value="${vehicle?.vin || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Гос. номер</label>
                    <input type="text" class="form-control" name="licensePlate" 
                           value="${vehicle?.licensePlate || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Цвет</label>
                    <input type="text" class="form-control" name="color" 
                           value="${vehicle?.color || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Пробег</label>
                    <input type="number" class="form-control" name="mileage" 
                           value="${vehicle?.mileage || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Владелец</label>
                    <input type="text" class="form-control" name="ownerName" 
                           value="${vehicle?.ownerName || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Телефон владельца</label>
                    <input type="tel" class="form-control" name="ownerPhone" 
                           value="${vehicle?.ownerPhone || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Примечания</label>
                    <textarea class="form-control" name="notes" rows="3">${vehicle?.notes || ''}</textarea>
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
                    handler: () => this.saveVehicle(vehicle?.id)
                }
            ]
        });
    }

    saveVehicle(id = null) {
        const form = document.getElementById('vehicle-form');
        if (!form) return;

        const formData = new FormData(form);
        const vehicleData = Object.fromEntries(formData.entries());

        // Валидация
        if (!vehicleData.brand || !vehicleData.model) {
            showNotification('Заполните обязательные поля: марка и модель', 'error');
            return;
        }

        if (id) {
            // Обновление существующего
            const success = dataManager.updateVehicle(id, vehicleData);
            if (success) {
                showNotification('Автомобиль обновлен', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Добавление нового
            const newVehicle = dataManager.addVehicle(vehicleData);
            if (newVehicle) {
                showNotification('Автомобиль добавлен', 'success');
                this.render();
                closeModal();
            }
        }
    }

    editVehicle(id) {
        const vehicles = dataManager.getVehicles();
        const vehicle = vehicles.find(v => v.id === id);
        if (vehicle) {
            this.showVehicleForm(vehicle);
        }
    }

    deleteVehicle(id) {
        showModal({
            title: 'Удаление автомобиля',
            content: '<p>Вы уверены, что хотите удалить этот автомобиль?</p>',
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
                        const success = dataManager.deleteVehicle(id);
                        if (success) {
                            showNotification('Автомобиль удален', 'success');
                            this.render();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    changePage(page) {
        const totalItems = dataManager.getVehicles().length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    unload() {
        // Очистка ресурсов при разгрузке модуля
        console.log('Vehicles module unloaded');
    }
}