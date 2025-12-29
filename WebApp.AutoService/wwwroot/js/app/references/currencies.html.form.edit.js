import FormEdit from "../../ui/form.edit.js";

export default class CurrenciesFormEdit extends FormEdit {

    constructor(options) {
        super(options)
    }

    get TemplateFields() {
        return `<div class="form-group">
                    <label for="title">Код</label>
                    <input type="text" id="${this.FormId}-code" class="form-control" placeholder="Введите код">
                </div>
                <div class="form-group">
                    <label for="title">Обозначение</label>
                    <input type="text" id="${this.FormId}-symbol" class="form-control" placeholder="Введите обозначение">
                </div>
                <div class="form-group">
                    <label for="title">Наименование</label>
                    <input type="text" id="${this.FormId}-name" class="form-control" placeholder="Введите наименование">
                </div>
        `;
    }


    #inputCode;
    #inputSymbol;
    #inputName;

    _initControls() {
        this.#inputCode = this.Form.querySelector(`#${this.FormId}-code`);
        this.#inputSymbol = this.Form.querySelector(`#${this.FormId}-symbol`);
        this.#inputName = this.Form.querySelector(`#${this.FormId}-name`);
        super._initControls();
    }

    _updateDataContext() {
        const dataContext = this.DataContext;
        this.#inputCode.value = dataContext?.Code;
        this.#inputSymbol.value = dataContext?.Symbol;
        this.#inputName.value = dataContext?.Name;
    }
}
