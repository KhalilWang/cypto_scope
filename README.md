# CryptoScope - 加密货币市场分析平台

一个完整的全栈加密货币市场分析仪表板，支持查看市值前 50 的加密货币、实时价格、技术分析指标和相关新闻。

## 功能特性

### 核心功能
- **市值前 50 币种列表**：以表格形式展示所有币种的名称、价格、24h 涨跌幅、市值等信息
- **多维度排序**：支持按市值或涨跌幅进行升序/降序排序
- **币种详情页**：每个币种都有独立的详情展示页面

### 技术分析指标
- **RSI (相对强弱指数)**：14 日周期的动量振荡器，显示超买/超卖信号
- **MACD (指数平滑异同移动平均线)**：快线(12EMA)、慢线(26EMA)、信号线(9EMA) 及柱状图
- **SMA 交叉**：10 日和 30 日简单移动平均线，支持黄金交叉/死亡交叉识别

### 数据可视化
- **30 天价格趋势图**：使用 Recharts 绘制的折线图，同时显示价格线和 SMA 均线
- **RSI 折线图**：带超买线(70)、超卖线(30)、中轴线(50)的可视化
- **MACD 图表**：MACD 线、信号线和柱状图的组合展示
- **SMA 均线图**：10 日和 30 日均线的对比展示

### 新闻资讯
- **相关新闻列表**：针对每个币种展示近期 7 天内的相关新闻
- **模拟数据降级**：当 NewsAPI 不可用时自动切换到预设的模拟新闻数据

## 技术栈

### 后端
- **Node.js + Express + TypeScript**：服务端框架
- **better-sqlite3**：SQLite 数据库驱动
- **node-cron**：定时任务调度
- **axios**：HTTP 客户端
- **dotenv**：环境变量管理
- **cors**：跨域资源共享

### 前端
- **React 18 + TypeScript**：前端框架
- **React Router**：路由管理
- **Recharts**：数据可视化图表库
- **Axios**：HTTP 客户端
- **Vite**：构建工具
- **Tailwind CSS**：样式框架（内联类）

### 数据来源
- **CoinGecko API**：免费的加密货币市场数据 API
- **NewsAPI**：新闻聚合 API（可选，需要 API Key）

## 项目结构

```
crypto_scope/
├── backend/                          # 后端项目
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts              # 环境配置
│   │   ├── database/
│   │   │   └── index.ts              # SQLite 数据库初始化
│   │   ├── routes/
│   │   │   └── coins.ts              # API 路由
│   │   ├── services/
│   │   │   ├── coingeckoService.ts   # CoinGecko API 集成
│   │   │   ├── newsService.ts        # 新闻服务 (NewsAPI + 模拟数据)
│   │   │   └── technicalIndicators.ts # 技术指标计算
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── app.ts                    # Express 应用配置
│   │   └── index.ts                  # 服务入口
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                         # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── NewsList.tsx          # 新闻列表组件
│   │   │   ├── PriceChart.tsx        # 价格图表组件
│   │   │   └── TechnicalIndicatorsPanel.tsx  # 技术指标面板
│   │   ├── pages/
│   │   │   ├── CoinDetail.tsx        # 币种详情页
│   │   │   └── CoinList.tsx          # 币种列表页
│   │   ├── services/
│   │   │   └── api.ts                # API 调用层
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── utils/
│   │   │   └── formatters.ts         # 格式化工具函数
│   │   ├── App.tsx                   # 主应用组件
│   │   └── main.tsx                  # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package.json                      # 根目录 monorepo 配置
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. **安装依赖**
```bash
cd crypto_scope
npm install
```

2. **配置环境变量（可选）**

复制后端环境变量示例文件：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件：
```env
PORT=3001
NEWS_API_KEY=your_news_api_key_here  # 可选，不配置则使用模拟新闻
COINGECKO_API_URL=https://api.coingecko.com/api/v3
NEWS_API_URL=https://newsapi.org/v2
CACHE_DURATION_MINUTES=5
```

**关于 NewsAPI：**
- NewsAPI 是可选的，如果没有配置 `NEWS_API_KEY`，系统会自动使用预设的模拟新闻数据
- 可以在 https://newsapi.org/ 免费注册获取 API Key
- 免费版有每日请求限制

3. **启动开发服务器**

**方式一：同时启动前后端**
```bash
npm run dev
```

**方式二：分别启动**

启动后端（端口 3001）：
```bash
npm run dev:backend
```

启动前端（端口 3000）：
```bash
npm run dev:frontend
```

4. **访问应用**

前端地址：http://localhost:3000
后端 API：http://localhost:3001/api

### 生产构建

```bash
npm run build
```

## API 接口

### GET /api/coins
获取市值前 50 的币种列表

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "current_price": 67000,
      "price_change_percentage_24h": 2.5,
      "market_cap": 1320000000000,
      "market_cap_rank": 1,
      ...
    }
  ]
}
```

