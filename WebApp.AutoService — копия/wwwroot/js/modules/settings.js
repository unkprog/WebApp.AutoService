// Модуль настроек приложения
class SettingsModule {
    constructor() {
        this.name = 'settings';
        this.title = 'Настройки';
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

        const settings = this.loadSettings();

        contentBody.innerHTML = `
            <div class="settings-container">
                <div class="settings-tabs">
                    <div class="tab-header">
                        <button class="tab-btn active" data-tab="general">
                            <i class="fas fa-cog"></i> Общие настройки
                        </button>
                        <button class="tab-btn" data-tab="company">
                            <i class="fas fa-building"></i> Данные компании
                        </button>
                        <button class="tab-btn" data-tab="documents">
                            <i class="fas fa-file-alt"></i> Документы
                        </button>
                        <button class="tab-btn" data-tab="backup">
                            <i class="fas fa-database"></i> Резервное копирование
                        </button>
                        <button class="tab-btn" data-tab="users">
                            <i class="fas fa-users-cog"></i> Пользователи
                        </button>
                    </div>
                    
                    <div class="tab-content">
                        <!-- Общие настройки -->
                        <div class="tab-pane active" id="general-tab">
                            <form id="general-settings-form">
                                <div class="form-group">
                                    <label class="form-label">Название приложения</label>
                                    <input type="text" class="form-control" name="appName" 
                                           value="${settings.appName || 'Автосервис Pro'}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Язык интерфейса</label>
                                    <select class="form-control" name="language">
                                        <option value="ru" ${settings.language === 'ru' ? 'selected' : ''}>Русский</option>
                                        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Валюта</label>
                                    <select class="form-control" name="currency">
                                        <option value="RUB" ${settings.currency === 'RUB' ? 'selected' : ''}>Рубли (₽)</option>
                                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>Доллары ($)</option>
                                        <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Евро (€)</option>
                                    </select>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Ставка НДС (%)</label>
                                            <input type="number" class="form-control" name="taxRate" 
                                                   value="${settings.taxRate || 20}" min="0" max="100" step="0.1">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Часовой пояс</label>
                                            <select class="form-control" name="timezone">
                                                <option value="Europe/Moscow" ${settings.timezone === 'Europe/Moscow' ? 'selected' : ''}>Москва (GMT+3)</option>
                                                <option value="Europe/Kaliningrad" ${settings.timezone === 'Europe/Kaliningrad' ? 'selected' : ''}>Калининград (GMT+2)</option>
                                                <option value="Asia/Yekaterinburg" ${settings.timezone === 'Asia/Yekaterinburg' ? 'selected' : ''}>Екатеринбург (GMT+5)</option>
                                                <option value="Asia/Novosibirsk" ${settings.timezone === 'Asia/Novosibirsk' ? 'selected' : ''}>Новосибирск (GMT+7)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Формат даты</label>
                                    <select class="form-control" name="dateFormat">
                                        <option value="dd.mm.yyyy" ${settings.dateFormat === 'dd.mm.yyyy' ? 'selected' : ''}>ДД.ММ.ГГГГ</option>
                                        <option value="mm/dd/yyyy" ${settings.dateFormat === 'mm/dd/yyyy' ? 'selected' : ''}>ММ/ДД/ГГГГ</option>
                                        <option value="yyyy-mm-dd" ${settings.dateFormat === 'yyyy-mm-dd' ? 'selected' : ''}>ГГГГ-ММ-ДД</option>
                                    </select>
                                </div>
                                
                                <div class="form-check mt-3">
                                    <input type="checkbox" class="form-check-input" name="autoBackup" 
                                           id="autoBackup" ${settings.autoBackup ? 'checked' : ''}>
                                    <label class="form-check-label" for="autoBackup">
                                        Автоматическое резервное копирование
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="emailNotifications" 
                                           id="emailNotifications" ${settings.emailNotifications ? 'checked' : ''}>
                                    <label class="form-check-label" for="emailNotifications">
                                        Email уведомления
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="smsNotifications" 
                                           id="smsNotifications" ${settings.smsNotifications ? 'checked' : ''}>
                                    <label class="form-check-label" for="smsNotifications">
                                        SMS уведомления
                                    </label>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Данные компании -->
                        <div class="tab-pane" id="company-tab">
                            <form id="company-settings-form">
                                <div class="form-group">
                                    <label class="form-label">Название компании *</label>
                                    <input type="text" class="form-control" name="companyName" 
                                           value="${settings.companyName || ''}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Адрес</label>
                                    <textarea class="form-control" name="companyAddress" rows="2">${settings.companyAddress || ''}</textarea>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Телефон</label>
                                            <input type="tel" class="form-control" name="companyPhone" 
                                                   value="${settings.companyPhone || ''}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-control" name="companyEmail" 
                                                   value="${settings.companyEmail || ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">ИНН</label>
                                            <input type="text" class="form-control" name="companyINN" 
                                                   value="${settings.companyINN || ''}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">КПП</label>
                                            <input type="text" class="form-control" name="companyKPP" 
                                                   value="${settings.companyKPP || ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">ОГРН</label>
                                            <input type="text" class="form-control" name="companyOGRN" 
                                                   value="${settings.companyOGRN || ''}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Расчетный счет</label>
                                            <input type="text" class="form-control" name="companyAccount" 
                                                   value="${settings.companyAccount || ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Банк</label>
                                    <input type="text" class="form-control" name="companyBank" 
                                           value="${settings.companyBank || ''}">
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">БИК</label>
                                            <input type="text" class="form-control" name="companyBIK" 
                                                   value="${settings.companyBIK || ''}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Корреспондентский счет</label>
                                            <input type="text" class="form-control" name="companyCorrAccount" 
                                                   value="${settings.companyCorrAccount || ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Директор</label>
                                    <input type="text" class="form-control" name="companyDirector" 
                                           value="${settings.companyDirector || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Главный бухгалтер</label>
                                    <input type="text" class="form-control" name="companyAccountant" 
                                           value="${settings.companyAccountant || ''}">
                                </div>
                            </form>
                        </div>
                        
                        <!-- Настройки документов -->
                        <div class="tab-pane" id="documents-tab">
                            <form id="documents-settings-form">
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Префикс заказ-нарядов</label>
                                            <input type="text" class="form-control" name="workOrderPrefix" 
                                                   value="${settings.workOrderPrefix || 'WO'}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Начальный номер</label>
                                            <input type="number" class="form-control" name="workOrderStart" 
                                                   value="${settings.workOrderStart || 1}" min="1">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Префикс накладных</label>
                                            <input type="text" class="form-control" name="invoicePrefix" 
                                                   value="${settings.invoicePrefix || 'INV'}">
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Начальный номер</label>
                                            <input type="number" class="form-control" name="invoiceStart" 
                                                   value="${settings.invoiceStart || 1}" min="1">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Шаблон печати заказ-наряда</label>
                                    <textarea class="form-control" name="workOrderTemplate" rows="5">${settings.workOrderTemplate || this.getDefaultWorkOrderTemplate()}</textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Шаблон печати накладной</label>
                                    <textarea class="form-control" name="invoiceTemplate" rows="5">${settings.invoiceTemplate || this.getDefaultInvoiceTemplate()}</textarea>
                                </div>
                                
                                <div class="form-check mt-3">
                                    <input type="checkbox" class="form-check-input" name="autoNumbering" 
                                           id="autoNumbering" ${settings.autoNumbering !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="autoNumbering">
                                        Автоматическая нумерация документов
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="printFooter" 
                                           id="printFooter" ${settings.printFooter !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="printFooter">
                                        Печатать подвал на документах
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="printLogo" 
                                           id="printLogo" ${settings.printLogo ? 'checked' : ''}>
                                    <label class="form-check-label" for="printLogo">
                                        Печатать логотип на документах
                                    </label>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Резервное копирование -->
                        <div class="tab-pane" id="backup-tab">
                            <div class="backup-actions">
                                <div class="action-card">
                                    <h4><i class="fas fa-download"></i> Экспорт данных</h4>
                                    <p>Создайте резервную копию всех данных системы</p>
                                    <button class="btn btn-primary" id="export-data-btn">
                                        <i class="fas fa-file-export"></i> Экспортировать данные
                                    </button>
                                </div>
                                
                                <div class="action-card">
                                    <h4><i class="fas fa-upload"></i> Импорт данных</h4>
                                    <p>Восстановите данные из резервной копии</p>
                                    <input type="file" id="import-file" accept=".json" style="display: none;">
                                    <button class="btn btn-outline" id="import-data-btn">
                                        <i class="fas fa-file-import"></i> Выбрать файл
                                    </button>
                                    <button class="btn btn-primary" id="import-confirm-btn" style="display: none;">
                                        <i class="fas fa-check"></i> Импортировать
                                    </button>
                                </div>
                                
                                <div class="action-card">
                                    <h4><i class="fas fa-trash"></i> Очистка данных</h4>
                                    <p>Удалите все данные из системы</p>
                                    <button class="btn btn-danger" id="clear-data-btn">
                                        <i class="fas fa-exclamation-triangle"></i> Очистить все данные
                                    </button>
                                </div>
                            </div>
                            
                            <div class="backup-info mt-4">
                                <h4>Информация о данных</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Клиентов:</span>
                                        <span class="info-value" id="clients-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Автомобилей:</span>
                                        <span class="info-value" id="vehicles-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Заказ-нарядов:</span>
                                        <span class="info-value" id="workorders-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Накладных:</span>
                                        <span class="info-value" id="invoices-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Запчастей:</span>
                                        <span class="info-value" id="parts-count">0</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Услуг:</span>
                                        <span class="info-value" id="services-count">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Пользователи -->
                        <div class="tab-pane" id="users-tab">
                            <div class="users-header">
                                <h4>Пользователи системы</h4>
                                <button class="btn btn-primary" id="add-user-btn">
                                    <i class="fas fa-plus"></i> Добавить пользователя
                                </button>
                            </div>
                            
                            <div class="table-container mt-3">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Логин</th>
                                            <th>Имя</th>
                                            <th>Роль</th>
                                            <th>Email</th>
                                            <th>Последний вход</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-table-body">
                                        <!-- Список пользователей будет заполнен динамически -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn btn-primary" id="save-settings-btn">
                        <i class="fas fa-save"></i> Сохранить все настройки
                    </button>
                    <button class="btn btn-outline" id="reset-settings-btn">
                        <i class="fas fa-undo"></i> Сбросить к значениям по умолчанию
                    </button>
                </div>
            </div>
        `;

        // Заполняем информацию о данных
        this.updateDataInfo();

        // Заполняем таблицу пользователей
        this.loadUsersTable();
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('autoservice_settings');
            return savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            appName: 'Автосервис Pro',
            language: 'ru',
            currency: 'RUB',
            taxRate: 20,
            timezone: 'Europe/Moscow',
            dateFormat: 'dd.mm.yyyy',
            autoBackup: true,
            emailNotifications: true,
            smsNotifications: false,
            companyName: '',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            companyINN: '',
            companyKPP: '',
            companyOGRN: '',
            companyAccount: '',
            companyBank: '',
            companyBIK: '',
            companyCorrAccount: '',
            companyDirector: '',
            companyAccountant: '',
            workOrderPrefix: 'WO',
            workOrderStart: 1,
            invoicePrefix: 'INV',
            invoiceStart: 1,
            workOrderTemplate: this.getDefaultWorkOrderTemplate(),
            invoiceTemplate: this.getDefaultInvoiceTemplate(),
            autoNumbering: true,
            printFooter: true,
            printLogo: false
        };
    }

    getDefaultWorkOrderTemplate() {
        return `Заказ-наряд № {{number}}
Дата: {{date}}
Клиент: {{clientName}}
Автомобиль: {{vehicleInfo}}
Пробег: {{mileage}} км

Выполненные работы:
{{#services}}
- {{name}} ({{quantity}} x {{price}} ₽) = {{total}} ₽
{{/services}}

Использованные запчасти:
{{#parts}}
- {{name}} ({{quantity}} x {{price}} ₽) = {{total}} ₽
{{/parts}}

Итого: {{total}} ₽
Примечания: {{notes}}

Подпись клиента: ________________
Подпись исполнителя: ________________`;
    }

    getDefaultInvoiceTemplate() {
        return `Накладная № {{number}}
Дата: {{date}}
Клиент: {{clientName}}
Адрес: {{clientAddress}}

Позиции:
{{#items}}
{{index}}. {{name}} - {{quantity}} x {{price}} ₽ = {{total}} ₽
{{/items}}

Итого: {{total}} ₽
НДС ({{taxRate}}%): {{tax}} ₽
Всего к оплате: {{totalWithTax}} ₽

Способ оплаты: {{paymentMethod}}
Статус: {{status}}

Подпись: ________________`;
    }

    updateDataInfo() {
        const data = dataManager.data;

        document.getElementById('clients-count').textContent = data.clients?.length || 0;
        document.getElementById('vehicles-count').textContent = data.vehicles?.length || 0;
        document.getElementById('workorders-count').textContent = data.workOrders?.length || 0;
        document.getElementById('invoices-count').textContent = data.invoices?.length || 0;
        document.getElementById('parts-count').textContent = data.parts?.length || 0;
        document.getElementById('services-count').textContent = data.services?.length || 0;
    }

    loadUsersTable() {
        const users = this.getUsers();
        const tbody = document.getElementById('users-table-body');

        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <strong>${user.username}</strong>
                    ${user.isActive !== false ? '' : '<br><small class="text-danger">Не активен</small>'}
                </td>
                <td>${user.name}</td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleText(user.role)}
                    </span>
                </td>
                <td>${user.email || '-'}</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Никогда'}</td>
                <td class="table-actions">
                    <button class="action-btn edit" data-username="${user.username}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.username !== 'admin' ? `
                        <button class="action-btn delete" data-username="${user.username}">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    getUsers() {
        try {
            const savedUsers = localStorage.getItem('autoservice_users');
            return savedUsers ? JSON.parse(savedUsers) : this.getDefaultUsers();
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return this.getDefaultUsers();
        }
    }

    getDefaultUsers() {
        return [
            {
                username: 'admin',
                password: 'admin123',
                name: 'Администратор',
                role: 'admin',
                email: 'admin@autoservice-pro.ru',
                isActive: true,
                created: new Date().toISOString()
            }
        ];
    }

    saveUsers(users) {
        try {
            localStorage.setItem('autoservice_users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
            return false;
        }
    }

    getRoleText(role) {
        const roleMap = {
            'admin': 'Администратор',
            'manager': 'Менеджер',
            'mechanic': 'Механик',
            'accountant': 'Бухгалтер'
        };
        return roleMap[role] || role;
    }

    bindEvents() {
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Кнопка сохранения настроек
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());

        // Кнопка сброса настроек
        document.getElementById('reset-settings-btn')?.addEventListener('click', () => this.resetSettings());

        // Кнопки резервного копирования
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data-btn')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('import-confirm-btn').style.display = 'inline-block';
                document.getElementById('import-data-btn').textContent = `Выбран: ${file.name}`;
            }
        });

        document.getElementById('import-confirm-btn')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-data-btn')?.addEventListener('click', () => this.clearData());

        // Кнопки управления пользователями
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.showUserForm());

        setTimeout(() => {
            document.querySelectorAll('.action-btn.edit[data-username]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const username = e.currentTarget.dataset.username;
                    this.editUser(username);
                });
            });

            document.querySelectorAll('.action-btn.delete[data-username]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const username = e.currentTarget.dataset.username;
                    this.deleteUser(username);
                });
            });
        }, 100);
    }

    switchTab(tabName) {
        // Делаем активной выбранную кнопку вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.classList.add('active');

        // Показываем выбранную панель
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
    }

    saveSettings() {
        try {
            // Собираем настройки со всех форм
            const settings = {};

            // Общие настройки
            const generalForm = document.getElementById('general-settings-form');
            if (generalForm) {
                const formData = new FormData(generalForm);
                Object.assign(settings, Object.fromEntries(formData.entries()));

                // Преобразуем числовые поля
                settings.taxRate = parseFloat(settings.taxRate) || 0;
                settings.autoBackup = generalForm.querySelector('#autoBackup').checked;
                settings.emailNotifications = generalForm.querySelector('#emailNotifications').checked;
                settings.smsNotifications = generalForm.querySelector('#smsNotifications').checked;
            }

            // Данные компании
            const companyForm = document.getElementById('company-settings-form');
            if (companyForm) {
                const formData = new FormData(companyForm);
                Object.assign(settings, Object.fromEntries(formData.entries()));
            }

            // Настройки документов
            const documentsForm = document.getElementById('documents-settings-form');
            if (documentsForm) {
                const formData = new FormData(documentsForm);
                Object.assign(settings, Object.fromEntries(formData.entries()));

                // Преобразуем числовые поля
                settings.workOrderStart = parseInt(settings.workOrderStart) || 1;
                settings.invoiceStart = parseInt(settings.invoiceStart) || 1;
                settings.autoNumbering = documentsForm.querySelector('#autoNumbering').checked;
                settings.printFooter = documentsForm.querySelector('#printFooter').checked;
                settings.printLogo = documentsForm.querySelector('#printLogo').checked;
            }

            // Сохраняем настройки
            localStorage.setItem('autoservice_settings', JSON.stringify(settings));

            showNotification('Настройки сохранены', 'success');
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            showNotification('Ошибка сохранения настроек', 'error');
        }
    }

    resetSettings() {
        showModal({
            title: 'Сброс настроек',
            content: '<p>Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?</p>',
            size: 'sm',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Сбросить',
                    type: 'danger',
                    handler: () => {
                        localStorage.removeItem('autoservice_settings');
                        showNotification('Настройки сброшены', 'success');
                        this.render();
                        closeModal();
                    }
                }
            ]
        });
    }

    exportData() {
        try {
            const data = {
                appData: dataManager.data,
                settings: this.loadSettings(),
                users: this.getUsers(),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `autoservice_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Данные экспортированы', 'success');
        } catch (error) {
            console.error('Ошибка экспорта данных:', error);
            showNotification('Ошибка экспорта данных', 'error');
        }
    }

    importData() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) {
            showNotification('Выберите файл для импорта', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                showModal({
                    title: 'Импорт данных',
                    content: `
                        <p>Вы уверены, что хотите импортировать данные из файла?</p>
                        <div class="import-preview">
                            <strong>Информация о резервной копии:</strong><br>
                            Дата создания: ${new Date(data.exportDate).toLocaleDateString('ru-RU')}<br>
                            Версия: ${data.version || 'Не указана'}<br><br>
                            
                            <strong>Содержимое:</strong><br>
                            Клиентов: ${data.appData?.clients?.length || 0}<br>
                            Автомобилей: ${data.appData?.vehicles?.length || 0}<br>
                            Заказ-нарядов: ${data.appData?.workOrders?.length || 0}<br>
                            Накладных: ${data.appData?.invoices?.length || 0}<br>
                        </div>
                        <div class="form-check mt-3">
                            <input type="checkbox" class="form-check-input" id="import-overwrite">
                            <label class="form-check-label" for="import-overwrite">
                                Перезаписать существующие данные
                            </label>
                        </div>
                    `,
                    size: 'md',
                    buttons: [
                        {
                            text: 'Отмена',
                            type: 'secondary',
                            handler: () => closeModal()
                        },
                        {
                            text: 'Импортировать',
                            type: 'primary',
                            handler: () => {
                                const overwrite = document.getElementById('import-overwrite').checked;
                                this.processImport(data, overwrite);
                            }
                        }
                    ]
                });
            } catch (error) {
                console.error('Ошибка парсинга файла:', error);
                showNotification('Ошибка чтения файла', 'error');
            }
        };

        reader.onerror = () => {
            showNotification('Ошибка чтения файла', 'error');
        };

        reader.readAsText(file);
    }

    processImport(data, overwrite) {
        try {
            if (overwrite) {
                // Полная замена данных
                dataManager.data = data.appData || {};
                localStorage.setItem('autoservice_settings', JSON.stringify(data.settings || {}));
                this.saveUsers(data.users || []);
            } else {
                // Добавление данных (без перезаписи)
                if (data.appData) {
                    Object.keys(data.appData).forEach(key => {
                        if (Array.isArray(data.appData[key])) {
                            dataManager.data[key] = [
                                ...(dataManager.data[key] || []),
                                ...data.appData[key]
                            ];
                        }
                    });
                }
            }

            dataManager.saveData();
            this.updateDataInfo();

            showNotification('Данные успешно импортированы', 'success');
            closeModal();
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            showNotification('Ошибка импорта данных', 'error');
        }
    }

    clearData() {
        showModal({
            title: 'Очистка данных',
            content: `
                <p><strong>ВНИМАНИЕ!</strong> Это действие удалит все данные системы:</p>
                <ul>
                    <li>Всех клиентов</li>
                    <li>Все автомобили</li>
                    <li>Все заказ-наряды</li>
                    <li>Все накладные</li>
                    <li>Все запчасти и услуги</li>
                    <li>Все записи на сервис</li>
                </ul>
                <p>Это действие нельзя отменить!</p>
                <div class="form-group mt-3">
                    <label class="form-label">Введите "УДАЛИТЬ" для подтверждения:</label>
                    <input type="text" class="form-control" id="confirm-delete" placeholder="УДАЛИТЬ">
                </div>
            `,
            size: 'md',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => closeModal()
                },
                {
                    text: 'Очистить все данные',
                    type: 'danger',
                    handler: () => {
                        const confirmInput = document.getElementById('confirm-delete');
                        if (confirmInput.value === 'УДАЛИТЬ') {
                            dataManager.data = {};
                            dataManager.initDefaultData();
                            this.updateDataInfo();
                            showNotification('Все данные очищены', 'success');
                            closeModal();
                        } else {
                            showNotification('Подтверждение неверно', 'error');
                        }
                    }
                }
            ]
        });
    }

    showUserForm(user = null) {
        const isEdit = !!user;
        const title = isEdit ? 'Редактировать пользователя' : 'Добавить пользователя';

        const formHTML = `
            <form id="user-form">
                <div class="form-group">
                    <label class="form-label">Имя пользователя *</label>
                    <input type="text" class="form-control" name="username" 
                           value="${user?.username || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Полное имя *</label>
                    <input type="text" class="form-control" name="name" 
                           value="${user?.name || ''}" required>
                </div>
                
                ${!isEdit ? `
                    <div class="row">
                        <div class="col-12 col-md-6">
                            <div class="form-group">
                                <label class="form-label">Пароль *</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="form-group">
                                <label class="form-label">Подтверждение пароля *</label>
                                <input type="password" class="form-control" name="confirmPassword" required>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="email" 
                                   value="${user?.email || ''}">
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <label class="form-label">Роль *</label>
                            <select class="form-control" name="role" required>
                                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Администратор</option>
                                <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Менеджер</option>
                                <option value="mechanic" ${user?.role === 'mechanic' ? 'selected' : ''}>Механик</option>
                                <option value="accountant" ${user?.role === 'accountant' ? 'selected' : ''}>Бухгалтер</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-check mt-3">
                    <input type="checkbox" class="form-check-input" name="isActive" 
                           id="userActive" ${user?.isActive !== false ? 'checked' : ''}>
                    <label class="form-check-label" for="userActive">
                        Пользователь активен
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
                    text: isEdit ? 'Сохранить' : 'Добавить',
                    type: 'primary',
                    handler: () => this.saveUser(user?.username)
                }
            ]
        });
    }

    saveUser(username = null) {
        const form = document.getElementById('user-form');
        if (!form) return;

        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        userData.isActive = form.querySelector('#userActive').checked;

        // Валидация
        if (!userData.username || !userData.name || !userData.role) {
            showNotification('Заполните обязательные поля', 'error');
            return;
        }

        if (!username && (!userData.password || userData.password !== userData.confirmPassword)) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        const users = this.getUsers();

        if (username) {
            // Обновление существующего пользователя
            const index = users.findIndex(u => u.username === username);
            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                delete users[index].password; // Не сохраняем пароль в форме
                delete users[index].confirmPassword;

                if (this.saveUsers(users)) {
                    showNotification('Пользователь обновлен', 'success');
                    this.loadUsersTable();
                    closeModal();
                }
            }
        } else {
            // Добавление нового пользователя
            const exists = users.some(u => u.username === userData.username);
            if (exists) {
                showNotification('Пользователь с таким логином уже существует', 'error');
                return;
            }

            const newUser = {
                ...userData,
                created: new Date().toISOString(),
                lastLogin: null
            };

            delete newUser.confirmPassword;

            users.push(newUser);

            if (this.saveUsers(users)) {
                showNotification('Пользователь добавлен', 'success');
                this.loadUsersTable();
                closeModal();
            }
        }
    }

    editUser(username) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            this.showUserForm(user);
        }
    }

    deleteUser(username) {
        if (username === 'admin') {
            showNotification('Нельзя удалить администратора', 'error');
            return;
        }

        showModal({
            title: 'Удаление пользователя',
            content: '<p>Вы уверены, что хотите удалить этого пользователя?</p>',
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
                        const users = this.getUsers();
                        const filteredUsers = users.filter(u => u.username !== username);

                        if (this.saveUsers(filteredUsers)) {
                            showNotification('Пользователь удален', 'success');
                            this.loadUsersTable();
                            closeModal();
                        }
                    }
                }
            ]
        });
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    unload() {
        console.log('Settings module unloaded');
    }
}

// Стили для модуля настроек
const settingsStyles = `
    .settings-tabs {
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        overflow: hidden;
    }

    .tab-header {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
        flex-wrap: wrap;
    }

    .tab-btn {
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .tab-btn:hover {
        background-color: #f5f7fa;
        color: var(--primary-color);
    }

    .tab-btn.active {
        color: var(--secondary-color);
        border-bottom-color: var(--secondary-color);
        background-color: #f0f7ff;
    }

    .tab-content {
        padding: 2rem;
    }

    .tab-pane {
        display: none;
    }

    .tab-pane.active {
        display: block;
    }

    .settings-footer {
        margin-top: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .backup-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .action-card {
        background: #f9f9f9;
        border-radius: var(--border-radius);
        padding: 1.5rem;
        border-left: 4px solid var(--secondary-color);
    }

    .action-card h4 {
        margin-top: 0;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .action-card p {
        color: #666;
        margin-bottom: 1rem;
    }

    .backup-info {
        background: #f9f9f9;
        border-radius: var(--border-radius);
        padding: 1.5rem;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e0e0e0;
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .info-label {
        font-weight: 500;
        color: var(--primary-color);
    }

    .info-value {
        font-weight: 600;
        color: var(--secondary-color);
    }

    .users-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .role-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .role-admin {
        background-color: #ffebee;
        color: #d32f2f;
    }

    .role-manager {
        background-color: #e3f2fd;
        color: #1976d2;
    }

    .role-mechanic {
        background-color: #e8f5e9;
        color: #388e3c;
    }

    .role-accountant {
        background-color: #fff3e0;
        color: #f57c00;
    }

    .import-preview {
        background: #f5f7fa;
        padding: 1rem;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        font-size: 0.9rem;
    }

    @media (max-width: 768px) {
        .tab-header {
            flex-direction: column;
        }
        
        .tab-btn {
            border-bottom: 1px solid #e0e0e0;
            border-left: 3px solid transparent;
            justify-content: flex-start;
        }
        
        .tab-btn.active {
            border-left-color: var(--secondary-color);
            border-bottom-color: #e0e0e0;
        }
        
        .tab-content {
            padding: 1rem;
        }
        
        .settings-footer {
            flex-direction: column;
            gap: 1rem;
        }
        
        .backup-actions {
            grid-template-columns: 1fr;
        }
        
        .users-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }
    }
`;

const settingsStyleSheet = document.createElement('style');
settingsStyleSheet.textContent = settingsStyles;
document.head.appendChild(settingsStyleSheet);