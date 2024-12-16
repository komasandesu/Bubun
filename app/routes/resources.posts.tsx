// app/routes/resources.posts.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  
  if(user === null){
    return redirect("/login");
  }
  
  const formData = await request.formData();

  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();

  // 入力のバリデーション
  if (!originalString || !substring) {
    return redirect('/posts/new?error=missingFields');
  }

  // 200文字以上の入力を拒否
  if (originalString.length > 200 || substring.length > 200) {
    return redirect('/posts/new?error=tooLong');
  }

  try {
    // 新しい投稿を作成
    await postRepository.create({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
    });

    return redirect('/posts');
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

