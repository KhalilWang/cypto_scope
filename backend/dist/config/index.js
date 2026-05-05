"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    newsApiKey: process.env.NEWS_API_KEY || '',
    coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
    newsApiUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2',
    cacheDurationMinutes: parseInt(process.env.CACHE_DURATION_MINUTES || '5', 10),
    isDevelopment: process.env.NODE_ENV !== 'production',
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map