// Компонент модального окна
class Modal {
    constructor(options = {}) {
        this.options = {
            title: 'Модальное окно',
            content: '',
            size: 'md', // sm, md, lg
            buttons: [],
            onClose: null,
            ...options
        };

        this.modalId = 'modal-' + Date.now();
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.show();
    }

    createModal() {
        const modalHTML = `
            <div class="modal-overlay" id="${this.modalId}-overlay">
                <div class="modal modal-${this.options.size}" id="${this.modalId}">
                    <div class="modal-header">
                        <h3>${this.options.title}</h3>
                        <button class="modal-close-btn" id="${this.modalId}-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${this.options.content}
                    </div>
                    ${this.options.buttons.length > 0 ? `
                        <div class="modal-footer">
                            ${this.options.buttons.map((btn, index) => `
                                <button class="btn btn-${btn.type || 'secondary'}" 
                                        id="${this.modalId}-btn-${index}">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('modal-container').innerHTML = modalHTML;
    }

    bindEvents() {
        // Кнопка закрытия
        const closeBtn = document.getElementById(`${this.modalId}-close`);
        const overlay = document.getElementById(`${this.modalId}-overlay`);

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Кнопки в футере
        this.options.buttons.forEach((btn, index) => {
            const button = document.getElementById(`${this.modalId}-btn-${index}`);
            if (button && btn.handler) {
                button.addEventListener('click', () => {
                    btn.handler();
                });
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    show() {
        const modal = document.getElementById(this.modalId);
        const overlay = document.getElementById(`${this.modalId}-overlay`);

        if (modal && overlay) {
            setTimeout(() => {
                modal.classList.add('active');
                overlay.classList.add('active');
            }, 10);
        }
    }

    close() {
        const modal = document.getElementById(this.modalId);
        const overlay = document.getElementById(`${this.modalId}-overlay`);

        if (modal && overlay) {
            modal.classList.remove('active');
            overlay.classList.remove('active');

            setTimeout(() => {
                if (this.options.onClose) {
                    this.options.onClose();
                }
                modal.remove();
                overlay.remove();
            }, 300);
        }
    }

    updateContent(newContent) {
        const modalBody = document.querySelector(`#${this.modalId} .modal-body`);
        if (modalBody) {
            modalBody.innerHTML = newContent;
        }
    }
}

// Глобальные функции для работы с модальными окнами
function showModal(options) {
    return new Modal(options);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay.active');
    if (modal) {
        modal.remove();
    }
}

// Добавляем стили для модальных окон
const modalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .modal-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .modal {
        background: white;
        border-radius: var(--border-radius);
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        max-width: 95%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transform: translateY(-20px);
        opacity: 0;
        transition: all 0.3s ease;
    }

    .modal.active {
        transform: translateY(0);
        opacity: 1;
    }

    .modal-sm {
        width: 400px;
    }

    .modal-md {
        width: 600px;
    }

    .modal-lg {
        width: 900px;
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        color: var(--primary-color);
    }

    .modal-close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
        transition: var(--transition);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .modal-close-btn:hover {
        background-color: #f5f7fa;
        color: var(--danger-color);
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    @media (max-width: 768px) {
        .modal-sm, .modal-md, .modal-lg {
            width: 95%;
            margin: 10% auto;
        }
        
        .modal-header, .modal-body, .modal-footer {
            padding: 1rem;
        }
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);