### GET /api/coins/:id
获取单个币种的详细信息，包含技术指标

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "bitcoin",
    "name": "Bitcoin",
    "current_price": 67000,
    "priceHistory": [...],
    "technicalIndicators": {
      "rsi": { "value": 65, "signal": "neutral", ... },
      "macd": { "signal": "bullish", ... },
      "sma": { "trend": "bullish", ... }
    }
  }
}
```

### GET /api/coins/:id/news
获取币种相关新闻

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "title": "比特币价格突破新高",
      "description": "近期比特币价格持续上涨...",
      "source": "CryptoNews",
      "url": "https://example.com/news/1",
      "publishedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 技术指标说明

### RSI (相对强弱指数)
- **周期**：14 日
- **计算方式**：通过平均上涨幅度和平均下跌幅度计算动量振荡器
- **取值范围**：0 - 100
- **信号解读**：
  - ≥ 70：超买区域，可能面临回调压力
  - ≤ 30：超卖区域，可能存在反弹机会
  - 30 - 70：中性区域

### MACD (指数平滑异同移动平均线)
- **参数**：快线 12 EMA、慢线 26 EMA、信号线 9 EMA
- **组成**：
  - MACD 线：12 EMA - 26 EMA
  - 信号线：MACD 线的 9 EMA
  - 柱状图：MACD 线 - 信号线
- **信号解读**：
  - 金叉：MACD 线上穿信号线 → 看涨
  - 死叉：MACD 线下穿信号线 → 看跌
  - 柱状图 > 0 且扩大 → 多头力量增强
  - 柱状图 < 0 且扩大 → 空头力量增强

### SMA 交叉
- **参数**：10 日 SMA、30 日 SMA
- **信号解读**：
  - 黄金交叉：SMA10 上穿 SMA30 → 强烈看涨
  - 死亡交叉：SMA10 下穿 SMA30 → 强烈看跌
  - 多头排列：SMA10 持续在 SMA30 上方 → 上涨趋势
  - 空头排列：SMA10 持续在 SMA30 下方 → 下跌趋势

## 缓存策略

后端使用 SQLite 数据库缓存数据：
- 币种列表和价格数据在服务启动时获取
- 之后每隔 `CACHE_DURATION_MINUTES`（默认 5 分钟）自动刷新
- 减少对 CoinGecko API 的请求频率，避免触发限流

## 注意事项

1. **投资风险提示**：本平台仅供学习和参考，不构成任何投资建议。加密货币投资风险极高，请谨慎决策。

2. **API 限流**：CoinGecko 免费 API 有请求频率限制，系统已实现缓存策略，请勿频繁刷新页面。

3. **模拟数据**：当 NewsAPI 不可用时，新闻数据会使用预设的模拟数据，确保界面始终有内容展示。

4. **数据延迟**：所有市场数据均来自第三方 API，可能存在一定延迟。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
