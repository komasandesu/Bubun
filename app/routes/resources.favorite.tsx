// app/routes/resources.favorite.tsx
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { favoriteRepository } from '~/models/favorite.server';
import { commitSession } from '~/services/session.server';

// POSTリクエスト用のアクション（お気に入りのトグル）
export const action = async ({ request }: ActionFunctionArgs) => {
  // user と session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  // 更新したセッション情報を用意しておく
  const sessionCookie = await commitSession(session);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
  responseHeaders.set('Set-Cookie', sessionCookie);

  const formData = await request.formData();
  const PostId = Number(formData.get('PostId'));

  if (!PostId) {
    const body = JSON.stringify({ error: 'Invalid post ID' });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  try {
    const result = await favoriteRepository.toggleFavorite({
      PostId: PostId,
      userId: user.id,
    });

    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    // 成功レスポンスにもヘッダーを付ける
    const body = JSON.stringify({ success: true, added: result.added, favoriteCount });
    return new Response(body, { status: 200, headers: responseHeaders });

  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    // エラーレスポンスにもヘッダーを付ける
    const body = JSON.stringify({ error: 'Failed to toggle favorite' });
    return new Response(body, { status: 500, headers: responseHeaders });
  }
};

// GETリクエスト用のローダー（初期のデータ取得用）
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ① user と session を受け取る！
  const { user, session } = await requireAuthenticatedUser(request);

  // 更新したセッション情報を用意しておく
  const sessionCookie = await commitSession(session);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
  responseHeaders.set('Set-Cookie', sessionCookie);

  const url = new URL(request.url);
  const PostId = Number(url.searchParams.get('PostId'));

  if (!PostId) {
    const body = JSON.stringify({ error: 'Invalid post ID' });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  try {
    // ユーザーのお気に入り状態と、お気に入り数を取得
    const isFavorite = await favoriteRepository.isFavorite({
      PostId,
      userId: user.id,
    });
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    // 成功レスポンスにもヘッダーを付ける
    const body = JSON.stringify({ isFavorite, favoriteCount });
    return new Response(body, { status: 200, headers: responseHeaders });

  } catch (error) {
    console.error('Failed to get favorite status:', error);
    // エラーレスポンスにもヘッダーを付ける
    const body = JSON.stringify({ error: 'Failed to get favorite status' });
    return new Response(body, { status: 500, headers: responseHeaders });
  }
};