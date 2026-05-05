import { db } from '../database';
import { Alert, AlertWithCoin } from '../types';

export class AlertsService {
  createAlert(
    sessionId: string,
    coinId: string,
    coinName: string,
    coinSymbol: string,
    alertType: 'price_above' | 'price_below',
    targetPrice: number,
    currentPrice: number
  ): Alert | null {
    try {
      const result = db.prepare(`
        INSERT INTO alerts (
          session_id, coin_id, coin_name, coin_symbol, alert_type, 
          target_price, current_price_at_creation, is_active, is_triggered,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        sessionId, coinId, coinName, coinSymbol, alertType,
        targetPrice, currentPrice
      );

      if (result.changes > 0) {
        return this.getAlertById(result.lastInsertRowid as number);
      }
      return null;
    } catch (error) {
      console.error('Error creating alert:', error);
      return null;
    }
  }

  getAlertById(id: number): Alert | null {
    const row = db.prepare(`
      SELECT 
        id, session_id, coin_id, coin_name, coin_symbol, alert_type,
        target_price, current_price_at_creation, is_active, is_triggered,
        triggered_at, created_at, updated_at
      FROM alerts
      WHERE id = ?
    `).get(id) as {
      id: number;
      session_id: string;
      coin_id: string;
      coin_name?: string;
      coin_symbol?: string;
      alert_type: string;
      target_price: number;
      current_price_at_creation?: number;
      is_active: number;
      is_triggered: number;
      triggered_at?: string;
      created_at: string;
      updated_at: string;
    } | undefined;

    if (!row) return null;

    return {
      id: row.id,
      session_id: row.session_id,
      coin_id: row.coin_id,
      coin_name: row.coin_name,
      coin_symbol: row.coin_symbol,
      alert_type: row.alert_type as 'price_above' | 'price_below',
      target_price: row.target_price,
      current_price_at_creation: row.current_price_at_creation,
      is_active: row.is_active === 1,
      is_triggered: row.is_triggered === 1,
      triggered_at: row.triggered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  getAlerts(sessionId: string): Alert[] {
    const rows = db.prepare(`
      SELECT 
        id, session_id, coin_id, coin_name, coin_symbol, alert_type,
        target_price, current_price_at_creation, is_active, is_triggered,
        triggered_at, created_at, updated_at
      FROM alerts
      WHERE session_id = ?
      ORDER BY created_at DESC
    `).all(sessionId) as Array<{
      id: number;
      session_id: string;
      coin_id: string;
      coin_name?: string;
      coin_symbol?: string;
      alert_type: string;
      target_price: number;
      current_price_at_creation?: number;
      is_active: number;
      is_triggered: number;
      triggered_at?: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      coin_id: row.coin_id,
      coin_name: row.coin_name,
      coin_symbol: row.coin_symbol,
      alert_type: row.alert_type as 'price_above' | 'price_below',
      target_price: row.target_price,
      current_price_at_creation: row.current_price_at_creation,
      is_active: row.is_active === 1,
      is_triggered: row.is_triggered === 1,
      triggered_at: row.triggered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  getAlertsWithCoins(sessionId: string): AlertWithCoin[] {
    const rows = db.prepare(`
      SELECT 
        a.id, a.session_id, a.coin_id, a.coin_name, a.coin_symbol, a.alert_type,
        a.target_price, a.current_price_at_creation, a.is_active, a.is_triggered,
        a.triggered_at, a.created_at, a.updated_at,
        c.current_price, c.price_change_percentage_24h, c.image
      FROM alerts a
      LEFT JOIN coins c ON a.coin_id = c.id
      WHERE a.session_id = ?
      ORDER BY a.created_at DESC
    `).all(sessionId) as Array<{
      id: number;
      session_id: string;
      coin_id: string;
      coin_name?: string;
      coin_symbol?: string;
      alert_type: string;
      target_price: number;
      current_price_at_creation?: number;
      is_active: number;
      is_triggered: number;
      triggered_at?: string;
      created_at: string;
      updated_at: string;
      current_price?: number;
      price_change_percentage_24h?: number;
      image?: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      coin_id: row.coin_id,
      coin_name: row.coin_name,
      coin_symbol: row.coin_symbol,
      alert_type: row.alert_type as 'price_above' | 'price_below',
      target_price: row.target_price,
      current_price_at_creation: row.current_price_at_creation,
      is_active: row.is_active === 1,
      is_triggered: row.is_triggered === 1,
      triggered_at: row.triggered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      current_price: row.current_price || 0,
      price_change_percentage_24h: row.price_change_percentage_24h || 0,
      image: row.image || '',
    }));
  }

  getActiveAlerts(): Alert[] {
    const rows = db.prepare(`
      SELECT 
        id, session_id, coin_id, coin_name, coin_symbol, alert_type,
        target_price, current_price_at_creation, is_active, is_triggered,
        triggered_at, created_at, updated_at
      FROM alerts
      WHERE is_active = 1 AND is_triggered = 0
      ORDER BY created_at DESC
    `).all() as Array<{
      id: number;
      session_id: string;
      coin_id: string;
      coin_name?: string;
      coin_symbol?: string;
      alert_type: string;
      target_price: number;
      current_price_at_creation?: number;
      is_active: number;
      is_triggered: number;
      triggered_at?: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      coin_id: row.coin_id,
      coin_name: row.coin_name,
      coin_symbol: row.coin_symbol,
      alert_type: row.alert_type as 'price_above' | 'price_below',
      target_price: row.target_price,
      current_price_at_creation: row.current_price_at_creation,
      is_active: row.is_active === 1,
      is_triggered: row.is_triggered === 1,
      triggered_at: row.triggered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  updateAlert(id: number, sessionId: string, updates: {
    target_price?: number;
    is_active?: boolean;
  }): Alert | null {
    try {
      const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const values: any[] = [];

      if (updates.target_price !== undefined) {
        setClauses.push('target_price = ?');
        values.push(updates.target_price);
      }

      if (updates.is_active !== undefined) {
        setClauses.push('is_active = ?');
        values.push(updates.is_active ? 1 : 0);
      }

      values.push(id, sessionId);

      const result = db.prepare(`
        UPDATE alerts
        SET ${setClauses.join(', ')}
        WHERE id = ? AND session_id = ?
      `).run(...values);

      if (result.changes > 0) {
        return this.getAlertById(id);
      }
      return null;
    } catch (error) {
      console.error('Error updating alert:', error);
      return null;
    }
  }

  triggerAlert(id: number): boolean {
    try {
      const result = db.prepare(`
        UPDATE alerts
        SET is_triggered = 1, triggered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      return result.changes > 0;
    } catch (error) {
      console.error('Error triggering alert:', error);
      return false;
    }
  }

  deleteAlert(id: number, sessionId: string): boolean {
    try {
      const result = db.prepare(`
        DELETE FROM alerts
        WHERE id = ? AND session_id = ?
      `).run(id, sessionId);

      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting alert:', error);
      return false;
    }
  }

  checkAlertTrigger(alert: Alert, currentPrice: number): boolean {
    if (!alert.is_active || alert.is_triggered) {
      return false;
    }

    if (alert.alert_type === 'price_above') {
      return currentPrice >= alert.target_price;
    } else if (alert.alert_type === 'price_below') {
      return currentPrice <= alert.target_price;
    }

    return false;
  }
}

export default AlertsService;
