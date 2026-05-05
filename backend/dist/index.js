"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const coingeckoService_1 = require("./services/coingeckoService");
const node_cron_1 = __importDefault(require("node-cron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(__dirname, '..', 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const coinGeckoService = new coingeckoService_1.CoinGeckoService();
const initializeData = async () => {
    console.log('Initializing data on startup...');
    try {
        await coinGeckoService.refreshAllData();
        console.log('Initial data refresh completed');
    }
    catch (error) {
        console.error('Initial data refresh failed:', error);
        console.log('Application will start with cached or fallback data');
    }
};
const startServer = () => {
    app_1.default.listen(config_1.config.port, () => {
        console.log(`CryptoScope Backend Server running on port ${config_1.config.port}`);
        console.log(`API Endpoint: http://localhost:${config_1.config.port}/api`);
        console.log(`Health Check: http://localhost:${config_1.config.port}/health`);
    });
};
const setupCronJobs = () => {
    const cronExpression = `*/${config_1.config.cacheDurationMinutes} * * * *`;
    node_cron_1.default.schedule(cronExpression, async () => {
        console.log(`Scheduled data refresh started at ${new Date().toISOString()}`);
        try {
            await coinGeckoService.refreshAllData();
            console.log('Scheduled data refresh completed');
        }
        catch (error) {
            console.error('Scheduled data refresh failed:', error);
        }
    });
    console.log(`Scheduled data refresh configured to run every ${config_1.config.cacheDurationMinutes} minutes`);
};
const main = async () => {
    console.log('='.repeat(50));
    console.log('Starting CryptoScope Backend Server');
    console.log('='.repeat(50));
    if (!config_1.config.newsApiKey) {
        console.log('Warning: NEWS_API_KEY not configured. News will be served from mock data.');
    }
    await initializeData();
    setupCronJobs();
    startServer();
};
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map