import axios from 'axios';
import { config } from '../config';
import { NewsArticle } from '../types';

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

const mockNewsTemplates: Record<string, { titles: string[]; descriptions: string[]; sources: string[] }> = {
  default: {
    titles: [
      '加密货币市场持续波动，投资者关注技术指标信号',
      '分析师解读当前市场趋势：技术面显示多空博弈加剧',
      '全球监管动态影响加密市场，投资者情绪谨慎',
      '机构资金流向追踪：大额转账引发市场关注',
      '技术分析视角：关键支撑位与压力位解读',
    ],
    descriptions: [
      '近期加密货币市场呈现震荡走势，各项技术指标正在发出重要信号。分析师建议投资者关注均线交叉和成交量变化，以判断市场的短期方向。',
      '在当前的市场环境下，技术分析成为投资者决策的重要依据。RSI、MACD 等指标的组合运用，能够帮助交易者更好地把握入场和出场时机。',
      '随着全球各国对加密资产监管框架的不断完善，市场参与者正在密切关注政策走向。与此同时，技术指标也在反映投资者的情绪变化。',
      '区块链数据显示，近期多个大型钱包地址发生了显著的资金流动。这些大额转账可能预示着市场即将发生重要变化，值得投资者警惕。',
      '从技术分析的角度来看，当前价格正处于关键的支撑区域附近。如果能够有效守住这一位置，市场可能迎来反弹机会；否则可能进一步下探。',
    ],
    sources: ['CryptoNews', 'Blockchain Daily', 'CoinTelegraph', 'The Block', 'Decrypt'],
  },
  bitcoin: {
    titles: [
      '比特币价格震荡整理，关键技术位面临考验',
      '比特币哈希率再创新高，网络安全性持续增强',
      '机构投资者持续增持比特币，长期看好趋势不改',
      '比特币闪电网络 adoption 加速，支付能力显著提升',
      '比特币挖矿难度调整，市场供需关系动态平衡',
    ],
    descriptions: [
      '比特币近期在关键价位附近震荡整理，技术面显示多空双方正在激烈博弈。RSI 指标显示市场情绪偏向中性，投资者需密切关注突破方向。',
      '比特币网络哈希率持续攀升，创下历史新高。这一数据表明比特币网络的安全性和去中心化程度正在不断增强，为长期价值提供了坚实支撑。',
      '链上数据显示，近期机构投资者持续增持比特币，多个大型钱包地址的余额显著增加。这表明机构对比特币的长期价值依然保持乐观态度。',
      '比特币闪电网络的采用率正在加速增长，网络容量和通道数量均创下新高。这意味着比特币的小额支付能力正在显著提升，实用性不断增强。',
      '比特币挖矿难度进行了最新调整，反映了算力的实际变化。挖矿难度的动态调整机制确保了比特币的发行节奏稳定，供需关系保持平衡。',
    ],
    sources: ['Bitcoin Magazine', 'CoinDesk', 'CryptoSlate', 'NewsBTC', 'Bitcoinist'],
  },
  ethereum: {
    titles: [
      '以太坊 Layer 2 生态蓬勃发展，TVL 持续增长',
      '以太坊 Gas 费波动剧烈，Layer 2 解决方案凸显价值',
      'Vitalik 提出新的以太坊升级提案，社区热议',
      '以太坊 NFT 市场回暖，交易额环比回升',
      '以太坊质押规模突破新高，网络安全性增强',
    ],
    descriptions: [
      '以太坊 Layer 2 生态正在蓬勃发展，Arbitrum、Optimism 等主流 Layer 2 网络的总锁仓价值（TVL）持续增长，显示出社区对以太坊扩容方案的信心。',
      '近期以太坊主网 Gas 费用波动剧烈，在网络拥堵时一度飙升至数百 Gwei。这一情况使得 Layer 2 解决方案的价值更加凸显，越来越多的用户选择迁移到 Layer 2。',
      '以太坊创始人 Vitalik Buterin 提出了新的升级提案，旨在进一步提升网络的可扩展性和安全性。社区对这一提案展开了热烈讨论，预计将在未来的硬分叉中逐步实施。',
      '以太坊 NFT 市场呈现回暖迹象，近一周交易额环比回升。多个知名 NFT 系列的地板价止跌企稳，市场情绪有所改善，买家活跃度逐步恢复。',
      '以太坊信标链的质押规模突破新高，越来越多的 ETH 被锁定在质押合约中。这一趋势不仅增强了网络的安全性，也反映了持有者对以太坊长期发展的信心。',
    ],
    sources: ['Ethereum Foundation Blog', 'CoinTelegraph', 'The Block', 'Decrypt', 'Bankless'],
  },
};

export class NewsService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = config.newsApiKey;
    this.apiUrl = config.newsApiUrl;
  }

  async fetchNews(keyword: string, days: number = 7): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      console.log('News API key not provided, using mock data');
      return this.generateMockNews(keyword);
    }

    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const response = await axios.get<NewsApiResponse>(
        `${this.apiUrl}/everything`,
        {
          params: {
            q: `${keyword} cryptocurrency`,
            from: fromDate.toISOString().split('T')[0],
            to: toDate.toISOString().split('T')[0],
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: this.apiKey,
          },
          timeout: 10000,
        }
      );

      if (response.data.status !== 'ok' || response.data.articles.length === 0) {
        return this.generateMockNews(keyword);
      }

      return response.data.articles.slice(0, 5).map(this.transformArticle);
    } catch (error) {
      console.error('Failed to fetch news from NewsAPI:', error);
      return this.generateMockNews(keyword);
    }
  }

  private transformArticle(article: NewsApiArticle): NewsArticle {
    return {
      title: article.title,
      description: article.description || 'No description available.',
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      imageUrl: article.urlToImage || undefined,
    };
  }

  private generateMockNews(keyword: string): NewsArticle[] {
    const normalizedKeyword = keyword.toLowerCase().replace(/[^a-z]/g, '');
    
    let templates = mockNewsTemplates[normalizedKeyword] || mockNewsTemplates.default;
    
    const articles: NewsArticle[] = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i - 1);
      
      const titleIndex = i % templates.titles.length;
      const descIndex = (i + 1) % templates.descriptions.length;
      const sourceIndex = (i + 2) % templates.sources.length;
      
      let title = templates.titles[titleIndex];
      let description = templates.descriptions[descIndex];
      
      if (normalizedKeyword !== 'default' && normalizedKeyword !== 'bitcoin' && normalizedKeyword !== 'ethereum') {
        const displayKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
        title = `${displayKeyword} ${title.toLowerCase()}`;
      }
      
      articles.push({
        title,
        description,
        source: templates.sources[sourceIndex],
        url: `https://example.com/news/${keyword}-${i}`,
        publishedAt: date.toISOString(),
        imageUrl: undefined,
      });
    }
    
    return articles;
  }
}

export default NewsService;
