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
        const loasdHash = (hash == '/' ? '/analytics/dashboard' : hash);
        loadPage(hash, await contentLoader.loadCached(`/js/app${hash}.html`));
        return true;
    });

    // Initialize event monitor
    const { default: EventMonitor } = await import("/js/core/eventMonitor.js");
    const eventMonitor = new EventMonitor(AppState);

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

        setTimeout(async () => {
            // Update content
            //***elements.pageContent.innerHTML = content;
            await contentLoader.setContent(content, elements.contentArea);

            AppState.currentPage = hash; 

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

    window.location.href = '/#/references/currencies'; // '/#/analytics/dashboard';
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}