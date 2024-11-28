// app/routes/resources.favorite.tsx
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { favoriteRepository } from '~/models/favorite.server';

// POSTリクエスト用のアクション（お気に入りのトグル）
export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const PostId = Number(formData.get('PostId'));

  if (!PostId) {
    return new Response(
      JSON.stringify({ error: 'Invalid post ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const result = await favoriteRepository.toggleFavorite({
      PostId: PostId,
      userId: user.id,
    });

    // お気に入り数を取得
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    return new Response(
      JSON.stringify({ success: true, added: result.added, favoriteCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to toggle favorite' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GETリクエスト用のローダー（初期のデータ取得用）
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const url = new URL(request.url);
  const PostId = Number(url.searchParams.get('PostId'));

  if (!PostId) {
    return new Response(
      JSON.stringify({ error: 'Invalid post ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // ユーザーのお気に入り状態と、お気に入り数を取得
    const isFavorite = await favoriteRepository.isFavorite({
      PostId,
      userId: user.id,
    });
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    return new Response(
      JSON.stringify({ isFavorite, favoriteCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Failed to get favorite status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get favorite status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
