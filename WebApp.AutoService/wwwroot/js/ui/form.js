export default class Form {
    #form;
    #formOverlay;
    #formButtonClose;


    #formOptions = {
        title: 'Форма',
        position: 'right',
        size: 'medium',
        showOverlay: true,
        closeOnOverlayClick: true,
        animate: true,
        attr: {
            id: undefined,
            class: undefined
        }
    };

    #generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }


    constructor(options) {
        this.#formOptions = { ...this.#formOptions, ...options };
        this.#form = document.createElement('div');
        if (!this.#formOptions.attr.id)
            this.#formOptions.attr.id = `form-${this.#generateId()}`;
        this.#form.id = this.#formOptions?.attr?.id;
        this.#form.classList.add(`universal-form`);
        if (this.#formOptions.attr.class)
            this.#form.classList.add(this.#formOptions.attr.class);

        this.#applyPosition();
        this.#applySize();

        this.#form.innerHTML = `<div class="form-header">
                                    <h2 id="${this.#form.id}-title">${this.#formOptions.title}</h2>
                                    <button id="${this.#form.id}-close-btn" class="form-close-btn">
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                                
                                <div class="form-content">
                                    ${this.TemplateContent}
                                </div>
                                
                                <div class="form-footer">
                                    ${this.TemplateFooter}
                                </div>`;

        this._initControls();
        document.body.appendChild(this.#form);
    }

    _initControls() {
        this.#formButtonClose = this.#form.querySelector(`#${this.#form.id}-close-btn`);
        this.#formButtonClose.addEventListener('click', () => this.Hide());
    }

    get FormId() {
        return this.#form.id;
    }

    get Form() {
        return this.#form;
    }

    get TemplateContent() {
        return ``;
    }

    get TemplateFooter() {
        return ``;
    }

    // Установка позиции
    #applyPosition() {
        //???formConfig.position = position;

        // Удаляем все классы позиции
        this.#form.classList.remove('position-right', 'position-left', 'position-center', 'position-bottom');

        // Добавляем нужный класс
        this.#form.classList.add(`position-${this.#formOptions.position}`);
    }

    // Установка размера
    #applySize() {
        //???formConfig.size = size;

        // Удаляем все классы размера
        this.#form.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');

        // Добавляем нужный класс
        this.#form.classList.add(`size-${this.#formOptions.size}`);
    }

    // Открытие формы
    Show() {
        // Показываем форму
        this.#form.classList.add('active');
        this.#showOverlay();
    }

    // Закрытие формы
    Hide() {

        this.#form.classList.remove('active');
        this.#hideOverlay();

    }

    // Закрытие по клику на оверлей
    #hideOnOverlayClick() {
        if (this.#formOptions.closeOnOverlayClick)
            this.Hide();
    }

    #handleOverlayClick;
    // Показываем затемнение фона если нужно
    #showOverlay() {
        if (!this.#formOptions.showOverlay)
            return;

        this.#setupOverlay();
        this.#formOverlay.addEventListener('click', this.#handleOverlayClick);
        this.#formOverlay.classList.add('active');
    }

    #hideOverlay() {
        if (!this.#formOverlay)
            return;

        this.#formOverlay.removeEventListener('click', this.handleClick);
        this.#formOverlay.classList.remove('active');
    }

    #setupOverlay() {
        if (!this.#formOverlay)
            this.#formOverlay = document.getElementById('formOverlay');
        if (!this.#formOverlay) {
            this.#formOverlay = document.createElement('div');
            this.#formOverlay.id = 'formOverlay';
            this.#formOverlay.classList.add('form-overlay');
            this.#handleOverlayClick = this.#hideOnOverlayClick.bind(this);
            document.body.appendChild(this.#formOverlay);
        }
    }
}
