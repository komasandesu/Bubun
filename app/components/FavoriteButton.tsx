import React from 'react';
import { useFavorite } from '~/hooks/useFavorite';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  postId?: number;
  PostId?: number; // 後方互換性用
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  postId,
  PostId,
  initialIsFavorite,
  initialFavoriteCount,
}) => {
  const targetPostId = (postId ?? PostId) as number;
  const { isFavorite, favoriteCount, toggleFavorite, isSubmitting } =
    useFavorite({
      postId: targetPostId,
      initialIsFavorite,
      initialFavoriteCount,
    });

  return (
    <button
      onClick={toggleFavorite}
      className={`${styles.button} ${isFavorite ? styles.favorite : styles.notFavorite}`}
      disabled={isSubmitting}
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
