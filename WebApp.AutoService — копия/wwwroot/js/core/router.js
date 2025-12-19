// Простой маршрутизатор для SPA
class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            'dashboard': 'dashboard',
            'vehicles': 'vehicles',
            'clients': 'clients',
            'services': 'services',
            'parts': 'parts',
            'workorders': 'workorders',
            'invoices': 'invoices',
            'appointments': 'appointments',
            'settings': 'settings',
            'reports/finance': 'dashboard',
            'reports/services': 'dashboard',
            'reports/stock': 'dashboard'
        };

        this.init();
    }

    init() {
        // Обработка изменения hash
        window.addEventListener('hashchange', this.handleHashChange.bind(this));

        // Обработка загрузки страницы
        window.addEventListener('load', this.handleHashChange.bind(this));

        // Обработка кликов по ссылкам
        document.addEventListener('click', this.handleLinkClick.bind(this));
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1) || '/dashboard';
        const path = hash.startsWith('/') ? hash.substring(1) : hash;

        // Найти соответствующий модуль
        let moduleName = this.routes[path];

        if (!moduleName) {
            // Попробовать найти по первому сегменту пути
            const firstSegment = path.split('/')[0];
            moduleName = this.routes[firstSegment] || 'dashboard';
        }

        // Загрузить модуль
        if (this.app && this.app.loadModule) {
            this.app.loadModule(moduleName);
        }
    }

    handleLinkClick(e) {
        // Обработка кликов по ссылкам с hash
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');

            if (href !== window.location.hash) {
                window.location.hash = href;
            }

            // Закрыть мобильное меню
            if (window.app.isMobile) {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.remove('active');
            }
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    getCurrentPath() {
        return window.location.hash.substring(2) || 'dashboard';
    }
}