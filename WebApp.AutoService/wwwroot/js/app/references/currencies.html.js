export default class CurrenciesHtml {

    #table;
    #buttonAdd;

    // Заголовки таблицы
    headers = [
        { key: 'Id', title: 'Id', align: 'center' },
        { key: 'Code', title: 'Код', align: 'center' },
        { key: 'Symbol', title: 'Обозначение', width: 100, align: 'center' },
        { key: 'Name', title: 'Наименование' }
    ];

    tableData = [
        { Id: 1, Code: "RUB", Symbol: "₽", Name: "Российский рубль" },
        { Id: 2, Code: "USD", Symbol: "$", Name: "Доллар" },
        { Id: 3, Code: "EUR", Symbol: "€", Name: "Евро" },
        { Id: 4, Code: "GBP", Symbol: "£", Name: "Фунт стерлингов" },
        { Id: 5, Code: "CNY", Symbol: "¥", Name: "Китайский юань" },
        { Id: 6, Code: "JPY", Symbol: "¥", Name: "Японская йена" }
    ];

    async init() {
        const { default: Table } = await import("/js/ui/table.js");
        this.#table = new Table("currencies-table");
        this.#table.render(document.getElementById("currencies-card"));

        this.#table.renderData(this.headers, this.tableData);

        this.#buttonAdd = document.getElementById('currencies-card-button-add');
        this.#buttonAdd.addEventListener('click', async (e) => await this.#buttonAddClick(e));
    }

    async #buttonAddClick(e) {
        await this.#initForm();
        this.#form.DataContext = this.tableData[3];
        this.#form.Show();
    }

    #form;
    async #initForm() {
        if (this.#form)
            return;

        const { default: FormEdit } = await import("/js/app/references/currencies.html.form.edit.js");
        this.#form = new FormEdit({
            title: 'Валюта',
            attr: { id: "currencies-form-edit" },


        });
    }
}

