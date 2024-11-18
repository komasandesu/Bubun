// app/routes/profile.tsx
import { Outlet } from "@remix-run/react";
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import Header from './components/Header';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return json({ user: user });
};

export default function Profile() {
  const { user } = useLoaderData<{ user: { name: string | null } | null }>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} /> {/* ここを修正 */}
      <Outlet />
    </div>
  );
}
