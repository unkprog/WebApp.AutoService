export class DocumentEditor {
    constructor(documentConstructor) {
        this.docConstructor = documentConstructor;
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.initialize();
    }

    initialize() {
        this.setupDocumentEvents();
        this.setupPropertiesPanel();
        this.setupPrintPreview();
        this.setupKeyboardShortcuts();
        this.initializeResizableElements();
    }

    setupDocumentEvents() {
        const documentContent = document.getElementById('document-content');

        // Обработка дропа элементов
        documentContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        documentContent.addEventListener('drop', (e) => {
            e.preventDefault();
            const elementType = e.dataTransfer.getData('text/plain');
            if (elementType) {
                this.addElementAtPosition(elementType, e.clientX, e.clientY);
            }
        });

        // Клик вне элементов для снятия выделения
        documentContent.addEventListener('click', (e) => {
            if (!e.target.closest('.document-element') && !e.target.closest('.properties-panel')) {
                this.deselectElement();
            }
        });

        // Двойной клик для редактирования текста
        documentContent.addEventListener('dblclick', (e) => {
            const element = e.target.closest('.document-element');
            if (element && element.querySelector('.editable-field')) {
                const editableField = element.querySelector('.editable-field');
                editableField.focus();
                // Выделяем весь текст при двойном клике
                if (editableField.tagName === 'INPUT' || editableField.tagName === 'TEXTAREA') {
                    editableField.select();
                } else if (document.createRange) {
                    const range = document.createRange();
                    range.selectNodeContents(editableField);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        });
    }

    addElementAtPosition(elementType, clientX, clientY) {
        if (!this.docConstructor.currentDocument) {
            alert('Сначала выберите или создайте документ');
            return;
        }

        const documentContent = document.getElementById('document-content');
        const rect = documentContent.getBoundingClientRect();
        const x = clientX - rect.left - 20; // Смещение для лучшего позиционирования
        const y = clientY - rect.top - 20;

        this.docConstructor.addElement(elementType, x, y);
    }

    setupPropertiesPanel() {
        // Обновляем свойства при изменении полей документа
        document.getElementById('document-title').addEventListener('input', (e) => {
            if (this.docConstructor.currentDocument) {
                this.docConstructor.currentDocument.title = e.target.textContent;
                this.updateDocumentHeader();
            }
        });

        document.getElementById('doc-number').addEventListener('change', (e) => {
            if (this.docConstructor.currentDocument) {
                this.docConstructor.currentDocument.number = e.target.value;
            }
        });

        document.getElementById('doc-date').addEventListener('change', (e) => {
            if (this.docConstructor.currentDocument) {
                this.docConstructor.currentDocument.date = e.target.value;
            }
        });
    }

    updateDocumentHeader() {
        const docNameElement = document.getElementById('current-doc-name');
        if (this.docConstructor.currentDocument && this.docConstructor.currentDocument.title) {
            docNameElement.textContent = this.docConstructor.currentDocument.title;
        }
    }

    showElementProperties(elementData, elementIndex) {
        const propertiesContent = document.getElementById('properties-content');

        // Базовые свойства
        let propertiesHTML = `
            <div class="property-group">
                <label>Тип элемента:</label>
                <input type="text" value="${this.getElementTypeName(elementData.type)}" disabled>
            </div>
            <div class="property-group">
                <label>ID элемента:</label>
                <input type="text" value="element_${elementIndex}" disabled>
            </div>
        `;

        // Специфичные свойства для каждого типа элемента
        switch (elementData.type) {
            case 'text':
                propertiesHTML += this.getTextProperties(elementData);
                break;
            case 'table':
                propertiesHTML += this.getTableProperties(elementData);
                break;
            case 'date':
                propertiesHTML += this.getDateProperties(elementData);
                break;
            case 'number':
                propertiesHTML += this.getNumberProperties(elementData);
                break;
            case 'select':
                propertiesHTML += this.getSelectProperties(elementData);
                break;
        }

        // Общие стилевые свойства
        propertiesHTML += this.getStyleProperties(elementData);

        // Кнопка применения
        propertiesHTML += `
            <div class="property-actions">
                <button id="apply-properties" class="btn btn-primary">
                    <i class="fas fa-check"></i> Применить
                </button>
                <button id="reset-properties" class="btn btn-secondary">
                    <i class="fas fa-undo"></i> Сбросить
                </button>
            </div>
        `;

        propertiesContent.innerHTML = propertiesHTML;

        // Устанавливаем обработчики
        document.getElementById('apply-properties').addEventListener('click', () => {
            this.applyElementProperties(elementData, elementIndex);
        });

        document.getElementById('reset-properties').addEventListener('click', () => {
            this.resetElementProperties(elementData, elementIndex);
        });
    }

    getTextProperties(elementData) {
        return `
            <div class="property-group">
                <label>Содержимое:</label>
                <textarea id="prop-text" rows="4">${elementData.content || ''}</textarea>
            </div>
            <div class="property-group">
                <label>Шрифт:</label>
                <select id="prop-font-family">
                    <option value="Arial" ${elementData.style?.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                    <option value="Times New Roman" ${elementData.style?.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                    <option value="Calibri" ${elementData.style?.fontFamily === 'Calibri' ? 'selected' : ''}>Calibri</option>
                    <option value="Verdana" ${elementData.style?.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                </select>
            </div>
            <div class="property-group">
                <label>Размер шрифта:</label>
                <input type="text" id="prop-font-size" value="${elementData.style?.fontSize || '14px'}">
            </div>
            <div class="property-group">
                <label>Цвет текста:</label>
                <input type="color" id="prop-color" value="${elementData.style?.color || '#000000'}">
            </div>
        `;
    }

    getTableProperties(elementData) {
        const headers = elementData.content?.headers || [];
        const rows = elementData.content?.rows || [];

        return `
            <div class="property-group">
                <label>Количество столбцов:</label>
                <input type="number" id="prop-table-cols" value="${headers.length}" min="1" max="10">
            </div>
            <div class="property-group">
                <label>Количество строк:</label>
                <input type="number" id="prop-table-rows" value="${rows.length}" min="1" max="50">
            </div>
            <div class="property-group">
                <label>Заголовок таблицы:</label>
                <input type="text" id="prop-table-caption" value="${elementData.caption || ''}">
            </div>
            <div class="property-group">
                <label>Ширина таблицы:</label>
                <input type="text" id="prop-table-width" value="${elementData.style?.width || '100%'}">
            </div>
        `;
    }

    getDateProperties(elementData) {
        return `
            <div class="property-group">
                <label>Формат даты:</label>
                <select id="prop-date-format">
                    <option value="DD.MM.YYYY" ${elementData.format === 'DD.MM.YYYY' ? 'selected' : ''}>ДД.ММ.ГГГГ</option>
                    <option value="YYYY-MM-DD" ${elementData.format === 'YYYY-MM-DD' ? 'selected' : ''}>ГГГГ-ММ-ДД</option>
                    <option value="MMMM D, YYYY" ${elementData.format === 'MMMM D, YYYY' ? 'selected' : ''}>15 января, 2024</option>
                </select>
            </div>
            <div class="property-group">
                <label>Значение по умолчанию:</label>
                <select id="prop-date-default">
                    <option value="today" ${!elementData.content || elementData.content === 'today' ? 'selected' : ''}>Текущая дата</option>
                    <option value="empty" ${elementData.content === '' ? 'selected' : ''}>Пустое поле</option>
                    <option value="custom" ${elementData.content && elementData.content !== 'today' ? 'selected' : ''}>Заданная дата</option>
                </select>
            </div>
        `;
    }

    getNumberProperties(elementData) {
        return `
            <div class="property-group">
                <label>Минимальное значение:</label>
                <input type="number" id="prop-number-min" value="${elementData.min || ''}">
            </div>
            <div class="property-group">
                <label>Максимальное значение:</label>
                <input type="number" id="prop-number-max" value="${elementData.max || ''}">
            </div>
            <div class="property-group">
                <label>Шаг изменения:</label>
                <input type="number" id="prop-number-step" value="${elementData.step || '1'}">
            </div>
            <div class="property-group">
                <label>Формат числа:</label>
                <select id="prop-number-format">
                    <option value="integer" ${elementData.format === 'integer' ? 'selected' : ''}>Целое число</option>
                    <option value="decimal" ${elementData.format === 'decimal' ? 'selected' : ''}>Десятичное</option>
                    <option value="currency" ${elementData.format === 'currency' ? 'selected' : ''}>Денежный</option>
                </select>
            </div>
        `;
    }

    getSelectProperties(elementData) {
        const options = elementData.options || ['Вариант 1', 'Вариант 2', 'Вариант 3'];

        return `
            <div class="property-group">
                <label>Варианты выбора (каждый с новой строки):</label>
                <textarea id="prop-select-options" rows="4">${options.join('\n')}</textarea>
            </div>
            <div class="property-group">
                <label>Значение по умолчанию:</label>
                <input type="text" id="prop-select-default" value="${elementData.defaultValue || ''}">
            </div>
        `;
    }

    getStyleProperties(elementData) {
        return `
            <div class="property-section">
                <h4>Позиционирование</h4>
                <div class="property-group">
                    <label>Позиция X:</label>
                    <input type="number" id="prop-pos-x" value="${elementData.position?.x || 0}">
                </div>
                <div class="property-group">
                    <label>Позиция Y:</label>
                    <input type="number" id="prop-pos-y" value="${elementData.position?.y || 0}">
                </div>
            </div>
            <div class="property-section">
                <h4>Отступы</h4>
                <div class="property-group">
                    <label>Верхний:</label>
                    <input type="text" id="prop-margin-top" value="${elementData.style?.marginTop || '0px'}">
                </div>
                <div class="property-group">
                    <label>Правый:</label>
                    <input type="text" id="prop-margin-right" value="${elementData.style?.marginRight || '0px'}">
                </div>
                <div class="property-group">
                    <label>Нижний:</label>
                    <input type="text" id="prop-margin-bottom" value="${elementData.style?.marginBottom || '0px'}">
                </div>
                <div class="property-group">
                    <label>Левый:</label>
                    <input type="text" id="prop-margin-left" value="${elementData.style?.marginLeft || '0px'}">
                </div>
            </div>
            <div class="property-section">
                <h4>Выравнивание</h4>
                <div class="property-group">
                    <label>Горизонтальное:</label>
                    <select id="prop-text-align">
                        <option value="left" ${elementData.style?.textAlign === 'left' ? 'selected' : ''}>По левому краю</option>
                        <option value="center" ${elementData.style?.textAlign === 'center' ? 'selected' : ''}>По центру</option>
                        <option value="right" ${elementData.style?.textAlign === 'right' ? 'selected' : ''}>По правому краю</option>
                        <option value="justify" ${elementData.style?.textAlign === 'justify' ? 'selected' : ''}>По ширине</option>
                    </select>
                </div>
                <div class="property-group">
                    <label>Вертикальное:</label>
                    <select id="prop-vertical-align">
                        <option value="top" ${elementData.style?.verticalAlign === 'top' ? 'selected' : ''}>По верху</option>
                        <option value="middle" ${elementData.style?.verticalAlign === 'middle' ? 'selected' : ''}>По центру</option>
                        <option value="bottom" ${elementData.style?.verticalAlign === 'bottom' ? 'selected' : ''}>По низу</option>
                    </select>
                </div>
            </div>
        `;
    }

    getElementTypeName(type) {
        const names = {
            'text': 'Текстовое поле',
            'table': 'Таблица',
            'date': 'Дата',
            'number': 'Числовое поле',
            'select': 'Выпадающий список',
            'signature': 'Подпись',
            'logo': 'Логотип'
        };
        return names[type] || type;
    }

    applyElementProperties(elementData, elementIndex) {
        if (!this.docConstructor.currentDocument) return;

        const page = this.docConstructor.currentPage;
        const element = this.docConstructor.currentDocument.pages[page][elementIndex];

        // Применяем специфичные свойства
        switch (element.type) {
            case 'text':
                element.content = document.getElementById('prop-text').value;
                element.style.fontFamily = document.getElementById('prop-font-family').value;
                element.style.fontSize = document.getElementById('prop-font-size').value;
                element.style.color = document.getElementById('prop-color').value;
                break;

            case 'table':
                const cols = parseInt(document.getElementById('prop-table-cols').value);
                const rows = parseInt(document.getElementById('prop-table-rows').value);

                // Обновляем структуру таблицы
                element.content = element.content || { headers: [], rows: [] };

                // Обновляем заголовки
                while (element.content.headers.length < cols) {
                    element.content.headers.push(`Заголовок ${element.content.headers.length + 1}`);
                }
                element.content.headers = element.content.headers.slice(0, cols);

                // Обновляем строки
                while (element.content.rows.length < rows) {
                    const newRow = Array(cols).fill('');
                    element.content.rows.push(newRow);
                }
                element.content.rows = element.content.rows.slice(0, rows).map(row => {
                    while (row.length < cols) row.push('');
                    return row.slice(0, cols);
                });

                element.caption = document.getElementById('prop-table-caption').value;
                element.style.width = document.getElementById('prop-table-width').value;
                break;

            case 'date':
                element.format = document.getElementById('prop-date-format').value;
                const dateDefault = document.getElementById('prop-date-default').value;
                if (dateDefault === 'today') {
                    element.content = new Date().toISOString().split('T')[0];
                } else if (dateDefault === 'empty') {
                    element.content = '';
                }
                break;

            case 'number':
                element.min = document.getElementById('prop-number-min').value;
                element.max = document.getElementById('prop-number-max').value;
                element.step = document.getElementById('prop-number-step').value;
                element.format = document.getElementById('prop-number-format').value;
                break;

            case 'select':
                const optionsText = document.getElementById('prop-select-options').value;
                element.options = optionsText.split('\n').filter(opt => opt.trim());
                element.defaultValue = document.getElementById('prop-select-default').value;
                break;
        }

        // Применяем стилевые свойства
        element.position = {
            x: parseInt(document.getElementById('prop-pos-x').value) || 0,
            y: parseInt(document.getElementById('prop-pos-y').value) || 0
        };

        element.style = element.style || {};
        element.style.marginTop = document.getElementById('prop-margin-top').value;
        element.style.marginRight = document.getElementById('prop-margin-right').value;
        element.style.marginBottom = document.getElementById('prop-margin-bottom').value;
        element.style.marginLeft = document.getElementById('prop-margin-left').value;
        element.style.textAlign = document.getElementById('prop-text-align').value;
        element.style.verticalAlign = document.getElementById('prop-vertical-align').value;

        // Перерисовываем документ
        this.docConstructor.renderDocument();

        // Выделяем обновленный элемент
        const elements = document.querySelectorAll('.document-element');
        if (elements[elementIndex]) {
            this.selectElement(elements[elementIndex], element, elementIndex);
        }
    }

    resetElementProperties(elementData, elementIndex) {
        if (!this.docConstructor.currentDocument) return;

        const page = this.docConstructor.currentPage;
        const element = this.docConstructor.currentDocument.pages[page][elementIndex];

        // Сбрасываем к значениям по умолчанию
        delete element.style;
        delete element.position;

        if (element.type === 'text') {
            element.content = 'Новый текст';
        } else if (element.type === 'table') {
            element.content = {
                headers: ['Заголовок 1', 'Заголовок 2', 'Заголовок 3'],
                rows: [['', '', ''], ['', '', '']]
            };
        }

        this.docConstructor.renderDocument();
        this.showElementProperties(element, elementIndex);
    }

    selectElement(elementDiv, elementData, elementIndex) {
        // Снимаем выделение со всех элементов
        document.querySelectorAll('.document-element').forEach(el => {
            el.classList.remove('selected');
        });

        // Выделяем выбранный элемент
        elementDiv.classList.add('selected');
        this.selectedElement = {
            element: elementDiv,
            data: elementData,
            index: elementIndex
        };

        // Показываем свойства элемента
        this.showElementProperties(elementData, elementIndex);

        // Активируем возможность перетаскивания
        this.setupElementDragging(elementDiv, elementData, elementIndex);

        // Активируем изменение размера
        this.setupElementResizing(elementDiv, elementData, elementIndex);
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.element.classList.remove('selected');
            this.selectedElement = null;

            // Очищаем панель свойств
            const propertiesContent = document.getElementById('properties-content');
            propertiesContent.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Выберите элемент для редактирования свойств</p>
                </div>
            `;
        }
    }

    setupElementDragging(elementDiv, elementData, elementIndex) {
        elementDiv.style.cursor = 'move';

        elementDiv.addEventListener('mousedown', (e) => {
            if (e.target.closest('.element-controls')) return;

            this.isDragging = true;
            this.dragOffset = {
                x: e.clientX - elementDiv.offsetLeft,
                y: e.clientY - elementDiv.offsetTop
            };

            document.addEventListener('mousemove', this.handleDrag);
            document.addEventListener('mouseup', this.stopDrag);
        });
    }

    handleDrag = (e) => {
        if (!this.isDragging || !this.selectedElement) return;

        const elementDiv = this.selectedElement.element;
        const documentContent = document.getElementById('document-content');
        const rect = documentContent.getBoundingClientRect();

        let x = e.clientX - rect.left - this.dragOffset.x;
        let y = e.clientY - rect.top - this.dragOffset.y;

        // Ограничиваем перемещение в пределах документа
        x = Math.max(0, Math.min(x, rect.width - elementDiv.offsetWidth));
        y = Math.max(0, Math.min(y, rect.height - elementDiv.offsetHeight));

        elementDiv.style.left = `${x}px`;
        elementDiv.style.top = `${y}px`;
        elementDiv.style.position = 'absolute';

        // Обновляем позицию в данных
        if (this.docConstructor.currentDocument) {
            const page = this.docConstructor.currentPage;
            const element = this.docConstructor.currentDocument.pages[page][this.selectedElement.index];
            element.position = { x, y };
        }
    }

    stopDrag = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }

    setupElementResizing(elementDiv, elementData, elementIndex) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.innerHTML = '<i class="fas fa-expand-alt"></i>';
        elementDiv.appendChild(resizeHandle);

        let isResizing = false;
        let startWidth, startHeight, startX, startY;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;

            startWidth = elementDiv.offsetWidth;
            startHeight = elementDiv.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;

            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });

        const handleResize = (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newWidth = Math.max(50, startWidth + deltaX);
            const newHeight = Math.max(20, startHeight + deltaY);

            elementDiv.style.width = `${newWidth}px`;
            elementDiv.style.height = `${newHeight}px`;

            // Обновляем размер в данных
            if (this.docConstructor.currentDocument) {
                const page = this.docConstructor.currentPage;
                const element = this.docConstructor.currentDocument.pages[page][elementIndex];
                element.style = element.style || {};
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
            }
        };

        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

    initializeResizableElements() {
        // Добавляем стили для изменения размера
        const style = document.createElement('style');
        style.textContent = `
            .resize-handle {
                position: absolute;
                bottom: 5px;
                right: 5px;
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                color: white;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: nwse-resize;
                opacity: 0;
                transition: opacity 0.2s;
                font-size: 12px;
            }
            
            .document-element:hover .resize-handle {
                opacity: 1;
            }
            
            .document-element.selected .resize-handle {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    setupPrintPreview() {
        document.getElementById('print-preview-btn').addEventListener('click', () => {
            this.printDocument();
        });

        document.getElementById('print-btn').addEventListener('click', () => {
            this.printDocument();
        });
    }

    printDocument() {
        // Создаем копию документа для печати
        const printContent = document.getElementById('document-paper').cloneNode(true);

        // Удаляем элементы управления
        printContent.querySelectorAll('.element-controls, .resize-handle, .editable-field[contenteditable="true"]').forEach(el => {
            if (el.contentEditable === 'true') {
                el.removeAttribute('contenteditable');
                el.classList.remove('editable-field');
            } else {
                el.remove();
            }
        });

        // Создаем новое окно для печати
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Печать документа</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    @media print {
                        @page {
                            size: A4;
                            margin: 2cm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                    .document-paper {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 2cm;
                        margin: 0 auto;
                        background: white;
                        box-shadow: none;
                        border: none;
                    }
                </style>
            </head>
            <body>
                ${printContent.outerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Сочетания клавиш работают только когда фокус не в поле ввода
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    if (this.selectedElement) {
                        this.deleteSelectedElement();
                    }
                    break;

                case 'Escape':
                    this.deselectElement();
                    break;

                case 's':
                case 'S':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.docConstructor.saveDocument();
                    }
                    break;

                case 'p':
                case 'P':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.printDocument();
                    }
                    break;
            }
        });
    }

    deleteSelectedElement() {
        if (this.selectedElement && confirm('Удалить выбранный элемент?')) {
            const index = this.selectedElement.index;
            if (this.docConstructor.currentDocument) {
                const page = this.docConstructor.currentPage;
                this.docConstructor.currentDocument.pages[page].splice(index, 1);
                this.docConstructor.renderDocument();
                this.deselectElement();
            }
        }
    }

    exportToPDF() {
        // В реальном приложении здесь бы использовалась библиотека типа jsPDF
        alert('Экспорт в PDF будет реализован в следующей версии');
    }

    exportToWord() {
        // В реальном приложении здесь бы использовалась библиотека для генерации DOCX
        alert('Экспорт в Word будет реализован в следующей версии');
    }

    addPageBreak() {
        // Добавляет разрыв страницы в документ
        const pageBreak = {
            type: 'page-break',
            content: '',
            style: { pageBreakBefore: 'always' }
        };

        if (this.docConstructor.currentDocument) {
            const page = this.docConstructor.currentPage;
            this.docConstructor.currentDocument.pages[page].push(pageBreak);
            this.docConstructor.renderDocument();
        }
    }

    insertFromDirectory(directoryItem) {
        // Вставляет данные из справочника в текущую позицию
        if (!this.selectedElement || !directoryItem) return;

        // В зависимости от типа выбранного элемента
        switch (this.selectedElement.data.type) {
            case 'text':
                // Вставляем текст
                break;
            case 'table':
                // Вставляем данные в таблицу
                break;
        }
    }
}