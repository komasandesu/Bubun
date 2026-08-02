import { redirect, ActionFunctionArgs } from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, session } = await requireAuthenticatedUser(request);

  const headersForRedirect = {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };

  const formData = await request.formData();

  const originalString = (
    formData.get('originalString') as string | null
  )?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();
  const postId = Number(formData.get('postId'));
  const redirectTo = formData.get('redirectTo') as string | null;

  if (!originalString || !substring || isNaN(postId)) {
    return redirect('/posts/new?error=missingFields', headersForRedirect);
  }

  if (originalString.length > 200 || substring.length > 200) {
    return redirect(`/posts/${postId}?error=tooLong`, headersForRedirect);
  }

  try {
    await postRepository.createReply({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
      parentId: postId,
    });

    return redirect(redirectTo || `/posts/${postId}`, headersForRedirect);
  } catch {
    const body = JSON.stringify({ error: 'Failed to create reply' });

    const responseHeaders = new Headers(headersForRedirect.headers);
    responseHeaders.set('Content-Type', 'application/json');

    return new Response(body, {
      status: 500,
      headers: responseHeaders,
    });
  }
};
