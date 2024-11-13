// app/routes/posts.tsx
import { Outlet } from "@remix-run/react";
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '../models/post.server';
import Header from './components/Header';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuthenticatedUser(request);
  const Posts = await postRepository.findAllWithoutReplies();
  return json({ posts: Posts, user: user });
};

export default function Posts() {
  const { user } = useLoaderData<{ user: { name: string | null } | null }>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} /> {/* ここを修正 */}
      <Outlet />
    </div>
  );
}
