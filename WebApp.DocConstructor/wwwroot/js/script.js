import { Sidebar } from './components/sidebar.js';
import { DocumentEditor } from './components/document-editor.js';

class DocumentConstructor {
    constructor() {
        this.currentDocument = null;
        this.documents = [];
        this.currentPage = 0;
        this.selectedElement = null;

        this.sidebar = new Sidebar(this);
        this.editor = new DocumentEditor(this);

        this.initialize();
        this.loadDocuments();
    }

    initialize() {
        this.setupEventListeners();
        this.setupDate();
    }

    setupEventListeners() {
        // Кнопки управления
        document.getElementById('save-btn').addEventListener('click', () => this.saveDocument());
        document.getElementById('export-btn').addEventListener('click', () => this.exportDocument());
        document.getElementById('add-page-btn').addEventListener('click', () => this.addPage());
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());

        // Кнопки навигации по страницам
        document.getElementById('prev-page-btn').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page-btn').addEventListener('click', () => this.changePage(1));

        // Закрытие модальных окон
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
    }

    setupDate() {
        const today = new Date();
        const dateField = document.getElementById('doc-date');
        dateField.value = today.toISOString().split('T')[0];
    }

    selectTemplate(templateType) {
        const templates = {
            invoice: {
                title: 'Накладная',
                type: 'invoice',
                content: this.createInvoiceTemplate()
            },
            contract: {
                title: 'Договор',
                type: 'contract',
                content: this.createContractTemplate()
            },
            act: {
                title: 'Акт выполненных работ',
                type: 'act',
                content: this.createActTemplate()
            },
            order: {
                title: 'Приказ',
                type: 'order',
                //content: this.createOrderTemplate()
            },
            application: {
                title: 'Заявление',
                type: 'application',
                content: this.createApplicationTemplate()
            },
            custom: {
                title: 'Новый документ',
                type: 'custom',
                content: []
            }
        };

        this.currentDocument = {
            ...templates[templateType],
            id: Date.now(),
            createdAt: new Date().toISOString(),
            pages: [templates[templateType].content],
            fields: {}
        };

        this.renderDocument();
        this.updateDocumentInfo();
    }

    createInvoiceTemplate() {
        // ... (тот же код, что и раньше)
    }

    createContractTemplate() {
        // ... (тот же код, что и раньше)
    }

    createActTemplate() {
        // ... (тот же код, что и раньше)
    }

    renderDocument() {
        // ... (основная логика рендеринга)
    }

    addElement(elementType, x, y) {
        // ... (логика добавления элемента)
    }

    saveDocument() {
        // ... (логика сохранения)
    }

    loadDocuments() {
        // ... (логика загрузки документов)
    }

    printDocument() {
        this.editor.printDocument();
    }

    exportDocument() {
        // ... (логика экспорта)
    }

    addPage() {
        // ... (логика добавления страницы)
    }

    changePage(direction) {
        // ... (логика смены страницы)
    }

    updatePageCounter() {
        // ... (логика обновления счетчика страниц)
    }

    showPreview() {
        // ... (логика предпросмотра)
    }

    closeModal() {
        // ... (логика закрытия модальных окон)
    }

    updateDocumentInfo() {
        // ... (логика обновления информации о документе)
    }

    getDocumentTypeName(type) {
        // ... (получение имени типа документа)
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.docApp = new DocumentConstructor();
    window.docApp.selectTemplate('invoice');
});