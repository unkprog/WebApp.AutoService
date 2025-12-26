// Event Monitor
export default class EventMonitor {

    #elements = {
        eventList: undefined,
        eventMonitor: undefined,
        toggleMonitor: undefined,
    }

    #appState;

    constructor(appState) {
        this.maxEvents = 50;
        this.#appState = appState;
        this.#initUI();
    }

    #initUI() {

        // Проверяем, не добавлен ли уже монитор
        if (!document.getElementById('eventMonitor')) {

            // Добавляем разметку
            document.body.insertAdjacentHTML('beforeend',
                `<!-- Event Monitor -->
                 <div class="event-monitor" id="eventMonitor">
                     <div class="event-header">
                         <div class="event-title">Event Monitor</div>
                         <button id="clearEvents" style="background: none; border: none; color: var(--primary-color); cursor: pointer;">
                             Clear
                         </button>
                     </div>
                     <ul class="event-list" id="eventList"></ul>
                 </div>
                 
                 <!-- Event Monitor Toggle -->
                 <button class="toggle-monitor" id="toggleMonitor">
                     <i class="material-icons">visibility</i>
                 </button>
                `);
        }

        this.#elements.eventList = document.getElementById('eventList');
        this.#elements.eventMonitor = document.getElementById('eventMonitor');
        this.#elements.toggleMonitor = document.getElementById('toggleMonitor');
        this.#elements.clearEvents = document.getElementById('clearEvents');
    }


    logEvent(type, details) {
        const event = {
            type,
            details,
            timestamp: new Date().toLocaleTimeString()
        };

        this.#appState.events.unshift(event);

        // Limit the number of stored events
        if (this.#appState.events.length > this.maxEvents) {
            this.#appState.events.pop();
        }

        this.updateDisplay();
    }

    updateDisplay() {
        this.#elements.eventList.innerHTML = '';

        this.#appState.events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.innerHTML = `
                                    <div><span class="event-type">${event.type}</span> - ${event.timestamp}</div>
                                    <div>${event.details}</div>
                                `;
            this.#elements.eventList.appendChild(li);
        });
    }

    clearEvents() {
        this.#appState.events = [];
        this.updateDisplay();
    }

    toggleMonitor() {
        this.#appState.isMonitorOpen = !this.#appState.isMonitorOpen;
        this.#elements.eventMonitor.classList.toggle('open', this.#appState.isMonitorOpen);

        const icon = this.#elements.toggleMonitor.querySelector('i');
        icon.textContent = this.#appState.isMonitorOpen ? 'visibility_off' : 'visibility';
    }

    setEventListeners() {
        this.#elements.toggleMonitor.addEventListener('click', () => {
            this.toggleMonitor();
            this.logEvent('UI Interaction', 'Event monitor toggled');
        });

        this.#elements.clearEvents.addEventListener('click', () => {
            this.clearEvents();
            this.logEvent('UI Interaction', 'Event monitor cleared');
        });
    }
}