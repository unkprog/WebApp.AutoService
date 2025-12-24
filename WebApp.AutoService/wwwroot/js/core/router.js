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


    }

    navigate(path) {
        window.location.hash = path;
    }
}