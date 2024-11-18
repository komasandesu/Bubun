// app/routes/profile.$username.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/models/db.server";
import { useLoaderData, Link, Form, useSearchParams } from '@remix-run/react';
import { json } from "@remix-run/node";
import { postRepository } from "~/models/post.server"; // 追加
import { getAuthenticatedUserOrNull } from "~/services/auth.server";
import PostCard from "./components/PostCard";
import { favoriteRepository } from "~/models/favorite.server";


const POSTS_PER_PAGE = 10; // 1ページに表示する投稿数

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const user = await getAuthenticatedUserOrNull(request);
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

  // posts にお気に入りデータを追加し、createdAt を JST で成形
  const postsWithFavoriteData = (await favoriteRepository.postsWithFavoriteData(posts, user?.id || null)).map(post => ({
    ...post,
    createdAt: new Date(post.createdAt).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  }));

  return json({ user, profileUser, posts:postsWithFavoriteData, page, totalPages });
}

export default function UserProfile() {
  const { user, profileUser, posts, page, totalPages } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6 max-w-3xl bg-gray-100 dark:bg-gray-900">
      <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-gray-100">{profileUser.name}さんのプロフィール</h1>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">作成日: {profileUser.createdAt}</p>

          <div className="space-x-4">
            {/* お気に入り一覧ボタン */}
            <Link
              to={`/profile/favorite`}
              className="inline-flex items-center px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              お気に入り一覧
            </Link>

            {/* プロフィール編集ボタン */}
            {user && user.id === profileUser.id && (
              <Link
                to={`/profile/${profileUser.name}/settings`}
                className="inline-flex items-center px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                プロフィール編集
              </Link>
            )}
          </div>
          
          <Form action="/logout" method="post" className="mt-6">
            {user && user.id === profileUser.id && (
              <button
                type="submit"
                className="flex items-center bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition dark:bg-red-600 dark:hover:bg-red-700"
              >
                {/* ログアウトアイコン */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                ログアウト
              </button>
            )}
          </Form>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-6 text-black dark:text-gray-100">投稿一覧</h2>
      <ul className="space-y-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <PostCard
                key={post.id}
                id={post.id}
                parentId={post.parentId}
                originalString={post.originalString}
                substring={post.substring}
                createdAt={post.createdAt}
                initialIsFavorite={post.initialIsFavorite} // 初期のお気に入り状態
                initialFavoriteCount={post.initialFavoriteCount} // 初期のお気に入り数
              />
            </li>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">まだ投稿がありません。</p>
        )}
      </ul>

      {/* ページネーション */}
      <div className="flex justify-center space-x-2 mt-4">
        {/* 最初のページ */}
        {page > 1 && (
          <Link
            to="?page=1"
            className={`px-4 py-2 border rounded ${
              page === 1
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500 dark:bg-gray-800 dark:text-blue-400'
            }`}
          >
            1
          </Link>
        )}

        {/* 省略記号 */}
        {page > 3 && <span className="px-2 text-gray-500 dark:text-gray-400">…</span>}

        {/* 現在のページの前後 */}
        {page > 2 && (
          <Link
            to={`?page=${page - 1}`}
            className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-800 dark:text-blue-400"
          >
            {page - 1}
          </Link>
        )}

        {/* 現在のページ */}
        <span className="px-4 py-2 border rounded bg-blue-500 text-white">{page}</span>

        {page < totalPages && (
          <Link
            to={`?page=${page + 1}`}
            className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-800 dark:text-blue-400"
          >
            {page + 1}
          </Link>
        )}

        {/* 省略記号 */}
        {page < totalPages - 2 && <span className="px-2 text-gray-500 dark:text-gray-400">…</span>}

        {/* 最後のページ */}
        {page < totalPages - 1 && (
          <Link
            to={`?page=${totalPages}`}
            className={`px-4 py-2 border rounded ${
              page === totalPages
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500 dark:bg-gray-800 dark:text-blue-400'
            }`}
          >
            {totalPages}
          </Link>
        )}
      </div>
    </div>
  );
}
