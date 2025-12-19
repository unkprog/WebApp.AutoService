// ContentLoder
export default class ContentLoder {
    constructor() {
        this.#cache = new Map();
    }

    // Кэш загруженных HTML
    #cache;

    // Загрузка HTML с кэшированием
    async loadCached(url, containerSelector) {
        // Проверка кэша
        if (this.#cache.has(url)) {
            //const container = document.querySelector(containerSelector);
            return this.#cache.get(url);
        }

        // Загрузка с сервера
        try {
            const response = await fetch(url);
            const html = await response.text();

            // Сохранение в кэш
            this.#cache.set(url, html);

            //const container = document.querySelector(containerSelector);
            return html;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return '';
        }
    }

    // Загрузка нескольких HTML файлов
    async loadMultiple(urls) {
        const promises = urls.map(async ({ url, selector }) => {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const container = document.querySelector(selector);
                if (container) {
                    container.innerHTML = html;
                }
                return { url, success: true };
            } catch (error) {
                console.error(`Ошибка загрузки ${url}:`, error);
                return { url, success: false, error };
            }
        });

        return Promise.all(promises);
    }
}