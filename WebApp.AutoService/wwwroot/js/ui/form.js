
export default class Form {
    #form;
    #formOverlay;
    #formButtonClose;


    #formOptions = {
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
                                    <h2 id="${this.#form.id}-title">Редактирование записи</h2>
                                    <button id="${this.#form.id}-close-btn" class="form-close-btn">
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                                
                                <div class="form-content">
                                    <form id="editForm">
                                        <div class="form-group">
                                            <label for="title">Название записи</label>
                                            <input type="text" id="title" class="form-control" placeholder="Введите название">
                                        </div>
                                
                                        <div class="form-group">
                                            <label for="description">Описание</label>
                                            <textarea id="description" class="form-control" placeholder="Введите описание"></textarea>
                                        </div>
                                
                                        <div class="form-group">
                                            <label for="category">Категория</label>
                                            <select id="category" class="form-control">
                                                <option value="">Выберите категорию</option>
                                                <option value="important">Важная</option>
                                                <option value="normal">Обычная</option>
                                                <option value="low">Низкий приоритет</option>
                                            </select>
                                        </div>
                                
                                        <div class="form-group">
                                            <label for="status">Статус</label>
                                            <select id="status" class="form-control">
                                                <option value="active">Активен</option>
                                                <option value="inactive">Неактивен</option>
                                                <option value="archived">В архиве</option>
                                            </select>
                                        </div>
                                
                                        <div class="form-group">
                                            <label for="date">Дата</label>
                                            <input type="date" id="date" class="form-control">
                                        </div>
                                
                                        <div class="form-group">
                                            <label for="tags">Теги (через запятую)</label>
                                            <input type="text" id="tags" class="form-control" placeholder="тег1, тег2, тег3">
                                        </div>
                                    </form>
                                </div>
                                
                                <div class="form-footer">
                                    <button class="form-btn form-btn-cancel" onclick="closeForm()">
                                        <span class="material-icons">close</span>
                                        Отмена
                                    </button>
                                    <button class="form-btn form-btn-save" onclick="saveForm()">
                                        <span class="material-icons">save</span>
                                        Сохранить
                                    </button>
                                </div>`;


        this.#formButtonClose = this.#form.querySelector(`#${this.#form.id}-close-btn`);
        this.#formButtonClose.addEventListener('click', () => this.Hide());
        document.body.appendChild(this.#form);
    }

    // Установка позиции
    #applyPosition() {
        //???formConfig.position = position;

        // Удаляем все классы позиции
        this.#form.classList.remove('position-right', 'position-left', 'position-center', 'position-bottom');

        // Добавляем нужный класс
        this.#form.classList.add(`position-${this.#formOptions.position}`);

        //***updateConfigDisplay();
        //***highlightActivePreview();
    }

    // Установка размера
    #applySize() {
        //???formConfig.size = size;

        // Удаляем все классы размера
        this.#form.classList.remove('size-small', 'size-medium', 'size-large', 'size-full');

        // Добавляем нужный класс
        this.#form.classList.add(`size-${this.#formOptions.size}`);

        //***updateConfigDisplay();
    }

    // Открытие формы
    Show() {
        //// Устанавливаем заголовок
        //document.getElementById('formTitle').textContent = 'Редактирование записи';

        // Показываем форму
        this.#form.classList.add('active');
        this.#showOverlay();

        //*** ??? // Блокируем скролл body
        //*** ??? document.body.style.overflow = 'hidden';
    }

    // Закрытие формы
    Hide() {
        this.#form.classList.remove('active');
        this.#hideOverlay();

        //*** document.body.style.overflow = '';
        //*** // Очищаем форму
        //*** document.getElementById('editForm').reset();
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
