// app/routes/profile.$username.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/models/db.server";
import { useLoaderData, Link, Form, useSearchParams } from '@remix-run/react';
import { json } from "@remix-run/node";
import { postRepository } from "~/models/post.server"; // 追加
import { useSyncExternalStore } from "react";
import { requireAuthenticatedUser } from "~/services/auth.server";
import PostCard from "./components/PostCard";


const POSTS_PER_PAGE = 10; // 1ページに表示する投稿数

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const user = await requireAuthenticatedUser(request);
  const profileUser = await prisma.user.findUnique({
    where: { name: username },
  });

  if (!profileUser) {
    throw new Response("User not found", { status: 404 });
  }

  const totalPosts = await postRepository.countByUserId(profileUser.id);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const posts = await postRepository.findByUserId(
    profileUser.id,
    (page - 1) * POSTS_PER_PAGE,
    POSTS_PER_PAGE
  );

  return json({ user, profileUser, posts, page, totalPages });
}

export default function UserProfile() {
  const { user, profileUser, posts, page, totalPages } = useLoaderData<typeof loader>();

  const formattedDate = useSyncExternalStore(
    () => () => {},
    () => new Date(profileUser.createdAt).toLocaleString(),
    () => "~"
  );

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">{profileUser.name}さんのプロフィール</h1>
        <div className="space-y-4">
          <p className="text-gray-600">作成日: {formattedDate}</p>

          <Link to={`/profile/${profileUser.name}/favorite`} className="text-blue-600 hover:underline ml-4">
            お気に入り一覧
          </Link>

          {user.id === profileUser.id && (
            <div>
              <Link to="/profile/settings" className="text-blue-600 hover:underline">
                プロフィールを編集する
              </Link>
              
              <Form action="/logout" method="post" className="mt-6">
                <button
                  type="submit"
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                >
                  ログアウト
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-6">投稿一覧</h2>
      <ul className="space-y-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt),
                  updatedAt: new Date(post.updatedAt),
                }}
              />
            </li>
          ))
        ) : (
          <p className="text-gray-500">まだ投稿がありません。</p>
        )}
      </ul>

      {/* ページネーション */}
      <div className="flex justify-center space-x-2 mt-4">
        {/* 最初のページ */}
        {page > 1 && (
          <Link
            to="?page=1"
            className={`px-4 py-2 border rounded ${page === 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            1
          </Link>
        )}

        {/* 省略記号 */}
        {page > 3 && <span className="px-2">…</span>}

        {/* 現在のページの前後 */}
        {page > 2 && (
          <Link to={`?page=${page - 1}`} className="px-4 py-2 border rounded bg-white text-blue-500">
            {page - 1}
          </Link>
        )}

        {/* 現在のページ */}
        <span className="px-4 py-2 border rounded bg-blue-500 text-white">{page}</span>

        {page < totalPages && (
          <Link to={`?page=${page + 1}`} className="px-4 py-2 border rounded bg-white text-blue-500">
            {page + 1}
          </Link>
        )}

        {/* 最後のページ */}
        {totalPages > 1 && page < totalPages - 1 && (
          <span className="px-2">…</span>
        )}
        {page < totalPages-1 && (
          <Link
            to={`?page=${totalPages}`}
            className={`px-4 py-2 border rounded ${page === totalPages ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            {totalPages}
          </Link>
        )}
      </div>
    </div>
  );
}