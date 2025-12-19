// Дополнительные форматтеры для таблиц и форм
class Formatters {
    // Форматирование даты
    static date(value, format = 'dd.mm.yyyy') {
        if (!value) return '-';
        return Helpers.formatDate(value, format);
    }

    // Форматирование даты и времени
    static datetime(value) {
        return Formatters.date(value, 'dd.mm.yyyy HH:MM');
    }

    // Форматирование валюты
    static currency(value, currency = 'RUB') {
        if (value === null || value === undefined) return '-';
        return Helpers.formatCurrency(value, currency);
    }

    // Форматирование числа
    static number(value, decimals = 0) {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    // Форматирование процентов
    static percent(value, decimals = 1) {
        if (value === null || value === undefined) return '-';
        return `${Formatters.number(value, decimals)}%`;
    }

    // Форматирование телефона
    static phone(value) {
        if (!value) return '-';
        return Helpers.formatPhone(value);
    }

    // Форматирование статуса
    static status(value, mapping = {}) {
        const defaultMapping = {
            'active': { text: 'Активен', class: 'success' },
            'inactive': { text: 'Неактивен', class: 'secondary' },
            'pending': { text: 'Ожидание', class: 'warning' },
            'completed': { text: 'Завершен', class: 'success' },
            'cancelled': { text: 'Отменен', class: 'danger' },
            'new': { text: 'Новый', class: 'info' },
            'in_progress': { text: 'В работе', class: 'primary' }
        };

        const config = { ...defaultMapping, ...mapping };
        const statusConfig = config[value] || { text: value, class: 'secondary' };

        return `<span class="badge badge-${statusConfig.class}">${statusConfig.text}</span>`;
    }

    // Форматирование булевого значения
    static boolean(value, options = {}) {
        const { trueText = 'Да', falseText = 'Нет', showIcon = false } = options;

        if (value) {
            return showIcon ?
                `<i class="fas fa-check text-success"></i> ${trueText}` :
                `<span class="badge badge-success">${trueText}</span>`;
        } else {
            return showIcon ?
                `<i class="fas fa-times text-secondary"></i> ${falseText}` :
                `<span class="badge badge-secondary">${falseText}</span>`;
        }
    }

    // Форматирование имени пользователя
    static user(value, showAvatar = false) {
        if (!value) return '-';

        if (showAvatar) {
            const initials = Helpers.getInitials(value);
            const color = Helpers.getRandomColor();

            return `
                <div class="user-with-avatar">
                    <div class="user-avatar" style="background-color: ${color}">
                        ${initials}
                    </div>
                    <span class="user-name">${value}</span>
                </div>
            `;
        }

        return value;
    }

    // Форматирование ссылки
    static link(value, url, options = {}) {
        if (!value) return '-';

        const { target = '_blank', title = value, className = '' } = options;
        return `<a href="${url}" target="${target}" title="${title}" class="${className}">${value}</a>`;
    }

    // Форматирование email
    static email(value) {
        if (!value) return '-';
        return `<a href="mailto:${value}">${value}</a>`;
    }

    // Форматирование многострочного текста
    static multiline(value, maxLines = 3) {
        if (!value) return '-';

        // Заменяем переносы строк на <br>
        const html = value.replace(/\n/g, '<br>');

        if (maxLines) {
            return `
                <div class="multiline-text" style="
                    display: -webkit-box;
                    -webkit-line-clamp: ${maxLines};
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    ${html}
                </div>
            `;
        }

        return html;
    }

    // Форматирование тегов
    static tags(value, separator = ',') {
        if (!value) return '-';

        if (Array.isArray(value)) {
            return value.map(tag =>
                `<span class="badge badge-light">${tag}</span>`
            ).join(' ');
        }

        if (typeof value === 'string') {
            return value.split(separator).map(tag =>
                `<span class="badge badge-light">${tag.trim()}</span>`
            ).join(' ');
        }

        return value;
    }

    // Форматирование рейтинга
    static rating(value, max = 5) {
        if (value === null || value === undefined) return '-';

        const fullStars = Math.floor(value);
        const hasHalfStar = value % 1 >= 0.5;
        const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Полные звезды
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }

        // Половина звезды
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }

