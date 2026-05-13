/**
 * Market Engine Widget
 * 
 * Embed this script in your website to run the market engine in the background
 * and fetch live market data from the Market Engine API.
 * 
 * Usage:
 * <script src="https://your-domain.com/market-engine-widget.js"></script>
 * <div id="market-engine-widget"></div>
 */

(function() {
  'use strict';

  // Configuration - Change these to your Market Engine instance
  const CONFIG = {
    // Replace with your actual Market Engine domain
    API_BASE_URL: window.MARKET_ENGINE_URL || 'https://mock-market-engine.vercel.app',
    WIDGET_ID: 'market-engine-widget',
    AUTO_UPDATE_INTERVAL: 30000, // Update every 30 seconds
    ENABLE_INITIALIZATION: true, // Initialize market on first load
    THEME: 'light', // 'light' or 'dark'
  };

  // Market Engine Widget Class
  class MarketEngineWidget {
    constructor(config) {
      this.config = { ...CONFIG, ...config };
      this.data = null;
      this.updateInterval = null;
      this.lastUpdate = null;
      this.init();
    }

    async init() {
      console.log('[MarketEngine] Initializing widget...');

      // Initialize market data on first load if enabled
      if (this.config.ENABLE_INITIALIZATION) {
        await this.initializeMarket();
      }

      // Fetch initial data
      await this.fetchMarketData();

      // Start auto-update interval
      this.startAutoUpdate();

      // Create widget UI if element exists
      const widgetElement = document.getElementById(this.config.WIDGET_ID);
      if (widgetElement) {
        this.renderWidget(widgetElement);
      }
    }

    async initializeMarket() {
      try {
        console.log('[MarketEngine] Initializing market engine...');
        const response = await fetch(`${this.config.API_BASE_URL}/api/market-engine/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('[MarketEngine] Market initialized:', result);
          return true;
        } else {
          console.log('[MarketEngine] Market already initialized');
          return false;
        }
      } catch (error) {
        console.error('[MarketEngine] Initialization error:', error);
        return false;
      }
    }

    async fetchMarketData() {
      try {
        console.log('[MarketEngine] Fetching market data...');
        const response = await fetch(`${this.config.API_BASE_URL}/api/market-data`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        this.data = await response.json();
        this.lastUpdate = new Date();

        // Dispatch custom event for external listeners
        document.dispatchEvent(new CustomEvent('marketEngineUpdate', {
          detail: this.data,
        }));

        console.log('[MarketEngine] Data fetched successfully:', this.data);
        return this.data;
      } catch (error) {
        console.error('[MarketEngine] Fetch error:', error);
        return null;
      }
    }

    startAutoUpdate() {
      this.updateInterval = setInterval(() => {
        this.fetchMarketData();
      }, this.config.AUTO_UPDATE_INTERVAL);

      console.log(`[MarketEngine] Auto-update started (interval: ${this.config.AUTO_UPDATE_INTERVAL}ms)`);
    }

    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        console.log('[MarketEngine] Auto-update stopped');
      }
    }

    getData() {
      return this.data;
    }

    getCompanyByName(name) {
      if (!this.data || !this.data.companies) return null;
      return this.data.companies.find((c) => c.name.toLowerCase() === name.toLowerCase());
    }

    renderWidget(element) {
      if (!this.data || !this.data.companies) {
        element.innerHTML = '<p>Loading market data...</p>';
        return;
      }

      const isDark = this.config.THEME === 'dark';
      const bgColor = isDark ? '#1e293b' : '#f1f5f9';
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const borderColor = isDark ? '#334155' : '#cbd5e1';

      let html = `
        <div style="
          background-color: ${bgColor};
          color: ${textColor};
          border: 1px solid ${borderColor};
          border-radius: 8px;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 100%;
          overflow: auto;
        ">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
              Market Engine Status
            </h3>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              Last updated: ${this.lastUpdate ? this.lastUpdate.toLocaleTimeString() : 'Never'}
            </p>
          </div>

          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          ">
      `;

      // Display company summaries
      this.data.companies.forEach((company) => {
        const profitLoss = company.total_profit_loss;
        const isProfit = profitLoss >= 0;
        const profitColor = isProfit ? '#10b981' : '#ef4444';

        html += `
          <div style="
            background-color: ${isDark ? '#0f172a' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 6px;
            padding: 12px;
            font-size: 12px;
          ">
            <div style="font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${company.name}
            </div>
            <div style="opacity: 0.7; margin-bottom: 4px;">
              Capital: $${company.current_capital.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div style="color: ${profitColor}; font-weight: 600;">
              ${isProfit ? '+' : ''}${profitLoss.toLocaleString('en-US', { maximumFractionDigits: 2 })} (${company.roi_percentage}%)
            </div>
          </div>
        `;
      });

      html += `
          </div>

          <div style="
            font-size: 11px;
            opacity: 0.6;
            padding-top: 8px;
            border-top: 1px solid ${borderColor};
          ">
            Powered by Market Engine • ${this.data.companies.length} companies tracked
          </div>
        </div>
      `;

      element.innerHTML = html;
    }

    // Expose public API
    static getInstance() {
      return window.MarketEngineInstance;
    }

    static on(event, callback) {
      if (event === 'update') {
        document.addEventListener('marketEngineUpdate', (e) => {
          callback(e.detail);
        });
      }
    }
  }

  // Initialize widget when DOM is ready
  function initializeWidget() {
    // Check if widget element exists or if we should run in background
    const widgetElement = document.getElementById(CONFIG.WIDGET_ID);
    const runInBackground = !widgetElement || widgetElement.hasAttribute('data-background');

    // Create global instance
    window.MarketEngineInstance = new MarketEngineWidget(CONFIG);

    console.log(`[MarketEngine] Widget initialized (Background mode: ${runInBackground})`);
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

  // Expose to global scope
  window.MarketEngine = {
    get instance() {
      return MarketEngineWidget.getInstance();
    },
    on: MarketEngineWidget.on,
    getData: () => window.MarketEngineInstance?.getData(),
    getCompany: (name) => window.MarketEngineInstance?.getCompanyByName(name),
  };
})();
