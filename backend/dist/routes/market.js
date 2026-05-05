"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketService_1 = require("../services/marketService");
const router = (0, express_1.Router)();
const marketService = new marketService_1.MarketService();
router.get('/overview', async (req, res) => {
    try {
        const overview = await marketService.getMarketOverview();
        res.json({
            success: true,
            data: overview
        });
    }
    catch (error) {
        console.error('Error fetching market overview:', error);
        res.status(500).json({
            success: false,
            error: '获取市场概览失败'
        });
    }
});
exports.default = router;
//# sourceMappingURL=market.js.map