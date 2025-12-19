// Утилита для показа уведомлений
class Notification {
    constructor(message, type = 'info', duration = 5000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.id = 'notification-' + Date.now();
        this.show();
    }

    show() {
        const container = document.getElementById('notification-container');
        if (!container) {
            this.createContainer();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${this.type}`;
        notification.id = this.id;

        notification.innerHTML = `
            <div class="notification-content">
                <i class="${this.getIcon()}"></i>
                <span>${this.message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.getElementById('notification-container').appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Автоматическое закрытие
        if (this.duration > 0) {
            this.timeout = setTimeout(() => {
                this.remove();
            }, this.duration);
        }

        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.remove();
        });
    }

    getIcon() {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[this.type] || icons.info;
    }

    remove() {
        const notification = document.getElementById(this.id);
        if (notification) {
            notification.classList.remove('show');
            notification.classList.add('hide');

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);

        // Добавляем стили
        const styles = `
            .notification-container {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                border-left: 4px solid var(--secondary-color);
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification-success {
                border-left-color: var(--success-color);
            }

            .notification-error {
                border-left-color: var(--danger-color);
            }

            .notification-warning {
                border-left-color: var(--warning-color);
            }

            .notification-info {
                border-left-color: var(--secondary-color);
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }

            .notification-content i {
                font-size: 1.2rem;
            }

            .notification-success .notification-content i {
                color: var(--success-color);
            }

            .notification-error .notification-content i {
                color: var(--danger-color);
            }

            .notification-warning .notification-content i {
                color: var(--warning-color);
            }

            .notification-info .notification-content i {
                color: var(--secondary-color);
            }

            .notification-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 1rem;
                margin-left: 10px;
                transition: var(--transition);
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }

            .notification-close:hover {
                background-color: #f5f5f5;
                color: var(--danger-color);
            }

            @media (max-width: 768px) {
                .notification-container {
                    top: 70px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .notification {
                    width: 100%;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Глобальные функции для уведомлений
function showNotification(message, type = 'info', duration = 5000) {
    return new Notification(message, type, duration);
}

function showSuccess(message, duration = 5000) {
    return new Notification(message, 'success', duration);
}

function showError(message, duration = 5000) {
    return new Notification(message, 'error', duration);
}

function showWarning(message, duration = 5000) {
    return new Notification(message, 'warning', duration);
}