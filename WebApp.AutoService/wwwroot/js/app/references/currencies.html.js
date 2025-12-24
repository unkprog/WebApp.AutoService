export default class CurrenciesHtml {

    #table;

    async init() {
        const { default: Table } = await import("/js/ui/table.js");
        this.#table = new Table("currencies-table");
        this.#table.render(document.getElementById("currencies-card"));

        // Заголовки таблицы
        const headers = [
            { key: 'Id', title: 'Id', align: 'center' },
            { key: 'Code', title: 'Код', align: 'center' },
            { key: 'Symbol', title: 'Обозначение', width: 100, align: 'center' },
            { key: 'Name', title: 'Наименование' }
        ];

        const tableData = [
            { Id: 1, Code: "RUB", Symbol: "₽", Name: "Российский рубль" },
            { Id: 2, Code: "USD", Symbol: "$", Name: "Доллар" }, 
            { Id: 3, Code: "EUR", Symbol: "€", Name: "Евро" },
            { Id: 4, Code: "GBP", Symbol: "£", Name: "Фунт стерлингов" },
            { Id: 5, Code: "CNY", Symbol: "¥", Name: "Китайский юань" },
            { Id: 6, Code: "JPY", Symbol: "¥", Name: "Японская йена" }
        ];

        this.#table.renderData(headers, tableData);
    }
}