        // Пустые звезды
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }

        return `<span class="rating-stars">${stars} <small class="text-muted">(${Formatters.number(value, 1)})</small></span>`;
    }

    // Форматирование прогресса
    static progress(value, options = {}) {
        if (value === null || value === undefined) return '-';

        const {
            showValue = true,
            valueFormat = 'percent',
            height = '8px',
            striped = false,
            animated = false
        } = options;

        const percent = Math.min(100, Math.max(0, value));
        const valueText = valueFormat === 'percent' ?
            `${percent}%` :
            Formatters.number(value, 1);

        const progressClass = [
            'progress-bar',
            striped ? 'progress-bar-striped' : '',
            animated ? 'progress-bar-animated' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="progress-wrapper">
                <div class="progress" style="height: ${height}">
                    <div class="${progressClass}" 
                         role="progressbar" 
                         style="width: ${percent}%"
                         aria-valuenow="${percent}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                ${showValue ? `<small class="progress-value">${valueText}</small>` : ''}
            </div>
        `;
    }

    // Форматирование действий
    static actions(value, actions = []) {
        return actions.map(action => {
            const icon = action.icon || '';
            const title = action.title || '';
            const className = action.class || 'btn-sm';
            const type = action.type || 'secondary';

            return `
                <button type="button" 
                        class="btn btn-${type} ${className}"
                        onclick="${action.onclick}"
                        title="${title}">
                    ${icon ? `<i class="${icon}"></i>` : ''}
                </button>
            `;
        }).join(' ');
    }

    // Форматирование изображения
    static image(value, options = {}) {
        if (!value) return '-';

        const {
            width = '50px',
            height = '50px',
            alt = '',
            className = ''
        } = options;

        return `
            <img src="${value}" 
                 alt="${alt}" 
                 class="table-image ${className}"
                 style="width: ${width}; height: ${height}; object-fit: cover; border-radius: 4px;">
        `;
    }

    // Форматирование цвета
    static color(value) {
        if (!value) return '-';

        return `
            <div class="color-preview" style="
                display: inline-block;
                width: 20px;
                height: 20px;
                background-color: ${value};
                border-radius: 4px;
                border: 1px solid #ddd;
                vertical-align: middle;
                margin-right: 5px;
            "></div>
            <span>${value}</span>
        `;
    }

    // Форматирование файла
    static file(value, options = {}) {
        if (!value) return '-';

        const { showIcon = true, showSize = true } = options;

        let html = '';

        if (showIcon) {
            const ext = Helpers.getFileExtension(value.name || value);
            const icon = Formatters.getFileIcon(ext);
            html += `<i class="${icon} mr-2"></i>`;
        }

        html += `<span>${value.name || value}</span>`;

        if (showSize && value.size) {
            html += `<small class="text-muted ml-2">(${Helpers.formatFileSize(value.size)})</small>`;
        }

        return html;
    }

    static getFileIcon(extension) {
        const iconMap = {
            // Документы
            'pdf': 'fas fa-file-pdf text-danger',
            'doc': 'fas fa-file-word text-primary',
            'docx': 'fas fa-file-word text-primary',
            'xls': 'fas fa-file-excel text-success',
            'xlsx': 'fas fa-file-excel text-success',
            'ppt': 'fas fa-file-powerpoint text-warning',
            'pptx': 'fas fa-file-powerpoint text-warning',
            'txt': 'fas fa-file-alt',

            // Изображения
            'jpg': 'fas fa-file-image text-success',
            'jpeg': 'fas fa-file-image text-success',
            'png': 'fas fa-file-image text-success',
            'gif': 'fas fa-file-image text-success',
            'svg': 'fas fa-file-image text-success',

            // Архивы
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            '7z': 'fas fa-file-archive',

            // Другое
            'default': 'fas fa-file'
        };

        const ext = extension.toLowerCase();
        return iconMap[ext] || iconMap.default;
    }
}

// Добавляем стили для форматтеров
const formatterStyles = `
    .user-with-avatar {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
    }

    .user-name {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .rating-stars {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }

    .progress-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .progress {
        flex: 1;
        background-color: #e9ecef;
        border-radius: 0.25rem;
        overflow: hidden;
    }

    .progress-bar {
        background-color: #007bff;
        transition: width 0.6s ease;
    }

    .progress-bar-striped {
        background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
        background-size: 1rem 1rem;
    }

    .progress-bar-animated {
        animation: progress-bar-stripes 1s linear infinite;
    }

    @keyframes progress-bar-stripes {
        from { background-position: 1rem 0; }
        to { background-position: 0 0; }
    }

    .progress-value {
        min-width: 40px;
        text-align: right;
    }

    .multiline-text {
        line-height: 1.4;
    }

    .badge-light {
        background-color: #f8f9fa;
        color: #212529;
        border: 1px solid #dee2e6;
    }

    .table-image {
        vertical-align: middle;
    }

    .color-preview {
        display: inline-block;
        vertical-align: middle;
    }
`;

// Добавляем стили в документ
const formatterStyleSheet = document.createElement('style');
formatterStyleSheet.textContent = formatterStyles;
document.head.appendChild(formatterStyleSheet);

// Экспорт форматтеров
window.Formatters = Formatters;