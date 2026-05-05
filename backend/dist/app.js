"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const coins_1 = __importDefault(require("./routes/coins"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const market_1 = __importDefault(require("./routes/market"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const startTime = Date.now();
app.use((0, cors_1.default)({
    credentials: true,
    origin: true
}));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    let dbStatus = 'disconnected';
    try {
        database_1.db.prepare('SELECT 1').get();
        dbStatus = 'connected';
    }
    catch (error) {
        console.error('Health check database error:', error);
    }
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({
        status: dbStatus === 'connected' ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime
    });
});
app.use('/api/coins', coins_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/market', market_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API 端点不存在'
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map