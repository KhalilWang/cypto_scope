import { Router, Request, Response } from 'express';
import { AlertsService } from '../services/alertsService';
import { ApiResponse, Alert, AlertWithCoin } from '../types';
import { db } from '../database';

const router = Router();
const alertsService = new AlertsService();

const getSessionId = (req: Request): string => {
  let sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    const crypto = require('crypto');
    sessionId = crypto.randomUUID();
  }
  
  return sessionId;
};

router.get('/', (req: Request, res: Response<ApiResponse<AlertWithCoin[]>>) => {
  try {
    const sessionId = getSessionId(req);
    const alerts = alertsService.getAlertsWithCoins(sessionId);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: '获取告警列表失败'
    });
  }
});

router.get('/active', (req: Request, res: Response<ApiResponse<Alert[]>>) => {
  try {
    const sessionId = getSessionId(req);
    const allAlerts = alertsService.getAlerts(sessionId);
    const activeAlerts = allAlerts.filter(a => a.is_active && !a.is_triggered);
    
    res.json({
      success: true,
      data: activeAlerts
    });
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({
      success: false,
      error: '获取活跃告警失败'
    });
  }
});

router.get('/triggered', (req: Request, res: Response<ApiResponse<AlertWithCoin[]>>) => {
  try {
    const sessionId = getSessionId(req);
    const allAlerts = alertsService.getAlertsWithCoins(sessionId);
    const triggeredAlerts = allAlerts.filter(a => a.is_triggered);
    
    res.json({
      success: true,
      data: triggeredAlerts
    });
  } catch (error) {
    console.error('Error fetching triggered alerts:', error);
    res.status(500).json({
      success: false,
      error: '获取已触发告警失败'
    });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<Alert>>) => {
  try {
    const sessionId = getSessionId(req);
    const { coin_id, alert_type, target_price } = req.body;
    
    if (!coin_id || !alert_type || target_price === undefined) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: coin_id, alert_type, target_price'
      });
    }
    
    if (alert_type !== 'price_above' && alert_type !== 'price_below') {
      return res.status(400).json({
        success: false,
        error: 'alert_type 必须是 "price_above" 或 "price_below"'
      });
    }
    
    const coin = db.prepare(`
      SELECT id, name, symbol, current_price
      FROM coins
      WHERE id = ?
    `).get(coin_id) as { id: string; name: string; symbol: string; current_price: number } | undefined;
    
    if (!coin) {
      return res.status(404).json({
        success: false,
        error: '币种不存在'
      });
    }
    
    const alert = alertsService.createAlert(
      sessionId,
      coin_id,
      coin.name,
      coin.symbol,
      alert_type,
      target_price,
      coin.current_price
    );
    
    if (!alert) {
      return res.status(500).json({
        success: false,
        error: '创建告警失败'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: '创建告警失败'
    });
  }
});

router.put('/:id', (req: Request<{ id: string }>, res: Response<ApiResponse<Alert>>) => {
  try {
    const sessionId = getSessionId(req);
    const alertId = parseInt(req.params.id);
    const { target_price, is_active } = req.body;
    
    if (isNaN(alertId)) {
      return res.status(400).json({
        success: false,
        error: '无效的告警ID'
      });
    }
    
    const updates: { target_price?: number; is_active?: boolean } = {};
    if (target_price !== undefined) updates.target_price = target_price;
    if (is_active !== undefined) updates.is_active = is_active;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有提供要更新的字段'
      });
    }
    
    const alert = alertsService.updateAlert(alertId, sessionId, updates);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: '告警不存在或无权修改'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: '更新告警失败'
    });
  }
});

router.delete('/:id', (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  try {
    const sessionId = getSessionId(req);
    const alertId = parseInt(req.params.id);
    
    if (isNaN(alertId)) {
      return res.status(400).json({
        success: false,
        error: '无效的告警ID'
      });
    }
    
    const deleted = alertsService.deleteAlert(alertId, sessionId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '告警不存在或无权删除'
      });
    }
    
    res.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: '删除告警失败'
    });
  }
});

router.post('/check', (req: Request, res: Response<ApiResponse<{ triggered: Alert[] }>>) => {
  try {
    const sessionId = getSessionId(req);
    const activeAlerts = alertsService.getAlerts(sessionId).filter(a => a.is_active && !a.is_triggered);
    
    const coinPrices = new Map<string, number>();
    const coins = db.prepare(`
      SELECT id, current_price FROM coins
    `).all() as Array<{ id: string; current_price: number }>;
    
    coins.forEach(coin => {
      coinPrices.set(coin.id, coin.current_price);
    });
    
    const triggered: Alert[] = [];
    
    for (const alert of activeAlerts) {
      const currentPrice = coinPrices.get(alert.coin_id);
      if (currentPrice === undefined) continue;
      
      if (alertsService.checkAlertTrigger(alert, currentPrice)) {
        alertsService.triggerAlert(alert.id);
        const updatedAlert = alertsService.getAlertById(alert.id);
        if (updatedAlert) {
          triggered.push(updatedAlert);
        }
      }
    }
    
    res.json({
      success: true,
      data: { triggered }
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    res.status(500).json({
      success: false,
      error: '检查告警失败'
    });
  }
});

export default router;
