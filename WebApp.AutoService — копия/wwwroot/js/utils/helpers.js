// Утилиты-помощники
class Helpers {
    // Форматирование даты
    static formatDate(date, format = 'dd.mm.yyyy') {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');

        const formats = {
            'dd.mm.yyyy': `${day}.${month}.${year}`,
            'dd/mm/yyyy': `${day}/${month}/${year}`,
            'yyyy-mm-dd': `${year}-${month}-${day}`,
            'dd.mm.yyyy HH:MM': `${day}.${month}.${year} ${hours}:${minutes}`,
            'dd.mm.yyyy HH:MM:SS': `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`,
            'HH:MM': `${hours}:${minutes}`,
            'HH:MM:SS': `${hours}:${minutes}:${seconds}`
        };

        return formats[format] || d.toLocaleDateString();
    }

    // Форматирование валюты
    static formatCurrency(amount, currency = 'RUB') {
        const currencies = {
            'RUB': '₽',
            'USD': '$',
            'EUR': '€'
        };

        const symbol = currencies[currency] || currency;

        // Форматируем число с разделителями тысяч
        const formatted = new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);

        return `${formatted} ${symbol}`;
    }

    // Обрезание текста
    static truncateText(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + suffix;
    }

    // Генерация случайного цвета
    static getRandomColor() {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad',
            '#2c3e50', '#f1c40f', '#e67e22', '#27ae60', '#2980b9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Генерация инициалов
    static getInitials(name) {
        if (!name) return '';

        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Проверка email
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Проверка телефона
    static isValidPhone(phone) {
        const re = /^[\+]?[0-9\s\-\(\)]+$/;
        return re.test(phone);
    }

    // Форматирование телефона
    static formatPhone(phone) {
        if (!phone) return '';

        // Удаляем все нецифровые символы
        const cleaned = phone.replace(/\D/g, '');

        // Форматируем российский номер
        if (cleaned.length === 11) {
            return `+${cleaned.charAt(0)} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
        }

        if (cleaned.length === 10) {
            return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
        }

        return phone;
    }

    // Копирование в буфер обмена
    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text)
                    .then(resolve)
                    .catch(reject);
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    resolve();
                } catch (err) {
                    reject(err);
                }

                textArea.remove();
            }
        });
    }

    // Загрузка файла
    static downloadFile(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Чтение файла
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Debounce функция
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle функция
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Генерация уникального ID
    static generateId(length = 8) {
        return Math.random().toString(36).substr(2, length);
    }

    // Проверка на мобильное устройство
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Проверка на сенсорное устройство
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Получение параметров URL
    static getUrlParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');

        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });

        return params;
    }

    // Установка параметров URL
    static setUrlParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.pushState({}, '', url);
    }

    // Анимация плавного скролла
    static smoothScroll(element, duration = 300) {
        const target = typeof element === 'string' ?
            document.querySelector(element) : element;

        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Проверка видимости элемента
    static isElementVisible(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Генерация градиента
    static generateGradient(color1, color2, angle = 45) {
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }

    // Форматирование размера файла
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Получение расширения файла
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Проверка типа файла
    static isImageFile(filename) {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const ext = this.getFileExtension(filename).toLowerCase();
        return extensions.includes(ext);
    }

    // Создание превью изображения
    static createImagePreview(file, maxWidth = 300, maxHeight = 300) {
        return new Promise((resolve, reject) => {
            if (!file || !this.isImageFile(file.name)) {
                reject(new Error('Неверный файл'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Преобразование в camelCase
    static toCamelCase(str) {
        return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
    }

    // Преобразование в snake_case
    static toSnakeCase(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    // Глубокое клонирование объекта
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        return obj;
    }

    // Слияние объектов
    static mergeObjects(target, ...sources) {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    this.mergeObjects(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            });
        });
        return target;
    }

    // Генерация хэша строки
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // Задержка выполнения
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Ретри функции
    static async retry(fn, retries = 3, delayMs = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;
            await this.delay(delayMs);
            return this.retry(fn, retries - 1, delayMs);
        }
    }
}

// Экспорт утилит в глобальную область видимости
window.Helpers = Helpers;