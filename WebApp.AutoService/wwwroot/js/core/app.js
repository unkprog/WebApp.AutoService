// Application state
const AppState = {
    currentPage: '/',
    events: [],
    isMenuOpen: false,
    isMonitorOpen: false,
    user: {
        name: 'John Doe',
        initials: 'JD',
        avatarColor: '#616161'
    }
};

// Page content templates
const PageTemplates = {
    dashboard: {
        title: 'Дашборд',
        content: `
                                <div class="content-card">
                                    <h2>Welcome back, ${AppState.user.name}!</h2>
                                    <p>This is your dashboard where you can get an overview of your application.</p>
                                    <p>Use the navigation menu to access different sections of the application.</p>
                                </div>
                                <div class="content-grid">
                                    <div class="grid-item">
                                        <h3>Quick Stats</h3>
                                        <p>Users: 1,254</p>
                                        <p>Products: 342</p>
                                        <p>Orders: 89</p>
                                    </div>
                                    <div class="grid-item">
                                        <h3>Recent Activity</h3>
                                        <p>New user registration: 5</p>
                                        <p>Product updates: 12</p>
                                        <p>Support tickets: 3</p>
                                    </div>
                                    <div class="grid-item">
                                        <h3>Performance</h3>
                                        <p>Page load: 1.2s</p>
                                        <p>Uptime: 99.8%</p>
                                        <p>API response: 240ms</p>
                                    </div>
                                </div>
                            `
    },
    'products-list': {
        title: 'All Products',
        content: `
                                <div class="content-card">
                                    <h2>Product Management</h2>
                                    <p>Manage your product catalog from this section. You can add, edit, or remove products.</p>
                                </div>
                                <div class="content-grid">
                                    <div class="grid-item">
                                        <h3>Electronics</h3>
                                        <p>Smartphones: 45 items</p>
                                        <p>Laptops: 32 items</p>
                                        <p>Accessories: 89 items</p>
                                    </div>
                                    <div class="grid-item">
                                        <h3>Home & Garden</h3>
                                        <p>Furniture: 67 items</p>
                                        <p>Decorations: 124 items</p>
                                        <p>Tools: 45 items</p>
                                    </div>
                                    <div class="grid-item">
                                        <h3>Clothing</h3>
                                        <p>Men's: 89 items</p>
                                        <p>Women's: 112 items</p>
                                        <p>Children's: 56 items</p>
                                    </div>
                                </div>
                            `
    },
    'products-add': {
        title: 'Add New Product',
        content: `
                                <div class="content-card">
                                    <h2>Add New Product</h2>
                                    <p>Use this form to add a new product to your catalog.</p>
                                    <div style="margin-top: 20px;">
                                        <div style="margin-bottom: 16px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Product Name</label>
                                            <input type="text" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;">
                                        </div>
                                        <div style="margin-bottom: 16px;">
                                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Description</label>
                                            <textarea style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; min-height: 100px;"></textarea>
                                        </div>
                                        <button style="background-color: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">Add Product</button>
                                    </div>
                                </div>
                            `
    },
    'products-categories': {
        title: 'Product Categories',
        content: `
                                <div class="content-card">
                                    <h2>Product Categories</h2>
                                    <p>Manage your product categories from this section.</p>
                                </div>
                            `
    },
    'analytics-overview': {
        title: 'Analytics Overview',
        content: `
                                <div class="content-card">
                                    <h2>Analytics Overview</h2>
                                    <p>View your application analytics and metrics.</p>
                                </div>
                            `
    },
    'analytics-reports': {
        title: 'Analytics Reports',
        content: `
                                <div class="content-card">
                                    <h2>Analytics Reports</h2>
                                    <p>Generate and view detailed analytics reports.</p>
                                </div>
                            `
    },
    'analytics-export': {
        title: 'Export Data',
        content: `
                                <div class="content-card">
                                    <h2>Export Data</h2>
                                    <p>Export your analytics data in various formats.</p>
                                </div>
                            `
    },
    settings: {
        title: 'Settings',
        content: `
                                <div class="content-card">
                                    <h2>Application Settings</h2>
                                    <p>Configure your application settings from this section.</p>
                                </div>
                            `
    },
    help: {
        title: 'Help & Support',
        content: `
                                <div class="content-card">
                                    <h2>Help & Support</h2>
                                    <p>Get help and support for using the application.</p>
                                </div>
                            `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
                                <div class="content-card">
                                    <h2>Privacy Policy</h2>
                                    <p>This is our privacy policy content.</p>
                                </div>
                            `
    },
    terms: {
        title: 'Terms of Service',
        content: `
                                <div class="content-card">
                                    <h2>Terms of Service</h2>
                                    <p>These are our terms of service.</p>
                                </div>
                            `
    },
    contact: {
        title: 'Contact Us',
        content: `
                                <div class="content-card">
                                    <h2>Contact Us</h2>
                                    <p>Get in touch with us through this page.</p>
                                </div>
                            `
    }
};

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    contentArea: document.getElementById('contentArea'),
    pageTitle: document.getElementById('pageTitle'),
    pageContent: document.getElementById('pageContent'),
    navLinks: document.querySelectorAll('.nav-link'),
    submenuParents: document.querySelectorAll('.has-submenu'),
};


// Initialize the application
async function initApp() {
    // Initialize loading indicator
    const { default: LoadingIndicator } = await import("/js/core/loadingIndicator.js");
    const loadingIndicator = new LoadingIndicator();
    // Show loading indicator
    //loadingIndicator.show();

    // Initialize content loader
    const { default: ContentLoader } = await import("/js/core/contentLoader.js");
    const contentLoader = new ContentLoader();

    // Initialize router
    const { default: Router } = await import("/js/core/router.js");
    const router = new Router(async (hash) => {
        loadPage(hash, (hash == '/' ? '' : await contentLoader.loadCached(`/js/app${hash}.html`, elements.contentArea)));
        return true;
    });

    // Initialize event monitor
    const { default: EventMonitor } = await import("/js/core/eventMonitor.js");
    const eventMonitor = new EventMonitor();

    //*** // Setup routes
    //*** router.addRoute('/', () => loadPage('dashboard'));
    //*** router.addRoute('/products/list', () => loadPage('products-list'));
    //*** router.addRoute('/products/add', () => loadPage('products-add'));
    //*** router.addRoute('/products/categories', () => loadPage('products-categories'));
    //*** router.addRoute('/analytics/overview', () => loadPage('analytics-overview'));
    //*** router.addRoute('/analytics/reports', () => loadPage('analytics-reports'));
    //*** router.addRoute('/analytics/export', () => loadPage('analytics-export'));
    //*** router.addRoute('/settings', () => loadPage('settings'));
    //*** router.addRoute('/help', () => loadPage('help'));
    //*** router.addRoute('/privacy', () => loadPage('privacy'));
    //*** router.addRoute('/terms', () => loadPage('terms'));
    //*** router.addRoute('/contact', () => loadPage('contact'));

    // Load page function
    function loadPage(hash, content, immediate = false) {
        if (AppState.currentPage === hash) return;

        // Show loading indicator
        loadingIndicator.show();

        // Update active nav link
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            //const linkPage = link.getAttribute('data-page');
            const href = link.getAttribute('href').substring(1);
            if (href === hash) {
                link.classList.add('active');

                // Expand parent menu if this is a submenu item
                const parentItem = link.closest('.submenu')?.closest('.has-submenu');
                if (parentItem) {
                    parentItem.classList.add('open');
                    parentItem.querySelector('.submenu').classList.add('open');
                }
            }
        });

        // If immediate load (no animation)
        if (immediate) {
            updatePageContent(hash, content);
            loadingIndicator.hideImmediate();
            return;
        }

        // Simulate loading (in real app this would be AJAX request)
        setTimeout(() => {
            updatePageContent(hash, content);
            loadingIndicator.hide();
        }, 150); // Simulated loading time

        //updatePageContent(hash);
        loadingIndicator.hide();
    }

    // Update page content
    function updatePageContent(hash, content) {
       
        // Add page transition animation
        elements.contentArea.classList.add('page-exit');

        setTimeout(() => {
            // Update content
            //elements.pageTitle.textContent = page.title;
            elements.pageContent.innerHTML = content;
            AppState.currentPage = hash; //*** pageId;

            // Add enter animation
            elements.contentArea.classList.remove('page-exit');
            elements.contentArea.classList.add('page-enter');

            setTimeout(() => {
                elements.contentArea.classList.remove('page-enter');
            }, 150);

            // Close mobile menu if open
            if (AppState.isMenuOpen) {
                toggleMenu();
            }

            // Log page change event
            eventMonitor.logEvent('Navigation', `Загружена страница: ${hash}`);
        }, 150);
    }

    // Toggle mobile menu
    function toggleMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        elements.sidebar.classList.toggle('open', AppState.isMenuOpen);

        // Log menu toggle event
        eventMonitor.logEvent('UI Interaction', `Menu ${AppState.isMenuOpen ? 'opened' : 'closed'}`);
    }

    // Toggle submenus
    function toggleSubmenu(parent) {
        parent.classList.toggle('open');
        const submenu = parent.querySelector('.submenu');
        submenu.classList.toggle('open');

        // Log submenu toggle event
        eventMonitor.logEvent('UI Interaction', `Submenu ${parent.classList.contains('open') ? 'expanded' : 'collapsed'}`);
    }

    // Handle navigation from links
    function handleNavigation(e, link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
            const path = (href.startsWith('#') ? href.substring(1) : href);
            router.navigate(path);
            return true;
        }
        return false;
    }

    // Event Listeners
    elements.menuToggle.addEventListener('click', toggleMenu);

    eventMonitor.setEventListeners();

    // Navigation link clicks
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // If it's a parent link with submenu, toggle submenu instead of navigating
            //const parent = link.closest('.has-submenu');
            //if (parent) {
            if (link.parentNode.classList.contains('has-submenu')) {
                toggleSubmenu(link.parentNode);
                e.preventDefault();
                return;
            }

            // Otherwise, handle navigation
            handleNavigation(e, link);
        });
    });

    // Footer link clicks
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            handleNavigation(e, link);
        });
    });

    // Global Event Handlers
    function setupGlobalEventHandlers() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            eventMonitor.logEvent('Keyboard', `Key: ${e.key}, Code: ${e.code}`);

            // Handle keyboard shortcuts
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                toggleMenu();
            }

            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                eventMonitor.toggleMonitor();
            }

            if (e.key === 'Escape') {
                if (AppState.isMenuOpen) toggleMenu();
                if (AppState.isMonitorOpen) eventMonitor.toggleMonitor();
            }

            // Navigation with arrow keys
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                window.history.back();
            }

            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                window.history.forward();
            }
        });

        // Mouse events
        document.addEventListener('click', (e) => {
            eventMonitor.logEvent('Mouse', `Click at (${e.clientX}, ${e.clientY})`);
        });

        document.addEventListener('dblclick', (e) => {
            eventMonitor.logEvent('Mouse', `Double click at (${e.clientX}, ${e.clientY})`);
        });

        // Right click context menu prevention for demo
        document.addEventListener('contextmenu', (e) => {
            eventMonitor.logEvent('Mouse', `Right click at (${e.clientX}, ${e.clientY})`);
            // e.preventDefault(); // Uncomment to disable context menu
        });

        // Touch events
        document.addEventListener('touchstart', (e) => {
            eventMonitor.logEvent('Touch', `Touch started with ${e.touches.length} finger(s)`);
        });

        document.addEventListener('touchmove', (e) => {
            eventMonitor.logEvent('Touch', `Touch moved with ${e.touches.length} finger(s)`);
        });

        document.addEventListener('touchend', (e) => {
            eventMonitor.logEvent('Touch', 'Touch ended');
        });

        // Swipe detection for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    eventMonitor.logEvent('Touch', 'Swipe right detected');
                    // Swipe right - could be used to open menu on mobile
                    if (!AppState.isMenuOpen && window.innerWidth <= 768) {
                        toggleMenu();
                    }
                } else {
                    eventMonitor.logEvent('Touch', 'Swipe left detected');
                    // Swipe left - could be used to close menu on mobile
                    if (AppState.isMenuOpen && window.innerWidth <= 768) {
                        toggleMenu();
                    }
                }
            }
        });

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                eventMonitor.logEvent('Window', `Resized to ${window.innerWidth}x${window.innerHeight}`);

                // Close menu on resize to larger screens if it was open
                if (window.innerWidth > 768 && AppState.isMenuOpen) {
                    toggleMenu();
                }
            }, 250);
        });

        //// Handle browser back/forward buttons with loading indicator
        //window.addEventListener('popstate', () => {
        //    loadingIndicator.show();
        //    setTimeout(async () => {
        //        await router.handleRoute();
        //        loadingIndicator.hide();
        //    }, 50);
        //});
    }

    // Initialize
    setupGlobalEventHandlers();
    eventMonitor.logEvent('Application', 'SPA application initialized');

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (AppState.isMenuOpen &&
            !elements.sidebar.contains(e.target) &&
            !elements.menuToggle.contains(e.target) &&
            window.innerWidth <= 768) {
            toggleMenu();
        }
    });
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}