// app/routes/resources.favorite.tsx
import { json, ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { favoriteRepository } from '~/models/favorite.server';

// POSTリクエスト用のアクション（お気に入りのトグル）
export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const PostId = Number(formData.get('PostId'));

  if (!PostId) {
    return json({ error: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const result = await favoriteRepository.toggleFavorite({
      PostId: PostId,
      userId: user.id,
    });

    // お気に入り数を取得
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    return json({ success: true, added: result.added, favoriteCount });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
};

// GETリクエスト用のローダー（初期のデータ取得用）
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const url = new URL(request.url);
  const PostId = Number(url.searchParams.get('PostId'));

  if (!PostId) {
    return json({ error: 'Invalid post ID' }, { status: 400 });
  }

  try {
    // ユーザーのお気に入り状態と、お気に入り数を取得
    const isFavorite = await favoriteRepository.isFavorite({
      PostId,
      userId: user.id,
    });
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    return json({ isFavorite, favoriteCount });
  } catch (error) {
    console.error('Failed to get favorite status:', error);
    return json({ error: 'Failed to get favorite status' }, { status: 500 });
  }
};
