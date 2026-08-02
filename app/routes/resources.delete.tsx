import { redirect, ActionFunctionArgs } from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, session } = await requireAuthenticatedUser(request);

  const headers = {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };

  const formData = await request.formData();

  const postId = formData.get('postId') as string | null;
  const redirectTo = formData.get('redirectTo') as string | null;

  if (!postId) {
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({ error: 'Post ID is required' });
    return new Response(body, { status: 400, headers: errorHeaders });
  }

  try {
    await postRepository.delete({ id: parseInt(postId, 10), userId: user.id });
    return redirect(redirectTo || `/posts/`, headers);
  } catch (error) {
    console.error('Error deleting post:', error);
    return redirect(redirectTo || `/posts/`, headers);
  }
};
