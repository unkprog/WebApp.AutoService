// Router
export default class Router {
    #onRoute;

    constructor(onRoute) {
        this.#onRoute = onRoute;
//***        this.routes = {};
//***        this.currentRoute = null;
//***        this.loadingTimeout = null;

        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        // Handle initial load
        window.addEventListener('DOMContentLoaded', () => this.handleRoute());

        // Also handle direct hash access
        if (window.location.hash) {
            setTimeout(async () => await this.handleRoute(), 100);
        }
    }

//***    addRoute(path, handler) {
//***        this.routes[path] = handler;
//***    }

    async handleRoute() {
        let hash = window.location.hash.substring(1);
        if (!hash || hash === '') {
            hash = '/';
        }

        let routeResult = false;

        if (this.#onRoute)
            routeResult = await this.#onRoute(hash);

        if (!routeResult)
            this.navigate('/');

//***        const path = hash.split('?')[0];
//***
//***        // Find matching route
//***        let matchedRoute = null;
//***        for (const route in this.routes) {
//***            if (this.isRouteMatch(route, path)) {
//***                matchedRoute = route;
//***                break;
//***            }
//***        }
//***
//***        if (matchedRoute && this.routes[matchedRoute]) {
//***            this.currentRoute = matchedRoute;
//***            this.routes[matchedRoute](path);
//***        } else {
//***            // Try to find page by ID
//***            const pageId = this.getPageIdFromPath(path);
//***            if (pageId && PageTemplates[pageId]) {
//***                loadPage(pageId);
//***            } else {
//***                // Default route
//***                this.navigate('/');
//***            }
//***        }
    }

//***    isRouteMatch(route, path) {
//***        if (route === path) return true;
//***
//***        // Handle parameterized routes (simple implementation)
//***        const routeParts = route.split('/');
//***        const pathParts = path.split('/');
//***
//***        if (routeParts.length !== pathParts.length) return false;
//***
//***        for (let i = 0; i < routeParts.length; i++) {
//***            if (routeParts[i].startsWith(':')) continue;
//***            if (routeParts[i] !== pathParts[i]) return false;
//***        }
//***
//***        return true;
//***    }

//***    getPageIdFromPath(path) {
//***        // Convert path like "/products/list" to "products-list"
//***        if (path === '/') return 'dashboard';
//***        return path.replace(/^\//, '').replace(/\//g, '-');
//***    }

    navigate(path) {
        window.location.hash = path;
    }
}