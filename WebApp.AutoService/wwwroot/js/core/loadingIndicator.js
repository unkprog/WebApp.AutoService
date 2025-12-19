export default class LoadingIndicator {
    constructor() {
        this.minLoadingTime = 300; // Minimum loading time for better UX
        this.loadingStartTime = null;
        this.loadingTimeout = null;
        this.#initUI();
    }

    #elements = {
        progressBar: undefined,
        progressFill: undefined,
        loadingOverlay: undefined,
        headerSpinner: undefined
    };

    #initUI() {

        // Проверяем, не добавлен ли уже индикатор
        if (!document.getElementById('loadingOverlay')) {

            // Добавляем разметку
            document.body.insertAdjacentHTML('beforeend',
                `<!-- Loading Indicator -->
                 <div class="loading-overlay" id="loadingOverlay">
                     <div class="loading-spinner">
                         <div class="spinner"></div>
                         <div class="loading-text">Загрузка...</div>
                     </div>
                 </div>
                `);
        }

        // Create progress bar
        this.#elements.progressBar = document.createElement('div');
        this.#elements.progressBar.className = 'progress-bar';
        this.#elements.progressFill = document.createElement('div');
        this.#elements.progressFill.className = 'progress-bar-fill';
        this.#elements.progressBar.appendChild(this.#elements.progressFill);
        document.body.appendChild(this.#elements.progressBar);

        this.#elements.loadingOverlay = document.getElementById('loadingOverlay');
        this.#elements.headerSpinner = document.getElementById('headerSpinner');
    }



    show() {
        this.loadingStartTime = Date.now();

        // Show progress bar immediately
        this.#elements.progressBar.classList.add('active');
        this.#elements.progressFill.style.width = '30%';

        // Show header spinner immediately
        this.#elements.headerSpinner.classList.add('active');

        // Delay showing full overlay to avoid flashing on fast loads
        this.loadingTimeout = setTimeout(() => {
            this.#elements.progressFill.style.width = '70%';
            this.#elements.loadingOverlay.classList.add('active');
        }, 200);
    }

    hide() {
        const elapsed = Date.now() - this.loadingStartTime;
        const remaining = Math.max(0, this.minLoadingTime - elapsed);

        // Clear any pending timeout
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }

        // Ensure minimum loading time for better UX (no flashing)
        setTimeout(() => {
            // Complete progress bar
            this.#elements.progressFill.style.width = '100%';

            // Hide overlay and reset
            setTimeout(() => {
                this.#elements.loadingOverlay.classList.remove('active');
                this.#elements.headerSpinner.classList.remove('active');

                // Reset progress bar
                setTimeout(() => {
                    this.#elements.progressBar.classList.remove('active');
                    this.#elements.progressFill.style.width = '0%';
                }, 300);
            }, 300);
        }, remaining);
    }

    hideImmediate() {
        // For immediate hiding (e.g., error cases)
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }

        this.#elements.loadingOverlay.classList.remove('active');
        this.#elements.headerSpinner.classList.remove('active');
        this.#elements.progressBar.classList.remove('active');
        this.#elements.progressFill.style.width = '0%';
    }
}