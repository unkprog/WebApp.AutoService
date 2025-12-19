// Компонент для печати документов
class PrintComponent {
    static printDocument(content, title = 'Документ') {
        // Создаем iframe для печати
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.opacity = '0';
        iframe.style.visibility = 'hidden';

        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;

        // Пишем HTML в iframe
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        color: #000;
                    }
                    .print-document { 
                        max-width: 800px; 
                        margin: 0 auto; 
                    }
                    .print-header { 
                        text-align: center; 
                        border-bottom: 2px solid #000; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px; 
                    }
                    .print-header h1 { 
                        margin: 0; 
                        font-size: 24px; 
                    }
                    .print-content { 
                        margin: 30px 0; 
                    }
                    .print-footer { 
                        border-top: 1px solid #ccc; 
                        padding-top: 20px; 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0; 
                    }
                    th, td { 
                        border: 1px solid #ccc; 
                        padding: 10px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f5f5f5; 
                        font-weight: bold; 
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .bold { font-weight: bold; }
                    .total-row { 
                        font-weight: bold; 
                        background-color: #f9f9f9; 
                    }
                    @media print {
                        .no-print { display: none !important; }
                        .page-break { page-break-after: always; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        doc.close();

        // Печать после загрузки
        iframe.onload = function () {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // Удаляем iframe после печати
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        };
    }

    static generateInvoiceHTML(invoice) {
        return `
            <div class="print-document">
                <div class="print-header">
                    <h1>Накладная № ${invoice.number}</h1>
                    <p>Дата: ${new Date(invoice.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                
                <div class="print-content">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <h3>Клиент:</h3>
                            <p>${invoice.clientName || ''}</p>
                            <p>${invoice.clientPhone || ''}</p>
                        </div>
                        <div>
                            <h3>Автомобиль:</h3>
                            <p>${invoice.vehicleInfo || ''}</p>
                        </div>
                    </div>
                    
                    <h3>Выполненные работы:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Наименование</th>
                                <th>Количество</th>
                                <th>Цена</th>
                                <th>Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(invoice.services || []).map((service, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${service.name}</td>
                                    <td>${service.quantity}</td>
                                    <td>${service.price.toFixed(2)} ₽</td>
                                    <td>${(service.price * service.quantity).toFixed(2)} ₽</td>
                                </tr>
                            `).join('')}
                            ${(invoice.parts || []).map((part, index) => `
                                <tr>
                                    <td>${index + 1 + (invoice.services?.length || 0)}</td>
                                    <td>${part.name}</td>
                                    <td>${part.quantity}</td>
                                    <td>${part.price.toFixed(2)} ₽</td>
                                    <td>${(part.price * part.quantity).toFixed(2)} ₽</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="4" class="text-right">Итого:</td>
                                <td>${invoice.total?.toFixed(2) || '0.00'} ₽</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="margin-top: 30px;">
                        <h3>Примечания:</h3>
                        <p>${invoice.notes || 'Нет'}</p>
                    </div>
                </div>
                
                <div class="print-footer">
                    <p>Подпись клиента: ________________________</p>
                    <p>Подпись исполнителя: ________________________</p>
                    <p>Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            </div>
        `;
    }

    static generateWorkOrderHTML(workOrder) {
        return `
            <div class="print-document">
                <div class="print-header">
                    <h1>Заказ-наряд № ${workOrder.number}</h1>
                    <p>Дата: ${new Date(workOrder.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                
                <div class="print-content">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <h3>Клиент:</h3>
                            <p>${workOrder.clientName || ''}</p>
                            <p>${workOrder.clientPhone || ''}</p>
                        </div>
                        <div>
                            <h3>Автомобиль:</h3>
                            <p>${workOrder.vehicleInfo || ''}</p>
                            <p>Пробег: ${workOrder.mileage || '-'} км</p>
                        </div>
                    </div>
                    
                    <h3>Планируемые работы:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Наименование работ</th>
                                <th>Исполнитель</th>
                                <th>Срок выполнения</th>
                                <th>Примечания</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(workOrder.tasks || []).map(task => `
                                <tr>
                                    <td>${task.description}</td>
                                    <td>${task.assignedTo || '-'}</td>
                                    <td>${task.deadline || '-'}</td>
                                    <td>${task.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <h3 style="margin-top: 30px;">Необходимые запчасти:</h3>
                    ${workOrder.requiredParts && workOrder.requiredParts.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Наименование</th>
                                    <th>Количество</th>
                                    <th>Наличие на складе</th>
                                    <th>Примечания</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${workOrder.requiredParts.map(part => `
                                    <tr>
                                        <td>${part.name}</td>
                                        <td>${part.quantity}</td>
                                        <td>${part.inStock ? 'Есть' : 'Нет в наличии'}</td>
                                        <td>${part.notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Не требуется</p>'}
                    
                    <div style="margin-top: 30px;">
                        <h3>Дополнительная информация:</h3>
                        <p>${workOrder.notes || 'Нет'}</p>
                    </div>
                </div>
                
                <div class="print-footer">
                    <p>Принял: ________________________</p>
                    <p>Выдал: ________________________</p>
                    <p>Дата приёмки: ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            </div>
        `;
    }
}

// Глобальные функции для печати
function printDocument(content, title = 'Документ') {
    PrintComponent.printDocument(content, title);
}

function printInvoice(invoice) {
    const content = PrintComponent.generateInvoiceHTML(invoice);
    PrintComponent.printDocument(content, `Накладная ${invoice.number}`);
}

function printWorkOrder(workOrder) {
    const content = PrintComponent.generateWorkOrderHTML(workOrder);
    PrintComponent.printDocument(content, `Заказ-наряд ${workOrder.number}`);
}