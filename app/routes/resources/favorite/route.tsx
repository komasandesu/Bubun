import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { favoriteRepository } from '~/models/favorite.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, session } = await requireAuthenticatedUser(request);

  const sessionCookie = await commitSession(session);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
  responseHeaders.set('Set-Cookie', sessionCookie);

  const formData = await request.formData();
  const PostId = Number(formData.get('PostId'));

  if (!PostId) {
    const body = JSON.stringify({ error: 'Invalid post ID' });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  try {
    const result = await favoriteRepository.toggleFavorite({
      PostId: PostId,
      userId: user.id,
    });

    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    const body = JSON.stringify({
      success: true,
      added: result.added,
      favoriteCount,
    });
    return new Response(body, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    const body = JSON.stringify({ error: 'Failed to toggle favorite' });
    return new Response(body, { status: 500, headers: responseHeaders });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user, session } = await requireAuthenticatedUser(request);

  const sessionCookie = await commitSession(session);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
  responseHeaders.set('Set-Cookie', sessionCookie);

  const url = new URL(request.url);
  const PostId = Number(url.searchParams.get('PostId'));

  if (!PostId) {
    const body = JSON.stringify({ error: 'Invalid post ID' });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  try {
    const isFavorite = await favoriteRepository.isFavorite({
      PostId,
      userId: user.id,
    });
    const favoriteCount = await favoriteRepository.countFavorites(PostId);

    const body = JSON.stringify({ isFavorite, favoriteCount });
    return new Response(body, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error('Failed to get favorite status:', error);
    const body = JSON.stringify({ error: 'Failed to get favorite status' });
    return new Response(body, { status: 500, headers: responseHeaders });
  }
};
