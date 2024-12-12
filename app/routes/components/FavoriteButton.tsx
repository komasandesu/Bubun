// app/routes/components/FavoriteButton.tsx
import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  PostId: number;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
}

// サーバーからのレスポンスの型定義
interface FavoriteResponse {
  isFavorite: boolean;
  favoriteCount: number;
}

interface ToggleFavoriteResponse {
  success: boolean;
  added: boolean;
  favoriteCount: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  PostId,
  initialIsFavorite,
  initialFavoriteCount 
}) => {

  const fetcher = useFetcher<FavoriteResponse | ToggleFavoriteResponse>();

  // 初期値を使った描画
  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] = useState<number>(initialFavoriteCount);

  // fetcher.data の変更を監視し、状態を更新
  useEffect(() => {
    if (fetcher.data && 'isFavorite' in fetcher.data) {
      setIsFavorite(fetcher.data.isFavorite);
      setFavoriteCount(fetcher.data.favoriteCount);
    } else if (fetcher.data && fetcher.data.success) {
      setIsFavorite(fetcher.data.added);
      setFavoriteCount(fetcher.data.favoriteCount);
    }
  }, [fetcher.data]);

  const handleFavoriteClick = () => {
    fetcher.submit(
      { PostId: PostId.toString() },
      { method: 'POST', action: '/resources/favorite' }
    );
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`${styles.button} ${isFavorite ? styles.favorite : styles.notFavorite}`}
      disabled={fetcher.state === 'submitting'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.star}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-sm">{favoriteCount}</span>
    </button>
  );
};

export default FavoriteButton;