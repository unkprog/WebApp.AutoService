import FormEdit from "../../ui/form.edit.js";

export default class CurrenciesFormEdit extends FormEdit {
    #inputCode;
    #inputSymbol;
    #inputName;

    constructor(options) {
        super(options);
    }

    get TemplateFields() {
        return `<div class="form-group">
                    <label for="${this.FormId}-code">Код</label>
                    <input type="text" id="${this.FormId}-code" class="form-control" 
                           placeholder="Введите код" name="code">
                </div>
                <div class="form-group">
                    <label for="${this.FormId}-symbol">Обозначение</label>
                    <input type="text" id="${this.FormId}-symbol" class="form-control" 
                           placeholder="Введите обозначение" name="symbol">
                </div>
                <div class="form-group">
                    <label for="${this.FormId}-name">Наименование</label>
                    <input type="text" id="${this.FormId}-name" class="form-control" 
                           placeholder="Введите наименование" name="name">
                </div>`;
    }

    _initControls() {
        super._initControls();

        this.#inputCode = this.Form.querySelector(`#${this.FormId}-code`);
        this.#inputSymbol = this.Form.querySelector(`#${this.FormId}-symbol`);
        this.#inputName = this.Form.querySelector(`#${this.FormId}-name`);
    }

    _updateDataContext() {
        const dataContext = this.DataContext;

        if (this.#inputCode) {
            this.#inputCode.value = dataContext?.Code || '';
        }

        if (this.#inputSymbol) {
            this.#inputSymbol.value = dataContext?.Symbol || '';
        }

        if (this.#inputName) {
            this.#inputName.value = dataContext?.Name || '';
        }
    }

    saveForm() {
        // Получаем данные из формы
        const formData = {
            Code: this.#inputCode?.value || '',
            Symbol: this.#inputSymbol?.value || '',
            Name: this.#inputName?.value || ''
        };

        // Здесь можно добавить валидацию
        if (!formData.Code.trim()) {
            console.error('Код валюты обязателен');
            return;
        }

        // Вызываем родительский метод или свою логику сохранения
        super.saveForm();

        // Дополнительная логика для сохранения валюты
        console.log('Currency data:', formData);
    }
}