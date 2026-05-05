import { useState, useEffect } from 'react';
import { favoritesApi } from '../services/api';

interface FavoriteButtonProps {
  coinId: string;
  size?: 'sm' | 'md' | 'lg';
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ coinId, size = 'md', onToggle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        setIsLoading(true);
        const result = await favoritesApi.check(coinId);
        setIsFavorite(result);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorite();
  }, [coinId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isToggling) return;

    try {
      setIsToggling(true);
      const result = await favoritesApi.toggle(coinId);
      setIsFavorite(result.isFavorite);
      onToggle?.(result.isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} animate-pulse bg-slate-600 rounded-full`} />
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isFavorite ? '取消收藏' : '添加收藏'}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorite ? '#f59e0b' : 'none'}
        stroke={isFavorite ? '#f59e0b' : '#64748b'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full transition-colors duration-200"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

export default FavoriteButton;
