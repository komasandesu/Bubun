// app/routes/resources.replies.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  // user と一緒に session も受け取るように変更
  const { user, session } = await requireAuthenticatedUser(request);

  const headersForRedirect = {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };

  const formData = await request.formData();
  
  // 型ガードを使用して値を取得
  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();
  const postId = Number(formData.get('postId'));
  const redirectTo = formData.get('redirectTo') as string | null;
  
  // 入力のバリデーション
  if (!originalString || !substring || isNaN(postId)) {
    return redirect('/posts/new?error=missingFields', headersForRedirect);
  }
  
  // 文字数制限
  if (originalString.length > 200 || substring.length > 200) {
    return redirect(`/posts/${postId}?error=tooLong`, headersForRedirect);
  }
  
  try {
    // リプライを作成
    await postRepository.createReply({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
      parentId: postId,
    });
    
    // リダイレクト処理
    return redirect(redirectTo || `/posts/${postId}`, headersForRedirect); // リダイレクト先を元の投稿ページに設定
  } catch {
    // console.error('Failed to create reply:', error);
    const body = JSON.stringify({ error: 'Failed to create reply' });
    
    // ヘッダーを組み立てる
    const responseHeaders = new Headers(headersForRedirect.headers);
    responseHeaders.set('Content-Type', 'application/json');

    return new Response(body, {
      status: 500,
      headers: responseHeaders,
    });
  }
};