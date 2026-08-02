import { Outlet, useLoaderData } from 'react-router';
import type { LoaderFunction } from 'react-router';
import type { User } from '@prisma/client';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import { commitSession } from '~/services/session.server';
import Header from '../components/Header';

interface LoaderData {
  user: User | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, session } = await getAuthenticatedUserOrNull(request);
  const body = JSON.stringify({ user });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { headers });
};

export default function AppLayout() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="bubutter" username={user?.name || null} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
