// app/routes/posts.tsx
import { Outlet } from "@remix-run/react";
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import Header from './components/Header';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return json({ user: user });
};

export default function Posts() {
  const { user } = useLoaderData<{ user: { name: string | null } | null }>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} />
      <Outlet />
    </div>
  );
}
