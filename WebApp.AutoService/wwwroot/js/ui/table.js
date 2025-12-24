// Table
export default class Table {

    #elementTableId;
    #tableContainer;
    #fixedTable;
    #scrollableTable;

    constructor(elementTableId) {
        this.#elementTableId = elementTableId;
        this.#tableContainer = document.createElement('div');
        this.#tableContainer.id = elementTableId;
        this.#tableContainer.classList.add('table-container');
        this.#tableContainer.innerHTML = `<div class="table-scroll-container" id="${this.#elementTableId}-scroll-container">
                                              <div class="table-wrapper">
                                                  <!-- Фиксированные колонки (первые две) -->
                                                  <div class="fixed-columns">
                                                      <table class="fixed-table" id="${this.#elementTableId}-fixed">
                                                          <!-- Фиксированная часть будет сгенерирована через JS -->
                                                      </table>
                                                  </div>
                                                  
                                                  <!-- Прокручиваемые колонки (остальные) -->
                                                  <div class="scrollable-columns">
                                                      <table class="scrollable-table" id="${this.#elementTableId}-scrollable">
                                                          <!-- Прокручиваемая часть будет сгенерирована через JS -->
                                                      </table>
                                                  </div>
                                              </div>
                                          </div>`;

        this.#fixedTable = this.#tableContainer.querySelector(`#${this.#elementTableId}-fixed`);
        this.#scrollableTable = this.#tableContainer.querySelector(`#${this.#elementTableId}-scrollable`);
    }

    /* toElement :HTMLElement */
    render(toElement) {
        toElement.appendChild(this.#tableContainer);
    }

    renderData(headers, tableData) {
        const fixedTable = this.#fixedTable;
        const scrollableTable = this.#scrollableTable;

        // Очищаем содержимое
        fixedTable.innerHTML = '';
        scrollableTable.innerHTML = '';

        // Фиксированные колонки (первые две)
        const fixedColumns = headers.slice(0, 2);
        // Прокручиваемые колонки (остальные)
        const scrollableColumns = headers.slice(2);

        // === ФИКСИРОВАННАЯ ТАБЛИЦА (первые две колонки) ===

        // Создаем заголовок фиксированной таблицы
        const fixedThead = document.createElement('thead');
        const fixedHeaderRow = document.createElement('tr');

        fixedColumns.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.title;
            fixedHeaderRow.appendChild(th);
        });

        fixedThead.appendChild(fixedHeaderRow);
        fixedTable.appendChild(fixedThead);

        // Создаем тело фиксированной таблицы
        const fixedTbody = document.createElement('tbody');

        tableData.forEach(rowData => {
            const row = document.createElement('tr');

            fixedColumns.forEach(header => {
                const td = document.createElement('td');
                td.textContent = rowData[header.key];
                row.appendChild(td);
            });

            fixedTbody.appendChild(row);
        });

        fixedTable.appendChild(fixedTbody);

        // === ПРОКРУЧИВАЕМАЯ ТАБЛИЦА (остальные колонки) ===

        // Создаем заголовок прокручиваемой таблицы
        const scrollableThead = document.createElement('thead');
        const scrollableHeaderRow = document.createElement('tr');

        scrollableColumns.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.title;
            if (header.width) {
                th.style.width = `${header.width}px`;
                th.style.maxWidth = `${header.width}px`;
            }
            scrollableHeaderRow.appendChild(th);
        });

        scrollableThead.appendChild(scrollableHeaderRow);
        scrollableTable.appendChild(scrollableThead);

        // Создаем тело прокручиваемой таблицы
        const scrollableTbody = document.createElement('tbody');

        tableData.forEach(rowData => {
            const row = document.createElement('tr');

            scrollableColumns.forEach(header => {
                const td = document.createElement('td');

                // Заполняем содержимое ячейки в зависимости от типа данных
                const value = rowData[header.key];

                switch (header.key) {
                    //case 'status':
                    //    let statusClass = 'status-active';
                    //    let statusText = 'Активен';

                    //    if (value === 'pending') {
                    //        statusClass = 'status-pending';
                    //        statusText = 'Ожидание';
                    //    } else if (value === 'inactive') {
                    //        statusClass = 'status-inactive';
                    //        statusText = 'Неактивен';
                    //    }

                    //    td.innerHTML = `<span class="status ${statusClass}">${statusText}</span>`;
                    //    break;

                    //case 'sales':
                    //    const salesFormatted = new Intl.NumberFormat('ru-RU').format(value);
                    //    td.innerHTML = `<i class="material-icons icon-blue">attach_money</i> ${salesFormatted}`;
                    //    break;

                    //case 'growth':
                    //    const growthClass = value >= 0 ? 'value-positive' : 'value-negative';
                    //    const growthIcon = value >= 0 ? 'trending_up' : 'trending_down';
                    //    const growthColor = value >= 0 ? 'icon-green' : 'icon-red';
                    //    td.innerHTML = `<i class="material-icons ${growthColor}">${growthIcon}</i> <span class="${growthClass}">${value >= 0 ? '+' : ''}${value}%</span>`;
                    //    break;

                    //case 'rating':
                    //    if (value > 0) {
                    //        td.innerHTML = `<i class="material-icons icon-green">star</i> ${value.toFixed(1)}`;
                    //    } else {
                    //        td.innerHTML = '<span style="color: #999;">—</span>';
                    //    }
                    //    break;

                    default:
                        td.textContent = value;
                }

                if (header.align) {
                    td.style.textAlign = `${header.align}`;
                }

                row.appendChild(td);
            });

            scrollableTbody.appendChild(row);
        });

        scrollableTable.appendChild(scrollableTbody);

        //// Обновляем счетчик записей
        //document.getElementById('recordCount').textContent = tableData.length;

        // Синхронизируем высоту строк
        this.#syncRowHeights();        
    }


    // Синхронизация высоты строк между таблицами
    #syncRowHeights() {
        const fixedTable = this.#fixedTable;
        const scrollableTable = this.#scrollableTable;

        const fixedRows = fixedTable.querySelectorAll('tbody tr');
        const scrollableRows = scrollableTable.querySelectorAll('tbody tr');

        // Устанавливаем одинаковую высоту для соответствующих строк
        fixedRows.forEach((row, index) => {
            if (scrollableRows[index]) {
                const maxHeight = 43; // Math.max(row.offsetHeight, scrollableRows[index].offsetHeight);
                row.style.height = `${maxHeight}px`;
                scrollableRows[index].style.height = `${maxHeight}px`;
            }
        });
    }
}