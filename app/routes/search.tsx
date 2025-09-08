// app/routes/search.tsx
import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from '@remix-run/node';
import type { User } from "@prisma/client";
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import { commitSession } from '~/services/session.server';
import Header from './components/Header';

// loaderが返すデータの型を定義しておく
interface LoaderData {
  user: User | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  // user と session を受け取る
  const { user, session } = await getAuthenticatedUserOrNull(request);

  // user情報（もしくはnull）をJSON文字列にする
  const body = JSON.stringify({ user });

  // ヘッダーにセッション更新情報を付ける
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { headers });
};

export default function Posts() {
  // loaderが返す型を指定して、安全にデータを取得
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} />
      <Outlet />
    </div>
  );
}