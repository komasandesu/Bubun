/**
 * @file app/routes/resources.edit.tsx
 * @description 投稿（Post）の編集・更新を行うリソースルート（APIエンドポイント）
 *
 * 【将来実装時の仕様・設計書】
 *
 * 1. エンドポイント情報
 *    - URL: /resources/edit
 *    - HTTP Method: POST
 *
 * 2. 入力パラメータ (FormData)
 *    - postId (string, 必須): 編集対象の投稿ID (数値に変換して使用)
 *    - originalString (string, 必須): 変更後の元の文章 (1~200文字)
 *    - substring (string, 必須): 変更後の部分文章 (1~200文字)
 *    - redirectTo (string, 任意): 処理完了後のリダイレクト先URL (指定がない場合は /posts/:postId)
 *
 * 3. 認証・認可仕様
 *    - 認証: ログイン必須 (services/auth.server.ts の requireAuthenticatedUser を使用)
 *    - 認可: 投稿の所有者 (authorId === user.id) のみ編集可能
 *
 * 4. レスポンス・エラー処理
 *    - 未ログイン: /login へリダイレクト
 *    - 入力不備 (400 Bad Request): パラメータ不足・文字数上限オーバー時
 *    - 権限なし (403 Forbidden): 他人の投稿を編集しようとした場合
 *    - 成功: セッションCookieを維持したまま redirectTo または /posts/:postId へリダイレクト
 */

import { redirect, type ActionFunctionArgs } from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

/**
 * 投稿編集アクション handler
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // 1. ユーザー認証チェック
  const { user, session } = await requireAuthenticatedUser(request);

  // 2. セッション保持ヘッダーの準備
  const headers = {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };

  // 3. フォームデータの取得
  const formData = await request.formData();
  const postIdStr = formData.get('postId') as string | null;
  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();
  const redirectTo = formData.get('redirectTo') as string | null;

  const postId = postIdStr ? parseInt(postIdStr, 10) : NaN;

  // 4. バリデーション
  if (isNaN(postId) || !originalString || !substring) {
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ error: 'Post ID, originalString, and substring are required' }),
      { status: 400, headers: errorHeaders }
    );
  }

  if (originalString.length > 200 || substring.length > 200) {
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ error: 'String length must be 200 characters or less' }),
      { status: 400, headers: errorHeaders }
    );
  }

  // 5. DB更新（所有者チェック含む）
  try {
    await postRepository.update({
      id: postId,
      originalString,
      substring,
      userId: user.id,
    });

    return redirect(redirectTo || `/posts/${postId}`, headers);
  } catch (error) {
    console.error('Error updating post:', error);

    if (error instanceof Error && error.message.includes('authorized')) {
      return redirect(redirectTo || `/posts/${postId}?error=unauthorized`, headers);
    }

    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ error: 'Failed to update post' }), {
      status: 500,
      headers: errorHeaders,
    });
  }
};

/**
 * デフォルトコンポーネント (リソースルートのためUI描画なし)
 */
export default function ResourcesEditRoute() {
  return null;
}
