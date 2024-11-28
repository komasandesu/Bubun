// app/routes/resources.posts.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const formData = await request.formData();
  
  // 型ガードを使用して値を取得し、前後の空白と改行を削除
  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();

  // 入力のバリデーション
  if (!originalString || !substring) {
    return new Response(
      JSON.stringify({ error: 'タイトルとコンテンツは必須です。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 200文字以上の入力を拒否
  if (originalString.length > 200 || substring.length > 200) {
    return new Response(
      JSON.stringify({ error: 'タイトルまたはコンテンツは200文字以内で入力してください。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 新しい投稿を作成
    await postRepository.create({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
    });

    // 投稿一覧ページにリダイレクト
    return redirect('/posts'); 
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);
    return new Response(
      JSON.stringify({ error: '投稿の作成に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
