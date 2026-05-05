export const formatPrice = (price: number | null | undefined): string => {
  if (price == null || isNaN(price) || !isFinite(price)) {
    return '--';
  }
  if (price >= 1) {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  } else if (price >= 0.01) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
  } else {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
  }
};

export const formatMarketCap = (marketCap: number | null | undefined): string => {
  if (marketCap == null || isNaN(marketCap) || !isFinite(marketCap)) {
    return '--';
  }
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
};

export const formatVolume = (volume: number | null | undefined): string => {
  if (volume == null || isNaN(volume) || !isFinite(volume)) {
    return '--';
  }
  if (volume >= 1e12) {
    return `$${(volume / 1e12).toFixed(2)}T`;
  } else if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  } else {
    return `$${volume.toLocaleString()}`;
  }
};

export const formatPercentage = (percentage: number | null | undefined): string => {
  if (percentage == null || isNaN(percentage) || !isFinite(percentage)) {
    return '--';
  }
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatSupply = (supply: number | null | undefined, symbol?: string): string => {
  if (supply == null || isNaN(supply) || !isFinite(supply)) {
    return '--';
  }
  const formatted = supply.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return symbol ? `${formatted} ${symbol.toUpperCase()}` : formatted;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return '--';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '--';
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--';
  }
};

export const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return '--';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '--';
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '刚刚';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} 分钟前`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} 小时前`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} 天前`;
    }
    
    return formatDate(dateString);
  } catch {
    return '--';
  }
};

export const formatTimestamp = (timestamp: number | null | undefined): string => {
  if (timestamp == null || isNaN(timestamp) || !isFinite(timestamp)) {
    return '--';
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return '--';
    }
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '--';
  }
};
