// Основной модуль приложения
class AutoServiceApp {
    constructor() {
        this.currentModule = null;
        this.modules = {};
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        // Инициализация приложения
        console.log('Автосервис Pro инициализирован');

        // Регистрация модулей
        this.registerModules();

        // Инициализация маршрутизатора
        if (typeof Router !== 'undefined') {
            this.router = new Router(this);
        }

        // Обработка ресайза окна
        window.addEventListener('resize', this.handleResize.bind(this));

        // Инициализация мобильного меню
        this.initMobileMenu();

        // Инициализация основного меню
        this.initMainMenu();

        // Открываем активный раздел меню
        setTimeout(() => this.openActiveMenuSection(), 100);
    }

    registerModules() {
        // Регистрация всех модулей
        this.modules = {
            dashboard: typeof DashboardModule !== 'undefined' ? new DashboardModule() : null,
            vehicles: typeof VehiclesModule !== 'undefined' ? new VehiclesModule() : null,
            clients: typeof ClientsModule !== 'undefined' ? new ClientsModule() : null,
            services: typeof ServicesModule !== 'undefined' ? new ServicesModule() : null,
            parts: typeof PartsModule !== 'undefined' ? new PartsModule() : null,
            workorders: typeof WorkOrdersModule !== 'undefined' ? new WorkOrdersModule() : null,
            invoices: typeof InvoicesModule !== 'undefined' ? new InvoicesModule() : null,
            appointments: typeof AppointmentsModule !== 'undefined' ? new AppointmentsModule() : null,
            settings: typeof SettingsModule !== 'undefined' ? new SettingsModule() : null
        };
    }

    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (this.isMobile &&
                !sidebar.contains(e.target) &&
                !mobileMenuBtn.contains(e.target) &&
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }

    initMainMenu() {
        // Добавляем обработчики для меню
        const menuHeaders = document.querySelectorAll('.menu-header');

        menuHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSubmenu(header);
            });
        });

        // Закрытие подменю при клике вне меню
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-section')) {
                this.closeAllSubmenus();
            }
        });
    }

    toggleSubmenu(header) {
        const menuSection = header.closest('.menu-section');
        const submenu = menuSection.querySelector('.submenu');
        const chevron = header.querySelector('i:last-child');

        if (!submenu) return;

        const isOpen = submenu.classList.contains('open');

        // Закрываем все другие подменю
        this.closeAllSubmenus();

        // Открываем/закрываем текущее
        if (!isOpen) {
            submenu.classList.add('open');
            menuSection.classList.add('active');
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }
        }
    }

    closeAllSubmenus() {
        const allSubmenus = document.querySelectorAll('.submenu');
        const allHeaders = document.querySelectorAll('.menu-header');
        const allSections = document.querySelectorAll('.menu-section');

        allSubmenus.forEach(submenu => {
            submenu.classList.remove('open');
        });

        allHeaders.forEach(header => {
            const chevron = header.querySelector('i:last-child');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        });

        allSections.forEach(section => {
            section.classList.remove('active');
        });
    }

    openActiveMenuSection() {
        const activeMenuItem = document.querySelector('.menu-item.active');
        if (activeMenuItem) {
            const menuSection = activeMenuItem.closest('.menu-section');
            if (menuSection) {
                const submenu = menuSection.querySelector('.submenu');
                const header = menuSection.querySelector('.menu-header');
                const chevron = header?.querySelector('i:last-child');

                if (submenu) {
                    submenu.classList.add('open');
                    menuSection.classList.add('active');
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                }
            }
        }
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;

        if (!this.isMobile) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('active');
        }
    }

    async loadModule(moduleName) {
        try {
            // Скрыть предыдущий модуль
            if (this.currentModule && this.currentModule.unload) {
                this.currentModule.unload();
            }

            // Загрузить новый модуль
            const module = this.modules[moduleName];
            if (module && module.load) {
                this.currentModule = module;
                await module.load();

                // Обновить активный пункт меню
                this.updateActiveMenuItem(moduleName);

                // Обновить заголовок страницы
                this.updatePageTitle(module.getTitle ? module.getTitle() : moduleName);
            }
        } catch (error) {
            console.error('Ошибка загрузки модуля:', error);
            this.showError('Не удалось загрузить модуль');
        }
    }

    updateActiveMenuItem(moduleName) {
        // Убрать активный класс у всех пунктов меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Добавить активный класс текущему пункту меню
        const activeItem = document.querySelector(`.menu-item[href="#/${moduleName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Открыть соответствующий раздел меню
        const menuSection = activeItem?.closest('.menu-section');
        if (menuSection) {
            const submenu = menuSection.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'block';
                const chevron = menuSection.querySelector('.menu-header i:last-child');
                if (chevron) {
                    chevron.style.transform = 'rotate(180deg)';
                }
            }
        }
    }

    updatePageTitle(title) {
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = this.capitalizeFirstLetter(title);
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    showError(message) {
        if (typeof showNotification !== 'undefined') {
            showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (typeof showNotification !== 'undefined') {
            showNotification(message, 'success');
        } else {
            alert(message);
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AutoServiceApp();
});