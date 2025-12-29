import Form from "./form.js";

export default class FormEdit extends Form {
    #dataContext = {};
    #formEditFields;

    constructor(options) {
        super(options);
    }

    get TemplateFields() {
        return ``;
    }

    get TemplateContent() {
        return `<form id="${this.FormId}-edit-fields">
                  ${this.TemplateFields}
                </form>`;
    }

    get TemplateFooter() {
        return `<button class="form-btn form-btn-cancel" type="button" id="${this.FormId}-cancel-btn">
                    <span class="material-icons">close</span>
                    Отмена
                </button>
                <button class="form-btn form-btn-save" type="button" id="${this.FormId}-save-btn">
                    <span class="material-icons">save</span>
                    Сохранить
                </button>`;
    }

    // Закрытие формы
    Hide() {
        super.Hide();
        // Очищаем форму
        if (this.#formEditFields)
            this.#formEditFields.reset();
    }

    get _loadDataContextUrl() {
        return '';
    }

    get _saveDataContextUrl() {
        return '';
    }

    get DataContext() {
        return this.#dataContext;
    }

    set DataContext(value) {
        this.#dataContext = value;
        this._updateDataContext();
    }

    LoadDataContext(id) {
        // Реализация загрузки данных
    }

    _updateDataContext() {
        // Обновление UI на основе DataContext
    }

    _initControls() {
        super._initControls();
        this.#formEditFields = this.Form.querySelector(`#${this.FormId}-edit-fields`);

        const cancelBtn = this.Form.querySelector(`#${this.FormId}-cancel-btn`);
        const saveBtn = this.Form.querySelector(`#${this.FormId}-save-btn`);

        if (cancelBtn)
            cancelBtn.addEventListener('click', () => this.Hide());
       
        if (saveBtn)
            saveBtn.addEventListener('click', () => this.saveForm());
    }

    saveForm() {
        // Реализация сохранения формы
        console.log('Form saved');
    }
}