// app/routes/components/FavoriteButton.tsx
import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  PostId: number;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  PostId,
  initialIsFavorite,
  initialFavoriteCount
}) => {
  const fetcher = useFetcher();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);

  const handleFavoriteClick = () => {
    // 楽観的UI更新
    setIsFavorite(!isFavorite);
    setFavoriteCount(isFavorite ? favoriteCount - 1 : favoriteCount + 1);

    // サーバーリクエスト送信
    fetcher.submit(
      { PostId: PostId.toString() },
      { method: 'POST', action: '/resources/favorite' }
    );
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`${styles.button} ${isFavorite ? styles.favorite : ''}`}
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
