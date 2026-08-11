import { useState } from 'react';
import { useFetcher } from 'react-router';

interface UseFavoriteOptions {
  postId: number;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
}

interface FavoriteResponse {
  isFavorite: boolean;
  favoriteCount: number;
}

interface ToggleFavoriteResponse {
  success: boolean;
  added: boolean;
  favoriteCount: number;
}

export function useFavorite({
  postId,
  initialIsFavorite,
  initialFavoriteCount,
}: UseFavoriteOptions) {
  const fetcher = useFetcher<FavoriteResponse | ToggleFavoriteResponse>();

  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] =
    useState<number>(initialFavoriteCount);

  const toggleFavorite = () => {
    // 楽観的UI更新
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setFavoriteCount((prev) => (isFavorite ? prev - 1 : prev + 1));

    // サーバーリクエスト送信
    fetcher.submit(
      { PostId: postId.toString() },
      { method: 'POST', action: '/resources/favorite' }
    );
  };

  return {
    isFavorite,
    favoriteCount,
    toggleFavorite,
    isSubmitting: fetcher.state === 'submitting',
  };
}
