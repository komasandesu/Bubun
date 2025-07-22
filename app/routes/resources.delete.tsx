// app/routes/resources.delete.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  // user と session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  // ② どのリダイレクトでも使えるように、ヘッダーを先に作っておく！
  const headers = {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
  
  const formData = await request.formData();
  
  const postId = formData.get('postId') as string | null;
  const redirectTo = formData.get('redirectTo') as string | null;

  if (!postId) {
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({ error: 'Post ID is required' });
    // このエラーはあまり起きないかもだけど念のため
    return new Response(body, { status: 400, headers: errorHeaders });
  }

  try {
    // 自分の投稿だけ削除できるように、ちゃんと user.id を渡す
    await postRepository.delete({ id: parseInt(postId, 10), userId: user.id });

    // 成功した時のリダイレクトにヘッダーを付ける
    return redirect(redirectTo || `/posts/`, headers);
  } catch (error) {
    console.error("Error deleting post:", error);
    // エラーでリダイレクトする時も、ちゃんとヘッダーを付けてあげる
    return redirect(redirectTo || `/posts/`, headers);
  }
};