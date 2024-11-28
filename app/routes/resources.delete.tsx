// app/routes/resources.delete.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const formData = await request.formData();
  
  const postId = formData.get('postId') as string | null;
  const redirectTo = formData.get('redirectTo') as string | null;

  if (!postId) {
    return new Response(
      JSON.stringify({ error: 'Post ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await postRepository.delete({ id: parseInt(postId, 10), userId: user.id });
    return redirect(redirectTo || `/posts/`);
  } catch (error) {
    console.error("Error deleting post:", error);
    // エラーメッセージを返す
    return redirect(redirectTo || `/posts/`);
  }
};