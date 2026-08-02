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

  const originalString = (
    formData.get('originalString') as string | null
  )?.trim();
  const substring = (formData.get('substring') as string | null)?.trim();

  if (!originalString || !substring) {
    return redirect('/posts/new?error=missingFields', headers);
  }

  if (originalString.length > 200 || substring.length > 200) {
    return redirect('/posts/new?error=tooLong', headers);
  }

  try {
    await postRepository.create({
      originalString: originalString,
      substring: substring,
      authorId: user.id,
    });

    return redirect('/posts', headers);
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);

    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({ error: 'Failed to create post' });
    return new Response(body, { status: 500, headers: errorHeaders });
  }
};
