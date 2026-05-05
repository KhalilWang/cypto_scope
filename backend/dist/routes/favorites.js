"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoritesService_1 = require("../services/favoritesService");
const router = (0, express_1.Router)();
const favoritesService = new favoritesService_1.FavoritesService();
const getSessionId = (req) => {
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        sessionId = favoritesService.generateSessionId();
    }
    return sessionId;
};
router.get('/session', (req, res) => {
    const sessionId = getSessionId(req);
    res.json({
        success: true,
        data: { sessionId }
    });
});
router.get('/', (req, res) => {
    try {
        const sessionId = getSessionId(req);
        const favorites = favoritesService.getFavoritesWithCoins(sessionId);
        res.json({
            success: true,
            data: favorites
        });
    }
    catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            error: '获取收藏列表失败'
        });
    }
});
router.get('/ids', (req, res) => {
    try {
        const sessionId = getSessionId(req);
        const coinIds = favoritesService.getFavoriteCoinIds(sessionId);
        res.json({
            success: true,
            data: coinIds
        });
    }
    catch (error) {
        console.error('Error fetching favorite ids:', error);
        res.status(500).json({
            success: false,
            error: '获取收藏ID列表失败'
        });
    }
});
router.get('/:coinId', (req, res) => {
    try {
        const sessionId = getSessionId(req);
        const isFavorite = favoritesService.isFavorite(sessionId, req.params.coinId);
        res.json({
            success: true,
            data: { isFavorite }
        });
    }
    catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({
            success: false,
            error: '检查收藏状态失败'
        });
    }
});
router.post('/:coinId', (req, res) => {
    try {
        const sessionId = getSessionId(req);
        const result = favoritesService.toggleFavorite(sessionId, req.params.coinId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            error: '切换收藏状态失败'
        });
    }
});
exports.default = router;
//# sourceMappingURL=favorites.js.map