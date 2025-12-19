// Централизованная обработка событий
class EventManager {
    constructor() {
        this.events = {};
        this.globalHandlers = new Map();
        this.initGlobalEvents();
    }

    // Инициализация глобальных событий
    initGlobalEvents() {
        // Глобальные обработчики клавиш
        document.addEventListener('keydown', (e) => {
            // Ctrl+S - сохранение
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.trigger('save');
            }

            // Escape - закрытие модальных окон и т.д.
            if (e.key === 'Escape') {
                this.trigger('escape');
            }

            // Enter в поле ввода - отправка формы
            if (e.key === 'Enter' && e.target.matches('input:not([type="textarea"]):not([type="checkbox"]):not([type="radio"])')) {
                const form = e.target.closest('form');
                if (form) {
                    e.preventDefault();
                    this.trigger('form-submit', { form });
                }
            }
        });

        // Обработка кликов вне элементов
        document.addEventListener('click', (e) => {
            this.trigger('document-click', { target: e.target, event: e });
        });

        // Обработка изменений размера окна
        window.addEventListener('resize', () => {
            this.trigger('window-resize', { width: window.innerWidth, height: window.innerHeight });
        });

        // Обработка видимости страницы
        document.addEventListener('visibilitychange', () => {
            this.trigger('visibility-change', { isVisible: document.visibilityState === 'visible' });
        });

