// ContentLoder
export default class ContentLoder {
    constructor() {
        this.#cache = new Map();
    }

    // Кэш загруженных HTML
    #cache;

    // Загрузка HTML с кэшированием
    async loadCached(url) {
        // Проверка кэша
        if (this.#cache.has(url)) {
            return this.#cache.get(url);
        }

        // Загрузка с сервера
        try {
            const html = await this.fetchHTML(url);

            // Сохранение в кэш
            this.#cache.set(url, html);

            //const container = document.querySelector(containerSelector);
            return html;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return '';
        }
    }

    async fetchHTML(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
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

    async setContent(html, contentElement) {
       
        // Используем DOMParser для парсинга
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        //// Вставляем содержимое
        contentElement.innerHTML = doc.body.innerHTML;

        // Обрабатываем и выполняем скрипты
        await this.processScripts(doc);

        // Инициируем событие загрузки
        contentElement.dispatchEvent(new CustomEvent('html-loaded', {
            detail: { contentElement, html }
        }));
    }

    removeScript(src) {
        const scripts = document.querySelectorAll(`script[src="${src}"]`);
        if (scripts.length) {
            scripts.forEach(script => script.remove());
        }
    }

    async processScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        const promises = [];

        for (const script of scripts) {
            promises.push(this.executeScript(script));
        }

        return Promise.all(promises);
    }

    async executeScript(script) {

        this.removeScript(script.src);

        return new Promise((resolve, reject) => {
            if (script.src) {
                // Внешний скрипт
                const newScript = document.createElement('script');
                newScript.src = script.src;

                // Копируем важные атрибуты
                ['type', 'async', 'defer', 'crossorigin', 'integrity'].forEach(attr => {
                    if (script[attr]) newScript[attr] = script[attr];
                });

                newScript.onload = () => resolve();

                newScript.onerror = reject;
                document.head.appendChild(newScript);
            } else {
                // Inline скрипт
                try {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    if (script.type) newScript.type = script.type;

                    document.head.appendChild(newScript);
                    newScript.remove();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
}