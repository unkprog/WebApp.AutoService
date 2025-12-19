// Компонент для работы с формами
class FormComponent {
    constructor(options = {}) {
        this.options = {
            id: 'form-' + Date.now(),
            title: 'Форма',
            fields: [],
            data: {},
            onSubmit: null,
            onCancel: null,
            submitText: 'Сохранить',
            cancelText: 'Отмена',
            validate: true,
            ...options
        };

        this.form = null;
        this.init();
    }

    init() {
        this.createForm();
        this.bindEvents();
    }

    createForm() {
        const formHTML = `
            <form id="${this.options.id}" class="dynamic-form">
                ${this.options.title ? `
                    <div class="form-header">
                        <h3>${this.options.title}</h3>
                    </div>
                ` : ''}
                
                <div class="form-body">
                    ${this.renderFields()}
                </div>
                
                <div class="form-footer">
                    ${this.options.onCancel ? `
                        <button type="button" class="btn btn-secondary form-cancel">
                            ${this.options.cancelText}
                        </button>
                    ` : ''}
                    
                    <button type="submit" class="btn btn-primary form-submit">
                        ${this.options.submitText}
                    </button>
                </div>
            </form>
        `;

        this.form = this.createFormElement(formHTML);
    }

    renderFields() {
        return this.options.fields.map(field => {
            const value = this.options.data[field.name] || field.default || '';
            const required = field.required ? 'required' : '';
            const disabled = field.disabled ? 'disabled' : '';

            switch (field.type) {
                case 'text':
                case 'email':
                case 'tel':
                case 'number':
                case 'password':
                case 'date':
                case 'datetime-local':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            ${field.label ? `<label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            <input type="${field.type}" 
                                   id="${field.name}"
                                   name="${field.name}"
                                   class="form-control ${field.class || ''}"
                                   value="${value}"
                                   ${required}
                                   ${disabled}
                                   ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                   ${field.min ? `min="${field.min}"` : ''}
                                   ${field.max ? `max="${field.max}"` : ''}
                                   ${field.step ? `step="${field.step}"` : ''}
                                   ${field.pattern ? `pattern="${field.pattern}"` : ''}
                                   ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''}>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'textarea':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            ${field.label ? `<label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            <textarea id="${field.name}"
                                      name="${field.name}"
                                      class="form-control ${field.class || ''}"
                                      rows="${field.rows || 3}"
                                      ${required}
                                      ${disabled}
                                      ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>${value}</textarea>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'select':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            ${field.label ? `<label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            <select id="${field.name}"
                                    name="${field.name}"
                                    class="form-control ${field.class || ''}"
                                    ${required}
                                    ${disabled}
                                    ${field.multiple ? 'multiple' : ''}>
                                ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
                                ${field.options.map(opt => {
                        if (typeof opt === 'string') {
                            return `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`;
                        } else {
                            return `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`;
                        }
                    }).join('')}
                            </select>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'checkbox':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            <div class="form-check">
                                <input type="checkbox"
                                       id="${field.name}"
                                       name="${field.name}"
                                       class="form-check-input ${field.class || ''}"
                                       ${value ? 'checked' : ''}
                                       ${required}
                                       ${disabled}>
                                ${field.label ? `<label class="form-check-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            </div>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'radio':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            ${field.label ? `<label class="form-label">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            <div class="radio-group">
                                ${field.options.map((opt, index) => {
                        const optId = `${field.name}-${index}`;
                        const optValue = typeof opt === 'string' ? opt : opt.value;
                        const optLabel = typeof opt === 'string' ? opt : opt.label;

                        return `
                                        <div class="form-check form-check-inline">
                                            <input type="radio"
                                                   id="${optId}"
                                                   name="${field.name}"
                                                   class="form-check-input"
                                                   value="${optValue}"
                                                   ${value === optValue ? 'checked' : ''}
                                                   ${required}>
                                            <label class="form-check-label" for="${optId}">${optLabel}</label>
                                        </div>
                                    `;
                    }).join('')}
                            </div>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'file':
                    return `
                        <div class="form-group ${field.groupClass || ''}">
                            ${field.label ? `<label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>` : ''}
                            <input type="file"
                                   id="${field.name}"
                                   name="${field.name}"
                                   class="form-control-file ${field.class || ''}"
                                   ${required}
                                   ${disabled}
                                   ${field.accept ? `accept="${field.accept}"` : ''}
                                   ${field.multiple ? 'multiple' : ''}>
                            ${field.help ? `<small class="form-text text-muted">${field.help}</small>` : ''}
                        </div>
                    `;

                case 'hidden':
                    return `<input type="hidden" name="${field.name}" value="${value}">`;

                case 'custom':
                    return field.html || '';

                default:
                    return '';
            }
        }).join('');
    }

    createFormElement(html) {
        const container = document.createElement('div');
        container.className = 'form-container';
        container.innerHTML = html;
        return container;
    }

    bindEvents() {
        const formElement = this.form.querySelector('form');

        if (formElement) {
            // Обработка отправки формы
            formElement.addEventListener('submit', (e) => {
                e.preventDefault();

                if (this.options.validate && !this.validate()) {
                    return;
                }

                const formData = this.getFormData();

                if (this.options.onSubmit) {
                    this.options.onSubmit(formData, this);
                }
            });

            // Обработка отмены
            const cancelBtn = this.form.querySelector('.form-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (this.options.onCancel) {
                        this.options.onCancel();
                    }
                });
            }

            // Валидация в реальном времени
            if (this.options.validate) {
                this.setupLiveValidation(formElement);
            }
        }
    }

    setupLiveValidation(form) {
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            // Валидация при потере фокуса
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Валидация при вводе (с debounce)
            if (field.type !== 'checkbox' && field.type !== 'radio') {
                field.addEventListener('input', Helpers.debounce(() => {
                    this.validateField(field);
                }, 300));
            }
        });
    }

    validateField(field) {
        // Очищаем предыдущие ошибки
        field.classList.remove('is-invalid', 'is-valid');
        const feedback = field.parentNode.querySelector('.invalid-feedback, .valid-feedback');
        if (feedback) feedback.remove();

        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        // Проверка обязательных полей
        if (field.required && !value.trim()) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }

        // Проверка email
        if (field.type === 'email' && value && !Validation.email(value)) {
            isValid = false;
            errorMessage = 'Введите корректный email адрес';
        }

        // Проверка телефона
        if (field.type === 'tel' && value && !Validation.phone(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }

        // Проверка числового поля
        if (field.type === 'number' && value) {
            const num = Number(value);
            if (isNaN(num)) {
                isValid = false;
                errorMessage = 'Введите число';
            } else {
                if (field.min && num < Number(field.min)) {
                    isValid = false;
                    errorMessage = `Минимальное значение: ${field.min}`;
                }
                if (field.max && num > Number(field.max)) {
                    isValid = false;
                    errorMessage = `Максимальное значение: ${field.max}`;
                }
            }
        }

        // Проверка по паттерну
        if (field.pattern && value) {
            const pattern = new RegExp(field.pattern);
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.title || 'Значение не соответствует формату';
            }
        }

        // Отображение результата валидации
        if (!isValid) {
            field.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        } else if (value) {
            field.classList.add('is-valid');
        }

        return isValid;
    }

    validate() {
        const form = this.form.querySelector('form');
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        // Сначала очищаем все ошибки
        fields.forEach(field => {
            field.classList.remove('is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) feedback.remove();
        });

        // Проверяем каждое поле
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormData() {
        const form = this.form.querySelector('form');
        const formData = new FormData(form);
        const data = {};

        // Преобразуем FormData в объект
        for (let [key, value] of formData.entries()) {
            // Обработка чекбоксов
            if (formData.getAll(key).length > 1) {
                data[key] = formData.getAll(key);
            } else {
                data[key] = value;
            }
        }

        // Обработка чекбоксов (одиночных)
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:not([name*="[]"])');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        return data;
    }

    setFieldValue(name, value) {
        const field = this.form.querySelector(`[name="${name}"]`);
        if (!field) return;

        switch (field.type) {
            case 'checkbox':
                field.checked = Boolean(value);
                break;
            case 'radio':
                const radio = this.form.querySelector(`[name="${name}"][value="${value}"]`);
                if (radio) radio.checked = true;
                break;
            case 'select-multiple':
                if (Array.isArray(value)) {
                    Array.from(field.options).forEach(option => {
                        option.selected = value.includes(option.value);
                    });
                }
                break;
            default:
                field.value = value || '';
        }

        // Триггерим событие изменения
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }

    getFieldValue(name) {
        const field = this.form.querySelector(`[name="${name}"]`);
        if (!field) return null;

        switch (field.type) {
            case 'checkbox':
                return field.checked;
            case 'radio':
                const checkedRadio = this.form.querySelector(`[name="${name}"]:checked`);
                return checkedRadio ? checkedRadio.value : null;
            case 'select-multiple':
                return Array.from(field.selectedOptions).map(opt => opt.value);
            case 'file':
                return field.files;
            default:
                return field.value;
        }
    }

    reset() {
        const form = this.form.querySelector('form');
        form.reset();

        // Сбрасываем валидацию
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.classList.remove('is-invalid', 'is-valid');
            const feedback = field.parentNode.querySelector('.invalid-feedback, .valid-feedback');
            if (feedback) feedback.remove();
        });
    }

    show() {
        return new Promise((resolve) => {
            showModal({
                title: this.options.title,
                content: this.form,
                size: this.options.modalSize || 'md',
                buttons: [
                    {
                        text: this.options.cancelText,
                        type: 'secondary',
                        handler: () => {
                            if (this.options.onCancel) this.options.onCancel();
                            closeModal();
                            resolve({ submitted: false, data: null });
                        }
                    },
                    {
                        text: this.options.submitText,
                        type: 'primary',
                        handler: () => {
                            if (this.validate()) {
                                const formData = this.getFormData();
                                if (this.options.onSubmit) {
                                    this.options.onSubmit(formData, this);
                                }
                                closeModal();
                                resolve({ submitted: true, data: formData });
                            }
                        }
                    }
                ]
            });
        });
    }

    render(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (container) {
            container.appendChild(this.form);
        }

        return this.form;
    }

    destroy() {
        if (this.form && this.form.parentNode) {
            this.form.parentNode.removeChild(this.form);
        }
    }

    static create(options) {
        return new FormComponent(options);
    }

    static createModalForm(options) {
        const form = new FormComponent(options);
        return form.show();
    }

    static createQuickForm(fields, onSubmit, title = 'Быстрая форма') {
        return FormComponent.createModalForm({
            title,
            fields,
            onSubmit
        });
    }
}

// Добавляем стили для форм
const formStyles = `
    .dynamic-form {
        width: 100%;
    }

    .form-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .form-header h3 {
        margin: 0;
        color: var(--primary-color);
        font-size: 1.3rem;
    }

    .form-body {
        margin-bottom: 1.5rem;
    }

    .form-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e0e0e0;
    }

    .form-container {
        max-width: 100%;
    }

    .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .form-check-inline {
        margin-right: 1rem;
    }

    .form-text {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
    }

    .form-control-file {
        display: block;
        width: 100%;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control-file:focus {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    @media (max-width: 768px) {
        .form-footer {
            flex-direction: column;
        }
        
        .form-footer .btn {
            width: 100%;
        }
        
        .radio-group {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
`;

// Добавляем стили в документ
const formStyleSheet = document.createElement('style');
formStyleSheet.textContent = formStyles;
document.head.appendChild(formStyleSheet);

// Глобальные функции для работы с формами
window.FormComponent = FormComponent;

function createForm(options) {
    return FormComponent.create(options);
}

function showFormModal(options) {
    return FormComponent.createModalForm(options);
}

function showQuickForm(fields, onSubmit, title) {
    return FormComponent.createQuickForm(fields, onSubmit, title);
}