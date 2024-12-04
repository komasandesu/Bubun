// app/routes/resources.replies.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const formData = await request.formData();
  
  // 型ガードを使用して値を取得
  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();
  const postId = Number(formData.get('postId'));
  const redirectTo = formData.get('redirectTo') as string | null;
  
  // 入力のバリデーション
  if (!originalString || !substring || isNaN(postId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid data' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 文字数制限
  if (originalString.length > 200 || substring.length > 200) {
    return new Response(
      JSON.stringify({ error: 'Invalid data' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
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
    return redirect(redirectTo || `/posts/${postId}`); // リダイレクト先を元の投稿ページに設定
  } catch (error) {
    console.error('Failed to create reply:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create reply' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
