import Form from "./form.js";

export default class FormEdit extends Form {
    constructor(options) {
        super(options)
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
        return `<button class="form-btn form-btn-cancel" onclick="closeForm()">
                    <span class="material-icons">close</span>
                    Отмена
                </button>
                <button class="form-btn form-btn-save" onclick="saveForm()">
                    <span class="material-icons">save</span>
                    Сохранить
                </button>`;
    }


    // Закрытие формы
    Hide() {
        super.Hide();
        // Очищаем форму
        document.getElementById(`${this.FormId}-edit-fields`).reset();
    }


    #dataContext = {};

    get DataContext() { this.#dataContext; }
    set DataContext(value) {
        this.#dataContext = value;
        this._updateDataContext();
    }

    get _loadDataContextUrl() {
        return '';
    }

    get _saveDataContextUrl() {
        return '';
    }

    LoadDataContext(id) {

    }

    _updateDataContext() {

    }

    _initControls() {
        super._initControls();
    }
}
