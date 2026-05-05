"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const mockNewsTemplates = {
    default: [
        {
            titles: [
                '加密货币市场持续波动，投资者关注技术指标信号',
                '分析师解读当前市场趋势：技术面显示多空博弈加剧',
                '全球监管动态影响加密市场，投资者情绪谨慎',
                '机构资金流向追踪：大额转账引发市场关注',
                '技术分析视角：关键支撑位与压力位解读',
            ],
            descriptions: [
                '近期加密货币市场呈现震荡走势，各项技术指标正在发出重要信号。分析师建议投资者关注均线交叉和成交量变化，以判断市场的短期方向。从历史数据来看，当前的震荡格局通常预示着即将到来的趋势性行情。',
                '在当前的市场环境下，技术分析成为投资者决策的重要依据。RSI、MACD 等指标的组合运用，能够帮助交易者更好地把握入场和出场时机。然而，技术指标并非万能，需要结合基本面和市场情绪进行综合判断。',
                '随着全球各国对加密资产监管框架的不断完善，市场参与者正在密切关注政策走向。与此同时，技术指标也在反映投资者的情绪变化。监管政策的不确定性往往会导致市场波动性增加。',
                '区块链数据显示，近期多个大型钱包地址发生了显著的资金流动。这些大额转账可能预示着市场即将发生重要变化，值得投资者警惕。链上分析是技术分析的重要补充，能够提供独特的市场洞察。',
                '从技术分析的角度来看，当前价格正处于关键的支撑区域附近。如果能够有效守住这一位置，市场可能迎来反弹机会；否则可能进一步下探。支撑位和压力位的判断是技术分析的核心内容之一。',
            ],
            sources: ['CryptoNews', 'Blockchain Daily', 'The Block', 'Decrypt', 'CoinPost'],
            baseUrls: [
                'https://www.coindesk.com/',
                'https://cointelegraph.com/',
                'https://www.theblock.co/',
                'https://decrypt.co/',
                'https://cryptonews.com/',
            ],
            sentimentBias: 'neutral',
        },
        {
            titles: [
                '市场回暖迹象显现，技术指标释放积极信号',
                '机构持续增持，长期投资者看好后市',
                'DeFi 生态蓬勃发展，链上数据表现强劲',
            ],
            descriptions: [
                '多项技术指标显示市场正在逐步回暖，RSI 从超卖区域反弹，MACD 形成金叉迹象。分析师认为，如果成交量能够配合放大，市场有望迎来一波像样的反弹行情。',
                '链上数据显示，机构投资者正在持续增持比特币和以太坊等主流币种。大型钱包地址的余额稳步增长，表明长期投资者对后市依然保持乐观态度。',
                'DeFi 生态的总锁仓价值（TVL）持续回升，多个热门协议的用户活跃度显著增加。链上数据的强劲表现通常预示着市场情绪的好转。',
            ],
            sources: ['CoinDesk', 'CoinTelegraph', 'DeFi Pulse'],
            baseUrls: [
                'https://www.coindesk.com/',
                'https://cointelegraph.com/',
                'https://defipulse.com/',
            ],
            sentimentBias: 'bullish',
        },
        {
            titles: [
                '市场情绪谨慎，技术指标显示下行压力',
                '监管不确定性增加，投资者选择观望',
                '链上活跃度下降，市场动能减弱',
            ],
            descriptions: [
                '技术指标显示市场面临一定的下行压力，RSI 接近超买区域后开始回落，MACD 柱状图显示多头力量正在减弱。投资者需保持谨慎，注意控制风险。',
                '全球监管政策的不确定性持续影响市场情绪，投资者普遍选择观望态度。在重大政策明朗之前，市场可能继续维持震荡走势。',
                '链上活跃度数据显示，近期交易数量和活跃地址数均有所下降，表明市场动能正在减弱。技术指标和链上数据的双重疲弱值得关注。',
            ],
            sources: ['Bloomberg Crypto', 'Financial Times', 'Reuters'],
            baseUrls: [
                'https://www.bloomberg.com/crypto',
                'https://www.ft.com/cryptocurrency',
                'https://www.reuters.com/technology/crypto/',
            ],
            sentimentBias: 'bearish',
        },
    ],
    bitcoin: [
        {
            titles: [
                '比特币价格震荡整理，关键技术位面临考验',
                '比特币哈希率再创新高，网络安全性持续增强',
                '机构投资者持续增持比特币，长期看好趋势不改',
                '比特币闪电网络 adoption 加速，支付能力显著提升',
                '比特币挖矿难度调整，市场供需关系动态平衡',
            ],
            descriptions: [
                '比特币近期在关键价位附近震荡整理，技术面显示多空双方正在激烈博弈。RSI 指标显示市场情绪偏向中性，投资者需密切关注突破方向。从历史走势来看，长期横盘后的突破往往具有较强的趋势性。',
                '比特币网络哈希率持续攀升，创下历史新高。这一数据表明比特币网络的安全性和去中心化程度正在不断增强，为长期价值提供了坚实支撑。哈希率的稳定增长通常被视为长期看涨的信号。',
                '链上数据显示，近期机构投资者持续增持比特币，多个大型钱包地址的余额显著增加。这表明机构对比特币的长期价值依然保持乐观态度。灰度比特币信托（GBTC）的溢价变化也是观察机构情绪的重要指标。',
                '比特币闪电网络的采用率正在加速增长，网络容量和通道数量均创下新高。这意味着比特币的小额支付能力正在显著提升，实用性不断增强。闪电网络的发展是比特币走向日常支付的重要一步。',
                '比特币挖矿难度进行了最新调整，反映了算力的实际变化。挖矿难度的动态调整机制确保了比特币的发行节奏稳定，供需关系保持平衡。矿工的持币行为和算力分布也是分析市场的重要维度。',
            ],
            sources: ['Bitcoin Magazine', 'CoinDesk', 'CryptoSlate', 'NewsBTC', 'Bitcoinist'],
            baseUrls: [
                'https://bitcoinmagazine.com/',
                'https://www.coindesk.com/price/bitcoin',
                'https://cryptoslate.com/coins/bitcoin/',
                'https://www.newsbtc.com/category/bitcoin/',
                'https://bitcoinist.com/category/bitcoin/',
            ],
            sentimentBias: 'bullish',
        },
        {
            titles: [
                '比特币遭遇短期压力，技术支撑位接受考验',
                '矿工抛售压力增加，市场情绪转向谨慎',
                'ETF 资金流入放缓，短期市场动能减弱',
            ],
            descriptions: [
                '比特币价格近期遭遇一定的短期压力，多个技术支撑位正在接受考验。从技术指标来看，RSI 有回落迹象，MACD 柱状图正在缩小。投资者需密切关注 60,000 美元附近的支撑力度。',
                '链上数据显示，近期矿工地址的净流出有所增加，表明部分矿工正在选择出售。矿工的行为变化往往会对短期市场产生影响，需要持续关注。',
                '比特币现货 ETF 的资金流入速度近期有所放缓，这可能表明短期市场动能正在减弱。ETF 资金流向是观察机构投资者情绪的重要指标之一。',
            ],
            sources: ['Bloomberg', 'WSJ Markets', 'CNBC Crypto'],
            baseUrls: [
                'https://www.bloomberg.com/quote/XBT:CUR',
                'https://www.wsj.com/markets/crypto',
                'https://www.cnbc.com/cryptocurrency/',
            ],
            sentimentBias: 'bearish',
        },
    ],
    ethereum: [
        {
            titles: [
                '以太坊 Layer 2 生态蓬勃发展，TVL 持续增长',
                '以太坊 Gas 费波动剧烈，Layer 2 解决方案凸显价值',
                'Vitalik 提出新的以太坊升级提案，社区热议',
                '以太坊 NFT 市场回暖，交易额环比回升',
                '以太坊质押规模突破新高，网络安全性增强',
            ],
            descriptions: [
                '以太坊 Layer 2 生态正在蓬勃发展，Arbitrum、Optimism 等主流 Layer 2 网络的总锁仓价值（TVL）持续增长，显示出社区对以太坊扩容方案的信心。Layer 2 的发展被视为以太坊走向大规模采用的关键一步。',
                '近期以太坊主网 Gas 费用波动剧烈，在网络拥堵时一度飙升至数百 Gwei。这一情况使得 Layer 2 解决方案的价值更加凸显，越来越多的用户选择迁移到 Layer 2。Gas 费用的波动是以太坊网络活跃度的直接反映。',
                '以太坊创始人 Vitalik Buterin 提出了新的升级提案，旨在进一步提升网络的可扩展性和安全性。社区对这一提案展开了热烈讨论，预计将在未来的硬分叉中逐步实施。以太坊的路线图发展一直是市场关注的焦点。',
                '以太坊 NFT 市场呈现回暖迹象，近一周交易额环比回升。多个知名 NFT 系列的地板价止跌企稳，市场情绪有所改善，买家活跃度逐步恢复。NFT 市场的表现往往与以太坊的整体市场情绪相关联。',
                '以太坊信标链的质押规模突破新高，越来越多的 ETH 被锁定在质押合约中。这一趋势不仅增强了网络的安全性，也反映了持有者对以太坊长期发展的信心。质押收益率的变化也是市场情绪的重要指标。',
            ],
            sources: ['Ethereum Foundation Blog', 'CoinTelegraph', 'The Block', 'Decrypt', 'Bankless'],
            baseUrls: [
                'https://ethereum.org/en/foundation/',
                'https://cointelegraph.com/tags/ethereum',
                'https://www.theblock.co/tags/ethereum',
                'https://decrypt.co/c/ethereum',
                'https://banklesshq.substack.com/',
            ],
            sentimentBias: 'bullish',
        },
        {
            titles: [
                '以太坊合并后挑战仍存，Layer 2 竞争加剧',
                'DeFi 协议 TVL 下降，市场活跃度降低',
                '解锁潮临近，市场面临抛压风险',
            ],
            descriptions: [
                '以太坊合并虽然成功完成，但网络仍面临诸多挑战。Layer 2 生态的竞争日益激烈，多个新的扩容方案正在争夺用户和流动性。市场需要时间来适应新的竞争格局。',
                '近期 DeFi 协议的总锁仓价值（TVL）有所下降，部分热门协议的用户活跃度也在降低。DeFi 生态的表现往往是以太坊市场情绪的先行指标。',
                '部分早期投资者和项目方的锁定期即将结束，市场可能面临一定的抛压风险。解锁潮是加密货币市场常见的周期性事件，投资者需要提前做好应对准备。',
            ],
            sources: ['The Defiant', 'Messari', 'Nansen'],
            baseUrls: [
                'https://thedefiant.io/',
                'https://messari.io/',
                'https://www.nansen.ai/',
            ],
            sentimentBias: 'bearish',
        },
    ],
};
const realNewsSources = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/', region: 'US' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/', region: 'US' },
    { name: 'The Block', url: 'https://www.theblock.co/', region: 'US' },
    { name: 'Decrypt', url: 'https://decrypt.co/', region: 'US' },
    { name: 'CryptoNews', url: 'https://cryptonews.com/', region: 'US' },
    { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/', region: 'US' },
    { name: 'Bloomberg Crypto', url: 'https://www.bloomberg.com/crypto', region: 'Global' },
    { name: '金融时报 Crypto', url: 'https://www.ft.com/cryptocurrency', region: 'Global' },
    { name: 'WSJ Markets', url: 'https://www.wsj.com/markets/crypto', region: 'US' },
    { name: '币界网', url: 'https://www.bjie.com/', region: 'CN' },
    { name: 'AICoin', url: 'https://www.aicoin.com/', region: 'CN' },
    { name: '巴比特', url: 'https://www.8btc.com/', region: 'CN' },
];
function generateSearchUrl(baseUrl, keyword, title, index) {
    const encodedKeyword = encodeURIComponent(keyword);
    const randomId = Date.now() + index + Math.floor(Math.random() * 1000);
    if (baseUrl.includes('coindesk')) {
        return `https://www.coindesk.com/search?s=${encodedKeyword}`;
    }
    if (baseUrl.includes('cointelegraph')) {
        return `https://cointelegraph.com/tags/${keyword.toLowerCase()}`;
    }
    if (baseUrl.includes('theblock')) {
        return `https://www.theblock.co/search?q=${encodedKeyword}`;
    }
    if (baseUrl.includes('decrypt')) {
        return `https://decrypt.co/search?query=${encodedKeyword}`;
    }
    if (baseUrl.includes('cryptonews')) {
        return `https://cryptonews.com/search/?q=${encodedKeyword}`;
    }
    if (baseUrl.includes('bloomberg')) {
        return `https://www.bloomberg.com/search?query=${encodedKeyword}`;
    }
    if (baseUrl.includes('ft.com')) {
        return `https://www.ft.com/search?q=${encodedKeyword}`;
    }
    if (baseUrl.includes('wsj.com')) {
        return `https://www.wsj.com/search?query=${encodedKeyword}`;
    }
    if (baseUrl.includes('8btc')) {
        return `https://www.8btc.com/search?q=${encodedKeyword}`;
    }
    if (baseUrl.includes('aicoin')) {
        return `https://www.aicoin.com/search?keywords=${encodedKeyword}`;
    }
    return `${baseUrl}#${randomId}`;
}
function analyzeSentiment(title, description, templateBias) {
    const bullishKeywords = [
        '上涨', '反弹', '回暖', '突破', '新高', '增持', '流入', '看涨', '乐观',
        'bullish', 'rally', 'surge', 'gain', 'uptrend', 'breakout', 'accumulation'
    ];
    const bearishKeywords = [
        '下跌', '回落', '压力', '考验', '抛售', '流出', '看跌', '谨慎', '风险',
        'bearish', 'decline', 'drop', 'sell-off', 'downtrend', 'pressure', 'correction'
    ];
    const text = (title + ' ' + description).toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;
    for (const keyword of bullishKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            bullishScore++;
        }
    }
    for (const keyword of bearishKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            bearishScore++;
        }
    }
    if (templateBias === 'bullish')
        bullishScore += 2;
    if (templateBias === 'bearish')
        bearishScore += 2;
    if (bullishScore > bearishScore)
        return 'bullish';
    if (bearishScore > bullishScore)
        return 'bearish';
    return 'neutral';
}
function extractKeywords(title, description, baseKeyword) {
    const keywords = [baseKeyword];
    const techIndicators = [
        'RSI', 'MACD', 'MA', 'SMA', 'EMA', '布林带', 'KDJ', 'CCI', 'ATR', 'OBV',
        'bollinger', 'stochastic', 'williams'
    ];
    const marketTerms = [
        '牛市', '熊市', '震荡', '突破', '支撑', '压力', '金叉', '死叉',
        'bull market', 'bear market', 'golden cross', 'death cross'
    ];
    const text = (title + ' ' + description).toLowerCase();
    for (const kw of [...techIndicators, ...marketTerms]) {
        if (text.includes(kw.toLowerCase())) {
            keywords.push(kw);
        }
    }
    return keywords.slice(0, 5);
}
class NewsService {
    constructor() {
        this.useMockOnly = false;
        this.apiKey = config_1.config.newsApiKey;
        this.apiUrl = config_1.config.newsApiUrl;
        this.useMockOnly = !this.apiKey || this.apiKey === '';
    }
    async fetchNews(keyword, days = 7) {
        if (this.useMockOnly) {
            console.log(`News API key not provided, generating mock news for: ${keyword}`);
            return this.generateMockNews(keyword, true);
        }
        try {
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);
            const searchKeyword = keyword === 'default' ? 'cryptocurrency bitcoin' : `${keyword} cryptocurrency`;
            const response = await axios_1.default.get(`${this.apiUrl}/everything`, {
                params: {
                    q: searchKeyword,
                    from: fromDate.toISOString().split('T')[0],
                    to: toDate.toISOString().split('T')[0],
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: this.apiKey,
                },
                timeout: 10000,
            });
            if (response.data.status !== 'ok' || response.data.articles.length === 0) {
                console.log(`No real news found for ${keyword}, using mock data`);
                return this.generateMockNews(keyword, true);
            }
            return response.data.articles.slice(0, 5).map((article, index) => this.transformRealArticle(article, keyword, index));
        }
        catch (error) {
            console.warn('Failed to fetch news from NewsAPI, using mock data:', error instanceof Error ? error.message : String(error));
            return this.generateMockNews(keyword, true);
        }
    }
    transformRealArticle(article, keyword, index) {
        const sentiment = analyzeSentiment(article.title, article.description || '', 'neutral');
        return {
            title: article.title,
            description: article.description || '暂无详细描述',
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
            imageUrl: article.urlToImage || undefined,
            isMock: false,
            sourceType: 'newsapi',
            confidence: 0.9,
            keywords: extractKeywords(article.title, article.description || '', keyword),
        };
    }
    generateMockNews(keyword, isMock = true) {
        const normalizedKeyword = keyword.toLowerCase().replace(/[^a-z]/g, '');
        let templates = mockNewsTemplates[normalizedKeyword] || mockNewsTemplates.default;
        const articles = [];
        const today = new Date();
        const articleCount = 5;
        for (let i = 0; i < articleCount; i++) {
            const templateIndex = i % templates.length;
            const template = templates[templateIndex];
            const date = new Date(today);
            date.setDate(date.getDate() - i - 1);
            date.setHours(date.getHours() - Math.floor(Math.random() * 24));
            const titleIndex = i % template.titles.length;
            const descIndex = (i + 1) % template.descriptions.length;
            const sourceIndex = (i + 2) % template.sources.length;
            const urlIndex = (i + 3) % template.baseUrls.length;
            let title = template.titles[titleIndex];
            let description = template.descriptions[descIndex];
            if (normalizedKeyword !== 'default' && normalizedKeyword !== 'bitcoin' && normalizedKeyword !== 'ethereum') {
                const displayKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
                if (!title.toLowerCase().includes(displayKeyword.toLowerCase())) {
                    title = `${displayKeyword}：${title}`;
                }
                description = `关于 ${displayKeyword} 的最新市场动态。${description}`;
            }
            const sentiment = analyzeSentiment(title, description, template.sentimentBias);
            articles.push({
                title,
                description,
                source: template.sources[sourceIndex],
                url: generateSearchUrl(template.baseUrls[urlIndex], keyword, title, i),
                publishedAt: date.toISOString(),
                imageUrl: undefined,
                isMock,
                sourceType: isMock ? 'mock' : 'alternative',
                confidence: isMock ? 0.5 : 0.7,
                keywords: extractKeywords(title, description, keyword),
            });
        }
        return articles;
    }
    async getNewsComparison(keyword, days = 7) {
        const articles = await this.fetchNews(keyword, days);
        const mockArticles = articles.filter(a => a.isMock);
        const realArticles = articles.filter(a => !a.isMock);
        let bullishCount = 0;
        let bearishCount = 0;
        let neutralCount = 0;
        for (const article of articles) {
            const sentiment = analyzeSentiment(article.title, article.description, 'neutral');
            if (sentiment === 'bullish')
                bullishCount++;
            else if (sentiment === 'bearish')
                bearishCount++;
            else
                neutralCount++;
        }
        let overallSentiment = 'neutral';
        if (bullishCount > bearishCount && bullishCount > neutralCount) {
            overallSentiment = 'bullish';
        }
        else if (bearishCount > bullishCount && bearishCount > neutralCount) {
            overallSentiment = 'bearish';
        }
        const sources = [];
        if (realArticles.length > 0) {
            sources.push({
                sourceName: 'NewsAPI (真实来源)',
                articles: realArticles,
                sentiment: this.calculateGroupSentiment(realArticles),
                isMock: false,
            });
        }
        if (mockArticles.length > 0) {
            sources.push({
                sourceName: '模拟数据 (演示用途)',
                articles: mockArticles,
                sentiment: this.calculateGroupSentiment(mockArticles),
                isMock: true,
            });
        }
        return {
            keyword,
            sources,
            summary: {
                bullishCount,
                bearishCount,
                neutralCount,
                overallSentiment,
            },
        };
    }
    calculateGroupSentiment(articles) {
        let bullish = 0;
        let bearish = 0;
        for (const article of articles) {
            const sentiment = analyzeSentiment(article.title, article.description, 'neutral');
            if (sentiment === 'bullish')
                bullish++;
            else if (sentiment === 'bearish')
                bearish++;
        }
        if (bullish > bearish)
            return 'bullish';
        if (bearish > bullish)
            return 'bearish';
        return 'neutral';
    }
    getAvailableSources() {
        return [
            ...realNewsSources.map(s => ({ ...s, isReal: true })),
            { name: '模拟数据源 (演示)', url: 'https://example.com', region: 'Demo', isReal: false },
        ];
    }
}
exports.NewsService = NewsService;
exports.default = NewsService;
//# sourceMappingURL=newsService.js.map