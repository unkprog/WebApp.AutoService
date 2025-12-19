// Модуль управления записями на сервис
class AppointmentsModule {
    constructor() {
        this.name = 'appointments';
        this.title = 'Записи';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedDate = this.getTodayDate();
        this.filterStatus = '';
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

        const statuses = ['все', 'запланирован', 'подтвержден', 'выполнен', 'отменен'];

        contentBody.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Записи на сервис</h2>
                    <div class="header-actions">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Дата:</label>
                                <input type="date" class="form-control date-filter" 
                                       id="date-filter" value="${this.selectedDate}">
                            </div>
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
                        </div>
                        <button class="btn btn-primary" id="add-appointment-btn">
                            <i class="fas fa-plus"></i> Новая запись
                        </button>
                    </div>
                </div>
                
                <div class="calendar-view" id="calendar-view">
                    <!-- Календарь будет отображаться здесь -->
                </div>
                
                <div class="table-container mt-4">
                    ${this.isMobileView() ? this.renderMobileList() : this.renderTable()}
                </div>
                ${this.renderPagination()}
            </div>
        `;

        // Рендерим календарь
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('calendar-view');
        if (!calendarContainer) return;

        const appointments = this.getFilteredAppointments();
        const selectedDate = new Date(this.selectedDate);
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();

        // Получаем первый день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Количество дней в месяце
        const daysInMonth = lastDay.getDate();

        // День недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
        const firstDayIndex = firstDay.getDay();

        // Корректируем для недели, начинающейся с понедельника
        const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        // Названия дней недели
        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        // Названия месяцев
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        let calendarHTML = `
            <div class="calendar">
                <div class="calendar-header">
                    <button class="calendar-nav prev-month" id="prev-month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
                    <button class="calendar-nav next-month" id="next-month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-weekdays">
                    ${daysOfWeek.map(day => `<div class="weekday">${day}</div>`).join('')}
                </div>
                
                <div class="calendar-days">
        `;

        // Пустые ячейки до первого дня месяца
        for (let i = 0; i < startDay; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAppointments = appointments.filter(app =>
                app.date.startsWith(dateStr)
            );

            const isToday = dateStr === this.getTodayDate();
            const isSelected = dateStr === this.selectedDate;

            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (dayAppointments.length > 0) dayClass += ' has-appointments';

            calendarHTML += `
                <div class="${dayClass}" data-date="${dateStr}">
                    <div class="day-number">${day}</div>
                    ${dayAppointments.length > 0 ? `
                        <div class="appointments-count">
                            <span class="count-badge">${dayAppointments.length}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;

        // Обработчики для календаря
        this.bindCalendarEvents();
    }

    bindCalendarEvents() {
        // Навигация по месяцам
        document.getElementById('prev-month')?.addEventListener('click', () => {
            const date = new Date(this.selectedDate);
            date.setMonth(date.getMonth() - 1);
            this.selectedDate = date.toISOString().split('T')[0];
            this.render();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            const date = new Date(this.selectedDate);
            date.setMonth(date.getMonth() + 1);
            this.selectedDate = date.toISOString().split('T')[0];
            this.render();
        });

        // Выбор даты
        document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
            day.addEventListener('click', () => {
                this.selectedDate = day.dataset.date;
                this.currentPage = 1;
                this.render();
            });
        });
    }

    getFilteredAppointments() {
        let appointments = dataManager.getAppointments();

        // Фильтрация по дате
        if (this.selectedDate) {
            appointments = appointments.filter(app =>
                app.date.startsWith(this.selectedDate)
            );
        }

        // Фильтрация по статусу
        if (this.filterStatus && this.filterStatus !== 'все') {
            appointments = appointments.filter(app =>
                app.status?.toLowerCase() === this.filterStatus.toLowerCase()
            );
        }

        return appointments;
    }

    renderTable() {
        const appointments = this.getFilteredAppointments();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedAppointments = appointments.slice(start, start + this.itemsPerPage);

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Время</th>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Автомобиль</th>
                        <th>Услуга</th>
                        <th>Статус</th>
                        <th>Механик</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedAppointments.map(appointment => {
            const isPast = this.isPastAppointment(appointment);

            return `
                            <tr class="${isPast ? 'table-secondary' : ''}">
                                <td class="text-nowrap">
                                    ${this.formatTime(appointment.date)}
                                    <br>
                                    <small class="text-muted">${this.formatDate(appointment.date)}</small>
                                </td>
                                <td>
                                    <strong>${appointment.clientName || '-'}</strong>
                                    ${appointment.email ? `<br><small>${appointment.email}</small>` : ''}
                                </td>
                                <td>${appointment.clientPhone || '-'}</td>
                                <td>${appointment.vehicleInfo || '-'}</td>
                                <td>${appointment.service || '-'}</td>
                                <td>
                                    <span class="status-badge status-${appointment.status || 'scheduled'}">
                                        ${this.getStatusText(appointment.status)}
                                    </span>
                                </td>
                                <td>${appointment.mechanic || '-'}</td>
                                <td class="table-actions">
                                    <button class="action-btn view" data-id="${appointment.id}" title="Просмотр">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${appointment.id}" title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn confirm" data-id="${appointment.id}" title="Подтвердить">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="action-btn cancel" data-id="${appointment.id}" title="Отменить">
                                        <i class="fas fa-times"></i>
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
        const appointments = this.getFilteredAppointments();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedAppointments = appointments.slice(start, start + this.itemsPerPage);

        return `
            <div class="mobile-data-list">
                ${paginatedAppointments.map(appointment => {
            const isPast = this.isPastAppointment(appointment);

            return `
                        <div class="data-item ${isPast ? 'past-appointment' : ''}">
                            <div class="data-row">
                                <span class="data-label">Время:</span>
                                <span class="data-value">
                                    <strong>${this.formatTime(appointment.date)}</strong>
                                    <br><small>${this.formatDate(appointment.date)}</small>
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Клиент:</span>
                                <span class="data-value">
                                    <strong>${appointment.clientName || '-'}</strong>
                                    <br><small>${appointment.clientPhone || ''}</small>
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Автомобиль:</span>
                                <span class="data-value">${appointment.vehicleInfo || '-'}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Услуга:</span>
                                <span class="data-value">${appointment.service || '-'}</span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Статус:</span>
                                <span class="data-value">
                                    <span class="status-badge status-${appointment.status || 'scheduled'}">
                                        ${this.getStatusText(appointment.status)}
                                    </span>
                                </span>
                            </div>
                            <div class="data-row">
                                <span class="data-label">Действия:</span>
                                <span class="data-value">
                                    <button class="action-btn view" data-id="${appointment.id}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${appointment.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn confirm" data-id="${appointment.id}">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="action-btn cancel" data-id="${appointment.id}">
                                        <i class="fas fa-times"></i>
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
        const appointments = this.getFilteredAppointments();
        const totalItems = appointments.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="window.app.modules.appointments.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                    <button class="page-btn ${this.currentPage === page ? 'active' : ''}"
                            onclick="window.app.modules.appointments.changePage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="window.app.modules.appointments.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    bindEvents() {
        // Кнопка создания записи
        document.getElementById('add-appointment-btn')?.addEventListener('click', () => this.showAppointmentForm());

        // Фильтры
        document.getElementById('date-filter')?.addEventListener('change', (e) => {
            this.selectedDate = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        document.getElementById('status-filter')?.addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        // Обработчики кнопок действий
        setTimeout(() => {
            document.querySelectorAll('.action-btn.view').forEach(btn => {
                btn.addEventListener('click', (e) => this.viewAppointment(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => this.editAppointment(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.confirm').forEach(btn => {
                btn.addEventListener('click', (e) => this.confirmAppointment(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.action-btn.cancel').forEach(btn => {
                btn.addEventListener('click', (e) => this.cancelAppointment(e.currentTarget.dataset.id));
            });
        }, 100);
    }

    showAppointmentForm(appointment = null) {
        const isEdit = !!appointment;
        const title = isEdit ? 'Редактировать запись' : 'Новая запись';

        const clients = dataManager.getClients();
        const vehicles = dataManager.getVehicles();
        const services = dataManager.getServices();
        const mechanics = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Васильев В.В.'];

        const formHTML = `
            <form id="appointment-form">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Дата и время *</label>
                            <input type="datetime-local" class="form-control" name="dateTime" 
                                   value="${appointment?.date ? this.formatDateTimeLocal(appointment.date) : this.getDateTimeNow()}" 
                                   required>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Продолжительность (минуты)</label>
                            <input type="number" class="form-control" name="duration" 
                                   value="${appointment?.duration || 60}" min="15" step="15">
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
                                    <option value="${client.id}" ${appointment?.clientId === client.id ? 'selected' : ''}>
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
                                    <option value="${vehicle.id}" ${appointment?.vehicleId === vehicle.id ? 'selected' : ''}>
                                        ${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Услуга *</label>
                    <select class="form-control" name="serviceId" required>
                        <option value="">Выберите услугу</option>
                        ${services.map(service => `
                            <option value="${service.id}" ${appointment?.serviceId === service.id ? 'selected' : ''}>
                                ${service.name} (${service.duration || 60} мин) - ${this.formatCurrency(service.price)}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Механик</label>
                            <select class="form-control" name="mechanic">
                                <option value="">Не назначен</option>
                                ${mechanics.map(mechanic => `
                                    <option value="${mechanic}" ${appointment?.mechanic === mechanic ? 'selected' : ''}>
                                        ${mechanic}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Статус</label>
                            <select class="form-control" name="status">
                                <option value="scheduled" ${appointment?.status === 'scheduled' ? 'selected' : ''}>Запланирован</option>
                                <option value="confirmed" ${appointment?.status === 'confirmed' ? 'selected' : ''}>Подтвержден</option>
                                <option value="completed" ${appointment?.status === 'completed' ? 'selected' : ''}>Выполнен</option>
                                <option value="cancelled" ${appointment?.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Примечания</label>
                    <textarea class="form-control" name="notes" rows="3">${appointment?.notes || ''}</textarea>
                </div>

                <div class="form-check mt-3">
                    <input type="checkbox" class="form-check-input" name="sendNotification" 
                           id="sendNotification" checked>
                    <label class="form-check-label" for="sendNotification">
                        Отправить уведомление клиенту
                    </label>
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
                    text: isEdit ? 'Сохранить' : 'Создать',
                    type: 'primary',
                    handler: () => this.saveAppointment(appointment?.id)
                }
            ]
        });
    }

    saveAppointment(id = null) {
        const form = document.getElementById('appointment-form');
        if (!form) return;

        const formData = new FormData(form);
        const appointmentData = Object.fromEntries(formData.entries());

        // Преобразуем дату и время
        const dateTime = new Date(appointmentData.dateTime);
        appointmentData.date = dateTime.toISOString();
        appointmentData.duration = parseInt(appointmentData.duration) || 60;

        // Получаем информацию о клиенте и услуге
        const clients = dataManager.getClients();
        const services = dataManager.getServices();
        const vehicles = dataManager.getVehicles();

        const client = clients.find(c => c.id === appointmentData.clientId);
        const service = services.find(s => s.id === appointmentData.serviceId);
        const vehicle = vehicles.find(v => v.id === appointmentData.vehicleId);

        if (client) {
            appointmentData.clientName = client.name;
            appointmentData.clientPhone = client.phone;
            appointmentData.clientEmail = client.email;
        }

        if (service) {
            appointmentData.service = service.name;
            appointmentData.servicePrice = service.price;
        }

        if (vehicle) {
            appointmentData.vehicleInfo = `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;
        }

        // Валидация
        if (!appointmentData.clientId || !appointmentData.serviceId) {
            showNotification('Заполните обязательные поля: клиент и услуга', 'error');
            return;
        }

        if (id) {
            // Обновление существующей записи
            const success = dataManager.updateAppointment(id, appointmentData);
            if (success) {
                showNotification('Запись обновлена', 'success');
                this.render();
                closeModal();
            }
        } else {
            // Создание новой записи
            const newAppointment = dataManager.addAppointment(appointmentData);
            if (newAppointment) {
                showNotification('Запись создана', 'success');
                this.render();
                closeModal();
            }
        }
    }

    viewAppointment(id) {
        const appointments = dataManager.getAppointments();
        const appointment = appointments.find(a => a.id === id);

        if (!appointment) return;

        const viewHTML = `
            <div class="appointment-detail">
                <div class="detail-header">
                    <h3>Запись на сервис</h3>
                    <p class="appointment-time">
                        <i class="far fa-calendar"></i> ${this.formatDate(appointment.date)}
                        <i class="far fa-clock ml-3"></i> ${this.formatTime(appointment.date)}
                    </p>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12 col-md-6">
                        <h4>Информация о клиенте</h4>
                        <div class="detail-item">
                            <strong>Клиент:</strong> ${appointment.clientName || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Телефон:</strong> ${appointment.clientPhone || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong> ${appointment.clientEmail || '-'}
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <h4>Детали записи</h4>
                        <div class="detail-item">
                            <strong>Статус:</strong> 
                            <span class="status-badge status-${appointment.status || 'scheduled'}">
                                ${this.getStatusText(appointment.status)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <strong>Автомобиль:</strong> ${appointment.vehicleInfo || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Механик:</strong> ${appointment.mechanic || 'Не назначен'}
                        </div>
                        <div class="detail-item">
                            <strong>Продолжительность:</strong> ${appointment.duration || 60} мин
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h4>Услуга</h4>
                    <div class="service-info">
                        <strong>${appointment.service || '-'}</strong>
                        ${appointment.servicePrice ? `
                            <div class="service-price">
                                Стоимость: ${this.formatCurrency(appointment.servicePrice)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${appointment.notes ? `
                    <div class="mt-4">
                        <h4>Примечания</h4>
                        <div class="notes-box">
                            ${appointment.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        showModal({
            title: 'Детали записи',
            content: viewHTML,
            size: 'md',
            buttons: [
                {
                    text: 'Закрыть',
                    type: 'secondary',
                    handler: () => closeModal()
                }
            ]
        });
    }

    editAppointment(id) {
        const appointments = dataManager.getAppointments();
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
            this.showAppointmentForm(appointment);
        }
    }

    confirmAppointment(id) {
        const success = dataManager.updateAppointmentStatus(id, 'confirmed');
        if (success) {
            showNotification('Запись подтверждена', 'success');
            this.render();
        }
    }

    cancelAppointment(id) {
        showModal({
            title: 'Отмена записи',
            content: `
                <form id="cancel-form">
                    <div class="form-group">
                        <label class="form-label">Причина отмены *</label>
                        <textarea class="form-control" name="reason" rows="3" required></textarea>
                    </div>
                    <div class="form-check mt-3">
                        <input type="checkbox" class="form-check-input" name="sendNotification" 
                               id="cancelNotification" checked>
                        <label class="form-check-label" for="cancelNotification">
                            Уведомить клиента
                        </label>
                    </div>
                </form>
            `,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Подтвердить отмену',
                    type: 'danger',
                    handler: () => {
                        const form = document.getElementById('cancel-form');
                        if (!form) return;

                        const formData = new FormData(form);
                        const cancelData = Object.fromEntries(formData.entries());

                        const success = dataManager.updateAppointmentStatus(id, 'cancelled', cancelData.reason);
                        if (success) {
                            showNotification('Запись отменена', 'success');
                            this.render();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    isPastAppointment(appointment) {
        const appointmentDate = new Date(appointment.date);
        const now = new Date();
        return appointmentDate < now;
    }

    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    getDateTimeNow() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    formatDateTimeLocal(dateString) {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    formatTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    getStatusText(status) {
        const statusMap = {
            'scheduled': 'Запланирован',
            'confirmed': 'Подтвержден',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusMap[status?.toLowerCase()] || status || 'Запланирован';
    }

    changePage(page) {
        const appointments = this.getFilteredAppointments();
        const totalPages = Math.ceil(appointments.length / this.itemsPerPage);

        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    unload() {
        console.log('Appointments module unloaded');
    }
}

// Добавляем методы в DataManager
DataManager.prototype.getAppointments = function () {
    return this.data.appointments || [];
};

DataManager.prototype.addAppointment = function (appointment) {
    appointment.id = this.generateId();
    appointment.createdAt = new Date().toISOString();
    if (!this.data.appointments) {
        this.data.appointments = [];
    }
    this.data.appointments.push(appointment);
    this.saveData();
    return appointment;
};

DataManager.prototype.updateAppointment = function (id, updates) {
    if (!this.data.appointments) return false;

    const index = this.data.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
        this.data.appointments[index] = { ...this.data.appointments[index], ...updates };
        this.saveData();
        return true;
    }
    return false;
};

DataManager.prototype.updateAppointmentStatus = function (id, status, reason = '') {
    if (!this.data.appointments) return false;

    const index = this.data.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
        this.data.appointments[index].status = status;
        if (reason) {
            this.data.appointments[index].cancellationReason = reason;
        }
        this.saveData();
        return true;
    }
    return false;
};

// Стили для модуля записей
const appointmentsStyles = `
    .calendar-view {
        margin-bottom: 2rem;
    }

    .calendar {
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        padding: 1rem;
    }

    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .calendar-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--primary-color);
    }

    .calendar-nav {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: var(--secondary-color);
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
    }

    .calendar-nav:hover {
        background-color: #f5f7fa;
    }

    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
        margin-bottom: 10px;
    }

    .weekday {
        text-align: center;
        font-weight: 600;
        color: var(--primary-color);
        padding: 0.5rem 0;
        font-size: 0.9rem;
    }

    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
    }

    .calendar-day {
        aspect-ratio: 1;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        padding: 5px;
    }

    .calendar-day:hover {
        background-color: #f5f7fa;
        transform: translateY(-2px);
    }

    .calendar-day.empty {
        background-color: #f9f9f9;
        border: none;
        cursor: default;
    }

    .calendar-day.empty:hover {
        background-color: #f9f9f9;
        transform: none;
    }

    .calendar-day.today {
        background-color: #e3f2fd;
        border-color: var(--secondary-color);
    }

    .calendar-day.selected {
        background-color: var(--secondary-color);
        color: white;
        border-color: var(--secondary-color);
    }

    .calendar-day.has-appointments {
        border-color: #ff9800;
    }

    .day-number {
        font-weight: 600;
        font-size: 1rem;
    }

    .appointments-count {
        position: absolute;
        top: 2px;
        right: 2px;
    }

    .count-badge {
        background-color: #ff9800;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .appointment-detail .detail-header {
        text-align: center;
        border-bottom: 2px solid #eee;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }

    .appointment-detail .appointment-time {
        color: #666;
        font-size: 1rem;
    }

    .appointment-detail h4 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .appointment-detail .detail-item {
        margin-bottom: 0.8rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #eee;
    }

    .appointment-detail .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .service-info {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: var(--border-radius);
        border-left: 4px solid var(--secondary-color);
    }

    .service-price {
        margin-top: 0.5rem;
        font-size: 1.1rem;
        color: var(--success-color);
        font-weight: 600;
    }

    .past-appointment {
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        .calendar-weekdays,
        .calendar-days {
            gap: 2px;
        }
        
        .weekday {
            font-size: 0.8rem;
            padding: 0.3rem 0;
        }
        
        .day-number {
            font-size: 0.9rem;
        }
        
        .filters-row {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }
        
        .filter-group {
            width: 100%;
        }
    }
`;

const appointmentsStyleSheet = document.createElement('style');
appointmentsStyleSheet.textContent = appointmentsStyles;
document.head.appendChild(appointmentsStyleSheet);