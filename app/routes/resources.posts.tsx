// app/routes/resources.posts.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  // user と session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  // どのレスポンスでも使えるように、ヘッダーを先に作っておく
  const headers = {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
  
  const formData = await request.formData();

  const originalString = (formData.get('originalString') as string | null)?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();

  // 入力のバリデーションでリダイレクトする時もヘッダーを付ける
  if (!originalString || !substring) {
    return redirect('/posts/new?error=missingFields', headers);
  }

  // 200文字以上の入力を拒否
  if (originalString.length > 200 || substring.length > 200) {
    return redirect('/posts/new?error=tooLong', headers);
  }

  try {
    // 新しい投稿を作成
    await postRepository.create({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
    });

    // 成功した時のリダイレクトにもヘッダーを付ける
    return redirect('/posts', headers);
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);

    // エラーレスポンスの時も、ちゃんとヘッダーを付けてあげる
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({ error: 'Failed to create post' });
    return new Response(body, { status: 500, headers: errorHeaders });
  }
};
