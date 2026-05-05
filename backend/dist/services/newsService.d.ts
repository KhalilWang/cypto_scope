import { NewsArticle, NewsComparison } from '../types';
export interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsApiArticle[];
}
export interface NewsApiArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}
export declare class NewsService {
    private readonly apiKey;
    private readonly apiUrl;
    private readonly useMockOnly;
    constructor();
    fetchNews(keyword: string, days?: number): Promise<NewsArticle[]>;
    private transformRealArticle;
    private generateMockNews;
    getNewsComparison(keyword: string, days?: number): Promise<NewsComparison>;
    private calculateGroupSentiment;
    getAvailableSources(): Array<{
        name: string;
        url: string;
        region: string;
        isReal: boolean;
    }>;
}
export default NewsService;
//# sourceMappingURL=newsService.d.ts.map