// Модуль дашборда (главная страница)
class DashboardModule {
    constructor() {
        this.name = 'dashboard';
        this.title = 'Дашборд';
    }

    async load() {
        this.addStyles();
        this.render();
        this.bindEvents();
        this.loadStats();
    }

    getTitle() {
        return this.title;
    }

    addStyles() {
        // Добавляем стили только если они еще не добавлены
        if (!document.querySelector('#dashboard-styles')) {
            const dashboardStyles = `
                .stat-card {
                    border-radius: var(--border-radius);
                    padding: 1.5rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    transition: var(--transition);
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }

                .stat-card.bg-primary { background: linear-gradient(135deg, #3498db, #2980b9); }
                .stat-card.bg-success { background: linear-gradient(135deg, #27ae60, #219653); }
                .stat-card.bg-warning { background: linear-gradient(135deg, #f39c12, #e67e22); }
                .stat-card.bg-danger { background: linear-gradient(135deg, #e74c3c, #c0392b); }

                .stat-icon {
                    font-size: 2.5rem;
                    margin-right: 1rem;
                    opacity: 0.8;
                }

                .stat-info h3 {
                    margin: 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                }

                .stat-info p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 0.9rem;
                }

                .appointment-item {
                    display: flex;
                    align-items: center;
                    padding: 0.8rem;
                    border-bottom: 1px solid #eee;
                    transition: var(--transition);
                }

                .appointment-item:hover {
                    background-color: #f9f9f9;
                }

                .appointment-item:last-child {
                    border-bottom: none;
                }

                .appointment-time {
                    background: #f5f7fa;
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    margin-right: 1rem;
                    min-width: 70px;
                    text-align: center;
                }

                .appointment-time i {
                    margin-right: 5px;
                }

                .appointment-info {
                    flex: 1;
                }

                .appointment-info strong {
                    display: block;
                    font-size: 0.95rem;
                }

                .appointment-info small {
                    color: #666;
                    font-size: 0.85rem;
                }

                .appointment-status {
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-scheduled { background-color: #e3f2fd; color: #1976d2; }
                .status-confirmed { background-color: #e8f5e9; color: #388e3c; }
                .status-completed { background-color: #f1f8e9; color: #689f38; }
                .status-cancelled { background-color: #ffebee; color: #d32f2f; }

                .stock-item {
                    display: flex;
                    align-items: center;
                    padding: 0.8rem;
                    border-bottom: 1px solid #eee;
                }

                .stock-item:last-child {
                    border-bottom: none;
                }

                .stock-info {
                    flex: 1;
                }

                .stock-info strong {
                    display: block;
                    font-size: 0.95rem;
                }

                .stock-info small {
                    color: #666;
                    font-size: 0.85rem;
                }

                .stock-alert {
                    color: #f39c12;
                    font-size: 1.2rem;
                }

                .chart-container {
                    position: relative;
                    height: 300px;
                    width: 100%;
                }

                @media (max-width: 768px) {
                    .stat-card {
                        padding: 1rem;
                    }
                    
                    .stat-icon {
                        font-size: 2rem;
                    }
                    
                    .stat-info h3 {
                        font-size: 1.5rem;
                    }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'dashboard-styles';
            styleSheet.textContent = dashboardStyles;
            document.head.appendChild(styleSheet);
        }
    }

    render() {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;

        contentBody.innerHTML = `
            <div class="dashboard-container">
                <!-- Статистика -->
                <div class="row">
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="stat-card bg-primary">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="total-clients">0</h3>
                                <p>Клиентов</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="stat-card bg-success">
                            <div class="stat-icon">
                                <i class="fas fa-car"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="total-vehicles">0</h3>
                                <p>Автомобилей</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="stat-card bg-warning">
                            <div class="stat-icon">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="total-workorders">0</h3>
                                <p>Активных заказов</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="stat-card bg-danger">
                            <div class="stat-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="total-revenue">0 ₽</h3>
                                <p>Выручка (месяц)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Графики и таблицы -->
                <div class="row mt-4">
                    <div class="col-12 col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Последние заказ-наряды</h3>
                                <a href="#/workorders" class="btn btn-sm btn-outline">Все заказы</a>
                            </div>
                            <div class="card-body">
                                <div class="table-container">
                                    <table class="table" id="recent-workorders">
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
                                            <!-- Заполнится динамически -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12 col-lg-4">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Предстоящие записи</h3>
                                <a href="#/appointments" class="btn btn-sm btn-outline">Все записи</a>
                            </div>
                            <div class="card-body">
                                <div class="appointments-list" id="upcoming-appointments">
                                    <!-- Заполнится динамически -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mt-4">
                            <div class="card-header">
                                <h3 class="card-title">Низкий остаток</h3>
                                <a href="#/parts" class="btn btn-sm btn-outline">Все запчасти</a>
                            </div>
                            <div class="card-body">
                                <div class="low-stock-list" id="low-stock-parts">
                                    <!-- Заполнится динамически -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- График выручки -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Выручка по месяцам</h3>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline active" data-period="month">Месяц</button>
                                    <button class="btn btn-sm btn-outline" data-period="quarter">Квартал</button>
                                    <button class="btn btn-sm btn-outline" data-period="year">Год</button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="revenue-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadStats() {
        const stats = dataManager.getStats();

        // Обновляем статистику
        document.getElementById('total-clients').textContent = stats.totalClients;
        document.getElementById('total-vehicles').textContent = stats.totalVehicles;
        document.getElementById('total-workorders').textContent = this.getActiveWorkOrdersCount();
        document.getElementById('total-revenue').textContent = this.formatCurrency(this.getMonthlyRevenue());

        // Загружаем последние заказ-наряды
        this.loadRecentWorkOrders();

        // Загружаем предстоящие записи
        this.loadUpcomingAppointments();

        // Загружаем запчасти с низким остатком
        this.loadLowStockParts();

        // Инициализируем график
        this.initRevenueChart();
    }

    getActiveWorkOrdersCount() {
        const workOrders = dataManager.getWorkOrders();
        return workOrders.filter(order => order.status === 'в работе' || order.status === 'new').length;
    }

    getMonthlyRevenue() {
        const invoices = dataManager.getInvoices();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate.getMonth() === currentMonth &&
                    invoiceDate.getFullYear() === currentYear;
            })
            .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    }

    loadRecentWorkOrders() {
        const workOrders = dataManager.getWorkOrders()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const tableBody = document.querySelector('#recent-workorders tbody');
        if (tableBody) {
            tableBody.innerHTML = workOrders.map(order => `
                <tr>
                    <td>${order.number || ''}</td>
                    <td>${this.formatDate(order.createdAt)}</td>
                    <td>${order.clientName || ''}</td>
                    <td>${order.vehicleInfo || ''}</td>
                    <td>
                        <span class="status-badge status-${order.status || 'new'}">
                            ${this.getStatusText(order.status)}
                        </span>
                    </td>
                    <td>${this.formatCurrency(order.total || 0)}</td>
                </tr>
            `).join('');
        }
    }

    loadUpcomingAppointments() {
        const appointments = dataManager.getAppointments()
            .filter(app => {
                const appDate = new Date(app.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return appDate >= today && app.status !== 'cancelled';
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        const container = document.getElementById('upcoming-appointments');
        if (container) {
            container.innerHTML = appointments.length > 0 ?
                appointments.map(app => `
                    <div class="appointment-item">
                        <div class="appointment-time">
                            <i class="far fa-clock"></i>
                            ${this.formatTime(app.date)}
                        </div>
                        <div class="appointment-info">
                            <strong>${app.clientName || ''}</strong>
                            <small>${app.vehicleInfo || ''}</small>
                        </div>
                        <div class="appointment-status status-${app.status || 'scheduled'}">
                            ${this.getAppointmentStatusText(app.status)}
                        </div>
                    </div>
                `).join('') :
                '<p class="text-muted text-center">Нет предстоящих записей</p>';
        }
    }

    loadLowStockParts() {
        const parts = dataManager.getParts()
            .filter(part => part.stock <= part.minStock)
            .slice(0, 5);

        const container = document.getElementById('low-stock-parts');
        if (container) {
            container.innerHTML = parts.length > 0 ?
                parts.map(part => `
                    <div class="stock-item">
                        <div class="stock-info">
                            <strong>${part.name}</strong>
                            <small>Остаток: ${part.stock} / Мин: ${part.minStock}</small>
                        </div>
                        <div class="stock-alert">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                `).join('') :
                '<p class="text-muted text-center">Все запчасти в наличии</p>';
        }
    }

    initRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Данные для графика (пример)
        const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const data = labels.map(() => Math.floor(Math.random() * 1000000) + 500000);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Выручка (₽)',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Выручка: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });

        // Обработчики для переключения периода
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Здесь можно обновить данные графика
            });
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    formatTime(dateString) {
        if (!dateString) return '';
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
            'new': 'Новый',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    getAppointmentStatusText(status) {
        const statusMap = {
            'scheduled': 'Запланирован',
            'confirmed': 'Подтвержден',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    bindEvents() {
        // Обработчики событий для дашборда
    }

    unload() {
        // Очистка ресурсов
        console.log('Dashboard module unloaded');
    }
}