        // Предотвращение закрытия страницы при наличии несохраненных данных
        window.addEventListener('beforeunload', (e) => {
            if (window.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';
                return e.returnValue;
            }
        });
    }

    // Регистрация обработчика события
    on(eventName, handler, priority = 0) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({ handler, priority });
        // Сортируем по приоритету (высокий приоритет первый)
        this.events[eventName].sort((a, b) => b.priority - a.priority);

        // Возвращаем функцию для удаления обработчика
        return () => this.off(eventName, handler);
    }

    // Удаление обработчика события
    off(eventName, handler) {
        if (!this.events[eventName]) return;

        this.events[eventName] = this.events[eventName].filter(
            item => item.handler !== handler
        );
    }

    // Триггер события
    trigger(eventName, data = {}) {
        if (!this.events[eventName]) return;

        const event = {
            type: eventName,
            data,
            timestamp: Date.now(),
            preventDefault: false,
            defaultPrevented: false
        };

        event.preventDefault = () => {
            event.defaultPrevented = true;
        };

        // Вызываем все обработчики
        for (const item of this.events[eventName]) {
            if (event.defaultPrevented) break;
            item.handler(event);
        }
    }

    // Одноразовый обработчик
    once(eventName, handler, priority = 0) {
        const onceHandler = (event) => {
            handler(event);
            this.off(eventName, onceHandler);
        };
        return this.on(eventName, onceHandler, priority);
    }

    // Глобальные обработчики для элементов
    addGlobalHandler(selector, eventType, handler, options = {}) {
        const key = `${selector}|${eventType}`;

        if (!this.globalHandlers.has(key)) {
            const eventHandler = (e) => {
                if ((e.target.matches && e.target.matches(selector)) || (e.target.closest && e.target.closest(selector))) {
                    handler(e);
                }
            };

            document.addEventListener(eventType, eventHandler, options);
            this.globalHandlers.set(key, eventHandler);
        }
    }

    // Удаление глобального обработчика
    removeGlobalHandler(selector, eventType) {
        const key = `${selector}|${eventType}`;
        const handler = this.globalHandlers.get(key);

        if (handler) {
            document.removeEventListener(eventType, handler);
            this.globalHandlers.delete(key);
        }
    }

    // Делегирование событий
    delegate(container, eventType, selector, handler) {
        const delegatedHandler = (e) => {
            let target = e.target;

            // Находим целевой элемент
            while (target && target !== container) {
                if (target.matches(selector)) {
                    handler.call(target, e, target);
                    break;
                }
                target = target.parentNode;
            }
        };

        container.addEventListener(eventType, delegatedHandler);

        // Возвращаем функцию для удаления
        return () => container.removeEventListener(eventType, delegatedHandler);
    }

    // Создание кастомного события
    createCustomEvent(name, detail = {}, bubbles = true, cancelable = true) {
        return new CustomEvent(name, {
            detail,
            bubbles,
            cancelable
        });
    }

    // Отправка кастомного события
    dispatchCustomEvent(element, name, detail = {}) {
        const event = this.createCustomEvent(name, detail);
        element.dispatchEvent(event);
        return event;
    }

    // Обработка отправки формы с валидацией
    handleFormSubmit(form, submitHandler, validationRules = null) {
        const submitEvent = (e) => {
            e.preventDefault();

            let isValid = true;

            // Если есть правила валидации
            if (validationRules && typeof Validation !== 'undefined') {
                const result = Validation.validateForm(form, validationRules);
                isValid = result.isValid;

                if (!isValid) {
                    Validation.showValidationErrors(form, result.errors);
                    this.trigger('form-validation-failed', { form, errors: result.errors });
                    return;
                }

                Validation.hideValidationErrors(form);
            }

            if (isValid) {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                this.trigger('form-submitting', { form, data });
                submitHandler(data, form);
            }
        };

        form.addEventListener('submit', submitEvent);

        // Обработка валидации в реальном времени
        if (validationRules && typeof Validation !== 'undefined') {
            Object.keys(validationRules).forEach(fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    const rules = validationRules[fieldName];
                    const validator = Validation.createLiveValidator(field, rules);

                    field.addEventListener('blur', validator);
                    field.addEventListener('input', Helpers.debounce(validator, 300));
                }
            });
        }

        // Возвращаем функцию для удаления обработчиков
        return () => {
            form.removeEventListener('submit', submitEvent);
        };
    }

    // Обработка подтверждения действий
    confirmAction(message, confirmCallback, cancelCallback = null) {
        showModal({
            title: 'Подтверждение действия',
            content: `<p>${message}</p>`,
            size: 'sm',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    handler: () => {
                        if (cancelCallback) cancelCallback();
                        closeModal();
                    }
                },
                {
                    text: 'Подтвердить',
                    type: 'primary',
                    handler: () => {
                        confirmCallback();
                        closeModal();
                    }
                }
            ]
        });
    }

    // Обработка загрузки файлов
    handleFileUpload(input, options = {}) {
        const {
            accept = '*',
            multiple = false,
            maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
            onSelect = null,
            onError = null,
            onProgress = null
        } = options;

        input.accept = accept;
        input.multiple = multiple;

        const changeHandler = async (e) => {
            const files = Array.from(e.target.files);

            // Проверка размера файлов
            const oversizedFiles = files.filter(file => file.size > maxSize);
            if (oversizedFiles.length > 0) {
                const errorMsg = `Следующие файлы превышают максимальный размер (${Helpers.formatFileSize(maxSize)}): ${oversizedFiles.map(f => f.name).join(', ')}`;

                if (onError) {
                    onError(errorMsg);
                } else {
                    showNotification(errorMsg, 'error');
                }

                input.value = '';
                return;
            }

            // Проверка типа файлов
            if (accept !== '*') {
                const acceptedTypes = accept.split(',').map(type => type.trim());
                const invalidFiles = files.filter(file => {
                    const fileType = file.type || Helpers.getFileExtension(file.name);
                    return !acceptedTypes.some(type => {
                        if (type.startsWith('.')) {
                            return file.name.toLowerCase().endsWith(type);
                        } else {
                            return file.type.startsWith(type.replace('/*', ''));
                        }
                    });
                });

                if (invalidFiles.length > 0) {
                    const errorMsg = `Неподдерживаемый тип файлов: ${invalidFiles.map(f => f.name).join(', ')}`;

                    if (onError) {
                        onError(errorMsg);
                    } else {
                        showNotification(errorMsg, 'error');
                    }

                    input.value = '';
                    return;
                }
            }

            // Обработка выбранных файлов
            if (onSelect) {
                onSelect(files);
            }

            input.value = '';
        };

        input.addEventListener('change', changeHandler);

        // Возвращаем функцию для удаления обработчика
        return () => {
            input.removeEventListener('change', changeHandler);
        };
    }

    // Обработка drag & drop
    setupDropZone(element, options = {}) {
        const {
            onDrop = null,
            onDragOver = null,
            onDragLeave = null,
            accept = '*',
            maxSize = 10 * 1024 * 1024
        } = options;

        const dragOverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');

            if (onDragOver) {
                onDragOver(e);
            }
        };

        const dragLeaveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            if (onDragLeave) {
                onDragLeave(e);
            }
        };

        const dropHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);

            if (files.length > 0) {
                // Проверка размера файлов
                const oversizedFiles = files.filter(file => file.size > maxSize);
                if (oversizedFiles.length > 0) {
                    showNotification(`Некоторые файлы превышают максимальный размер (${Helpers.formatFileSize(maxSize)})`, 'error');
                    return;
                }

                // Проверка типа файлов
                if (accept !== '*') {
                    const acceptedTypes = accept.split(',').map(type => type.trim());
                    const validFiles = files.filter(file => {
                        const fileType = file.type || Helpers.getFileExtension(file.name);
                        return acceptedTypes.some(type => {
                            if (type.startsWith('.')) {
                                return file.name.toLowerCase().endsWith(type);
                            } else {
                                return file.type.startsWith(type.replace('/*', ''));
                            }
                        });
                    });

                    if (validFiles.length !== files.length) {
                        showNotification('Некоторые файлы имеют неподдерживаемый тип', 'warning');
                    }

                    if (validFiles.length > 0 && onDrop) {
                        onDrop(validFiles);
                    }
                } else if (onDrop) {
                    onDrop(files);
                }
            }
        };

        element.addEventListener('dragover', dragOverHandler);
        element.addEventListener('dragleave', dragLeaveHandler);
        element.addEventListener('drop', dropHandler);

        // Добавляем стили для drop-зоны
        element.style.position = 'relative';

        const dropZoneStyles = `
            .drag-over {
                border-color: #3498db !important;
                background-color: rgba(52, 152, 219, 0.1) !important;
            }
            
            .drag-over::after {
                content: 'Перетащите файлы сюда';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.9);
                color: #3498db;
                font-weight: 600;
                font-size: 1.1rem;
                z-index: 10;
                border: 2px dashed #3498db;
                border-radius: var(--border-radius);
            }
        `;

        // Добавляем стили, если их еще нет
        if (!document.querySelector('#drop-zone-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'drop-zone-styles';
            styleSheet.textContent = dropZoneStyles;
            document.head.appendChild(styleSheet);
        }

        // Возвращаем функцию для очистки
        return () => {
            element.removeEventListener('dragover', dragOverHandler);
            element.removeEventListener('dragleave', dragLeaveHandler);
            element.removeEventListener('drop', dropHandler);
            element.classList.remove('drag-over');
        };
    }

    // Обработка бесконечного скролла
    setupInfiniteScroll(container, options = {}) {
        const {
            loadMore = null,
            threshold = 100, // px до конца для загрузки
            loadingClass = 'loading',
            isLoading = false
        } = options;

        let currentIsLoading = isLoading;

        const scrollHandler = Helpers.throttle(() => {
            if (currentIsLoading || !loadMore) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            if (scrollHeight - scrollTop - clientHeight < threshold) {
                currentIsLoading = true;
                container.classList.add(loadingClass);

                Promise.resolve(loadMore())
                    .finally(() => {
                        currentIsLoading = false;
                        container.classList.remove(loadingClass);
                    });
            }
        }, 200);

        container.addEventListener('scroll', scrollHandler);

        // Возвращаем функцию для управления состоянием загрузки
        return {
            remove: () => container.removeEventListener('scroll', scrollHandler),
            setLoading: (loading) => currentIsLoading = loading,
            triggerLoad: () => {
                if (!currentIsLoading && loadMore) {
                    currentIsLoading = true;
                    container.classList.add(loadingClass);

                    Promise.resolve(loadMore())
                        .finally(() => {
                            currentIsLoading = false;
                            container.classList.remove(loadingClass);
                        });
                }
            }
        };
    }

    // Обработка копирования в буфер обмена
    setupCopyToClipboard(triggerElement, options = {}) {
        const {
            text = '',
            textSelector = '',
            successMessage = 'Скопировано в буфер обмена',
            errorMessage = 'Ошибка копирования',
            showNotification = true
        } = options;

        const clickHandler = async (e) => {
            e.preventDefault();

            let copyText = text;

            // Если указан селектор, берем текст из элемента
            if (textSelector) {
                const textElement = document.querySelector(textSelector);
                if (textElement) {
                    copyText = textElement.textContent || textElement.value;
                }
            }

            // Если текст не найден, берем из data-атрибута
            if (!copyText) {
                copyText = triggerElement.dataset.copyText || '';
            }

            if (!copyText) {
                if (showNotification) {
                    showNotification('Нет текста для копирования', 'error');
                }
                return;
            }

            try {
                await Helpers.copyToClipboard(copyText);

                if (showNotification) {
                    showNotification(successMessage, 'success');
                }

                // Визуальная обратная связь
                triggerElement.classList.add('copied');
                setTimeout(() => {
                    triggerElement.classList.remove('copied');
                }, 1000);

                this.trigger('copy-to-clipboard', { text: copyText, element: triggerElement });
            } catch (error) {
                console.error('Ошибка копирования:', error);

                if (showNotification) {
                    showNotification(errorMessage, 'error');
                }
            }
        };

        triggerElement.addEventListener('click', clickHandler);

        // Добавляем стили для обратной связи
        const copyStyles = `
            .copied {
                animation: copiedPulse 0.5s ease;
                background-color: #d4edda !important;
                border-color: #c3e6cb !important;
                color: #155724 !important;
            }
            
            @keyframes copiedPulse {
                0% { transform: scale(1); }
                50% { transform: scale(0.95); }
                100% { transform: scale(1); }
            }
        `;

        if (!document.querySelector('#copy-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'copy-styles';
            styleSheet.textContent = copyStyles;
            document.head.appendChild(styleSheet);
        }

        // Возвращаем функцию для удаления обработчика
        return () => {
            triggerElement.removeEventListener('click', clickHandler);
        };
    }
}

