// Модуль для работы с данными
class DataManager {
    constructor() {
        this.storageKey = 'autoservice_data';
        this.data = this.loadData();
        this.initDefaultData();
    }

    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return {};
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    initDefaultData() {
        // Инициализация данных по умолчанию
        if (!this.data.vehicles) {
            this.data.vehicles = [];
        }

        if (!this.data.clients) {
            this.data.clients = [];
        }

        if (!this.data.services) {
            this.data.services = [
                { id: 1, name: 'Замена масла', price: 2000, category: 'Техобслуживание' },
                { id: 2, name: 'Замена тормозных колодок', price: 5000, category: 'Ремонт' },
                { id: 3, name: 'Диагностика двигателя', price: 3000, category: 'Диагностика' }
            ];
        }

        if (!this.data.parts) {
            this.data.parts = [
                { id: 1, name: 'Масло моторное 5W-40', price: 2500, stock: 10, minStock: 5 },
                { id: 2, name: 'Тормозные колодки', price: 4000, stock: 15, minStock: 8 },
                { id: 3, name: 'Воздушный фильтр', price: 1500, stock: 20, minStock: 10 }
            ];
        }

        if (!this.data.workOrders) {
            this.data.workOrders = [];
        }

        if (!this.data.invoices) {
            this.data.invoices = [];
        }

        if (!this.data.appointments) {
            this.data.appointments = [];
        }

        this.saveData();
    }

    // Методы для работы с автомобилями
    getVehicles() {
        return this.data.vehicles;
    }

    addVehicle(vehicle) {
        vehicle.id = this.generateId();
        vehicle.createdAt = new Date().toISOString();
        this.data.vehicles.push(vehicle);
        this.saveData();
        return vehicle;
    }

    updateVehicle(id, updates) {
        const index = this.data.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.data.vehicles[index] = { ...this.data.vehicles[index], ...updates };
            this.saveData();
            return true;
        }
        return false;
    }

    deleteVehicle(id) {
        const index = this.data.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.data.vehicles.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Методы для работы с клиентами
    getClients() {
        return this.data.clients;
    }

    addClient(client) {
        client.id = this.generateId();
        client.createdAt = new Date().toISOString();
        this.data.clients.push(client);
        this.saveData();
        return client;
    }

    // Методы для работы с услугами
    getServices() {
        return this.data.services;
    }

    // Методы для работы с запчастями
    getParts() {
        return this.data.parts;
    }

    updatePartStock(partId, quantity) {
        const part = this.data.parts.find(p => p.id === partId);
        if (part) {
            part.stock += quantity;
            this.saveData();
            return true;
        }
        return false;
    }

    // Методы для работы с заказ-нарядами
    getWorkOrders() {
        return this.data.workOrders;
    }

    addWorkOrder(workOrder) {
        workOrder.id = this.generateId();
        workOrder.number = `WO-${Date.now()}`;
        workOrder.createdAt = new Date().toISOString();
        workOrder.status = 'в работе';
        this.data.workOrders.push(workOrder);
        this.saveData();
        return workOrder;
    }

    // Методы для работы с накладными
    getInvoices() {
        return this.data.invoices;
    }

    addInvoice(invoice) {
        invoice.id = this.generateId();
        invoice.number = `INV-${Date.now()}`;
        invoice.createdAt = new Date().toISOString();
        invoice.status = 'оплачено';
        this.data.invoices.push(invoice);
        this.saveData();
        return invoice;
    }

    // Вспомогательные методы
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStats() {
        return {
            totalClients: this.data.clients.length,
            totalVehicles: this.data.vehicles.length,
            totalWorkOrders: this.data.workOrders.length,
            totalInvoices: this.data.invoices.length,
            totalRevenue: this.data.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        };
    }
}

// Создаем глобальный экземпляр менеджера данных
window.dataManager = new DataManager();