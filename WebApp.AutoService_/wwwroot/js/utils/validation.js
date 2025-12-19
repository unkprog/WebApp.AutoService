// Утилиты валидации
class Validation {
    // Проверка обязательных полей
    static required(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }

    // Проверка минимальной длины
    static minLength(value, min) {
        if (!value) return false;
        return String(value).length >= min;
    }

    // Проверка максимальной длины
    static maxLength(value, max) {
        if (!value) return true;
        return String(value).length <= max;
    }

    // Проверка точной длины
    static exactLength(value, length) {
        if (!value) return false;
        return String(value).length === length;
    }

    // Проверка email
    static email(value) {
        if (!value) return true; // Если поле не обязательно
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(value);
    }

    // Проверка телефона
    static phone(value) {
        if (!value) return true; // Если поле не обязательно
        const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return re.test(value);
    }

    // Проверка URL
    static url(value) {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    // Проверка числового значения
    static number(value) {
        if (!value) return true;
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Проверка целого числа
    static integer(value) {
        if (!value) return true;
        return Number.isInteger(Number(value));
    }

    // Проверка минимального значения
    static min(value, min) {
        if (!value) return true;
        const num = Number(value);
        return !isNaN(num) && num >= min;
    }

    // Проверка максимального значения
    static max(value, max) {
        if (!value) return true;
        const num = Number(value);
        return !isNaN(num) && num <= max;
    }

    // Проверка диапазона
    static range(value, min, max) {
        if (!value) return true;
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    // Проверка регулярным выражением
    static pattern(value, pattern) {
        if (!value) return true;
        const re = new RegExp(pattern);
        return re.test(value);
    }

    // Проверка равенства
    static equals(value, compareValue) {
        return value === compareValue;
    }

    // Проверка VIN кода автомобиля
    static vin(value) {
        if (!value) return true;

        // Базовые проверки VIN
        const vin = value.toUpperCase();
        if (vin.length !== 17) return false;

        // Проверка на запрещенные символы (I, O, Q)
        if (/[IOQ]/.test(vin)) return false;

        // Можно добавить проверку контрольной суммы
        return true;
    }

    // Проверка госномера автомобиля
    static licensePlate(value) {
        if (!value) return true;

        // Паттерны для российских номеров
        const patterns = [
            // Стандартные номера: А123ВС77
            /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/i,
            // Такси: ТТ12377
            /^Т[АВЕКМНОРСТУХ]\d{3}\d{2,3}$/i,
            // Мотоциклы: 1234АС77
            /^\d{4}[АВЕКМНОРСТУХ]{2}\d{2,3}$/i,
            // Прицепы: 1234АС77
            /^\d{4}[АВЕКМНОРСТУХ]{2}\d{2,3}$/i,
            // Дипломатические: 1234АС77
            /^\d{3}[АВЕКМНОРСТУХ]\d{3}\d{2,3}$/i,
            // Военные: 1234АС77
            /^\d{4}[АВЕКМНОРСТУХ]{2}\d{2}$/i,
            // Транзитные: АА12377
            /^[АВЕКМНОРСТУХ]{2}\d{3}\d{2,3}$/i
        ];

        return patterns.some(pattern => pattern.test(value));
    }

    // Проверка ИНН
    static inn(value) {
        if (!value) return true;

        const inn = String(value);

        // Проверка длины
        if (![10, 12].includes(inn.length)) return false;

        // Проверка что только цифры
        if (!/^\d+$/.test(inn)) return false;

        // Проверка контрольных сумм
        if (inn.length === 10) {
            // Для 10-значного ИНН
            const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(inn[i]) * weights[i];
            }
            const control = (sum % 11) % 10;
            return control === parseInt(inn[9]);
        } else {
            // Для 12-значного ИНН
            const weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
            const weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

            let sum1 = 0;
            for (let i = 0; i < 10; i++) {
                sum1 += parseInt(inn[i]) * weights1[i];
            }
            const control1 = (sum1 % 11) % 10;

            let sum2 = 0;
            for (let i = 0; i < 11; i++) {
                sum2 += parseInt(inn[i]) * weights2[i];
            }
            const control2 = (sum2 % 11) % 10;

            return control1 === parseInt(inn[10]) && control2 === parseInt(inn[11]);
        }
    }

    // Проверка КПП
    static kpp(value) {
        if (!value) return true;

        const kpp = String(value);

        // Проверка длины
        if (kpp.length !== 9) return false;

        // Формат: XXXXXXXXX
        return /^\d{4}[\dA-Z]{2}\d{3}$/.test(kpp);
    }

    // Проверка ОГРН
    static ogrn(value) {
        if (!value) return true;

        const ogrn = String(value);

        // Проверка длины
        if (![13, 15].includes(ogrn.length)) return false;

        // Проверка что только цифры
        if (!/^\d+$/.test(ogrn)) return false;

        // Проверка контрольной суммы
        if (ogrn.length === 13) {
            // Для ОГРН (13 цифр)
            const num = ogrn.substring(0, 12);
            const control = parseInt(ogrn[12]);
            const remainder = (parseInt(num) % 11) % 10;
            return remainder === control;
        } else {
            // Для ОГРНИП (15 цифр)
            const num = ogrn.substring(0, 14);
            const control = parseInt(ogrn[14]);
            const remainder = (parseInt(num) % 13) % 10;
            return remainder === control;
        }
    }

    // Проверка расчетного счета
    static bankAccount(value) {
        if (!value) return true;

        const account = String(value);

        // Проверка длины (20 цифр)
        if (account.length !== 20) return false;

        // Проверка что только цифры
        return /^\d{20}$/.test(account);
    }

    // Проверка БИК
    static bik(value) {
        if (!value) return true;

        const bik = String(value);

        // Проверка длины (9 цифр)
        if (bik.length !== 9) return false;

        // Проверка что только цифры
        return /^\d{9}$/.test(bik);
    }

    // Проверка корреспондентского счета
    static corrAccount(value, bik) {
        if (!value) return true;

        const account = String(value);

        // Проверка длины (20 цифр)
        if (account.length !== 20) return false;

        // Проверка что только цифры
        if (!/^\d{20}$/.test(account)) return false;

        // Проверка контрольной суммы с БИК
        if (bik) {
            const bikPart = bik ? bik.slice(-3) : '000';
            const expectedStart = '0' + bikPart;
            return account.startsWith(expectedStart);
        }

        return true;
    }

    // Проверка даты
    static date(value) {
        if (!value) return true;

        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    // Проверка даты рождения (возраст от 18 до 100 лет)
    static birthDate(value) {
        if (!value) return true;

        const birthDate = new Date(value);
        if (isNaN(birthDate.getTime())) return false;

        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 18 && age <= 100;
    }

    // Проверка паспортных данных
    static passport(series, number) {
        if (!series && !number) return true;

        // Серия: 4 цифры
        if (series && !/^\d{4}$/.test(series)) return false;

        // Номер: 6 цифр
        if (number && !/^\d{6}$/.test(number)) return false;

        return true;
    }

    // Валидация формы
    static validateForm(form, rules) {
        const errors = {};
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        Object.keys(rules).forEach(field => {
            const value = data[field];
            const fieldRules = rules[field];

            fieldRules.forEach(rule => {
                const [validator, param, message] = Array.isArray(rule) ? rule : [rule];

                if (typeof validator === 'string') {
                    // Встроенный валидатор
                    if (!this[validator](value, param)) {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push(message || `Ошибка в поле ${field}`);
                    }
                } else if (typeof validator === 'function') {
                    // Кастомный валидатор
                    if (!validator(value, data)) {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push(message || `Ошибка в поле ${field}`);
                    }
                }
            });
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            data
        };
    }

    // Валидация поля в реальном времени
    static validateField(field, rules) {
        const errors = [];
        const value = field.value;

        rules.forEach(rule => {
            const [validator, param, message] = Array.isArray(rule) ? rule : [rule];

            if (typeof validator === 'string' && this[validator]) {
                if (!this[validator](value, param)) {
                    errors.push(message || `Ошибка в поле ${field.name}`);
                }
            } else if (typeof validator === 'function') {
                if (!validator(value)) {
                    errors.push(message || `Ошибка в поле ${field.name}`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Показать ошибки валидации
    static showValidationErrors(form, errors) {
        // Сначала скрываем все предыдущие ошибки
        this.hideValidationErrors(form);

        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                // Добавляем класс ошибки
                field.classList.add('is-invalid');

                // Создаем элемент с сообщением об ошибке
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.innerHTML = errors[fieldName].join('<br>');

                // Добавляем после поля
                field.parentNode.appendChild(errorDiv);
            }
        });
    }

    // Скрыть ошибки валидации
    static hideValidationErrors(form) {
        // Убираем классы ошибок
        form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });

        // Удаляем сообщения об ошибках
        form.querySelectorAll('.invalid-feedback').forEach(error => {
            error.remove();
        });
    }

    // Создание валидатора для реального времени
    static createLiveValidator(field, rules) {
        return () => {
            const result = this.validateField(field, rules);

            // Убираем предыдущие ошибки
            field.classList.remove('is-invalid', 'is-valid');
            const parent = field.parentNode;
            const existingError = parent.querySelector('.invalid-feedback');
            if (existingError) existingError.remove();

            if (!result.isValid) {
                // Показываем ошибки
                field.classList.add('is-invalid');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.innerHTML = result.errors.join('<br>');
                parent.appendChild(errorDiv);
            } else if (field.value) {
                // Показываем успешную валидацию
                field.classList.add('is-valid');
            }

            return result.isValid;
        };
    }
}

// Добавляем стили для валидации
const validationStyles = `
    .is-invalid {
        border-color: #dc3545 !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        padding-right: calc(1.5em + 0.75rem);
    }

    .is-valid {
        border-color: #28a745 !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        padding-right: calc(1.5em + 0.75rem);
    }

    .invalid-feedback {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #dc3545;
    }

    .valid-feedback {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #28a745;
    }

    .form-control.is-invalid:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    .form-control.is-valid:focus {
        border-color: #28a745;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }
`;

// Добавляем стили в документ
const validationStyleSheet = document.createElement('style');
validationStyleSheet.textContent = validationStyles;
document.head.appendChild(validationStyleSheet);

// Экспорт утилит валидации
window.Validation = Validation;