// Создаем глобальный экземпляр менеджера событий
window.eventManager = new EventManager();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Регистрация глобальных обработчиков

    // Обработка кликов по ссылкам с подтверждением
    eventManager.addGlobalHandler('a[data-confirm]', 'click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a[data-confirm]');
        const message = link.dataset.confirm;

        eventManager.confirmAction(message, () => {
            window.location.href = link.href;
        });
    });

    // Обработка кнопок с подтверждением
    eventManager.addGlobalHandler('button[data-confirm]', 'click', (e) => {
        const button = e.target.closest('button[data-confirm]');
        const message = button.dataset.confirm;
        const form = button.closest('form');

        eventManager.confirmAction(message, () => {
            if (form) {
                form.submit();
            } else if (button.type === 'submit') {
                button.form?.submit();
            }
        });
    });

    // Обработка кнопок копирования
    eventManager.addGlobalHandler('[data-copy]', 'click', (e) => {
        const element = e.target.closest('[data-copy]');
        eventManager.setupCopyToClipboard(element, {
            text: element.dataset.copy,
            successMessage: element.dataset.success || 'Скопировано в буфер обмена'
        });
    });

    // Обработка тултипов
    eventManager.addGlobalHandler('[data-tooltip]', 'mouseenter', (e) => {
        const element = e.target.closest('[data-tooltip]');
        const tooltipText = element.dataset.tooltip;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            white-space: nowrap;
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);

        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        };

        updatePosition();
        element.dataset.tooltipId = tooltip.textContent;

        // Обновляем позицию при изменении размера окна
        const resizeHandler = () => updatePosition();
        window.addEventListener('resize', resizeHandler);

        // Удаляем тултип при уходе мыши
        const removeTooltip = () => {
            tooltip.remove();
            window.removeEventListener('resize', resizeHandler);
            element.removeEventListener('mouseleave', removeTooltip);
            delete element.dataset.tooltipId;
        };

        element.addEventListener('mouseleave', removeTooltip);
    });

    // Обработка переключения видимости пароля
    eventManager.addGlobalHandler('.password-toggle', 'click', (e) => {
        const toggle = e.target.closest('.password-toggle');
        const input = toggle.previousElementSibling;

        if (input && input.type === 'password') {
            input.type = 'text';
            toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else if (input && input.type === 'text') {
            input.type = 'password';
            toggle.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });

    // Инициализация всех элементов с data-attributes
    eventManager.trigger('app-ready');
});