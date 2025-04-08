// app/routes/profile.$username_.favorite.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/models/db.server";
import { useLoaderData, Link, Form } from '@remix-run/react';
import { getAuthenticatedUserOrNull } from "~/services/auth.server";
import PostCard from "./components/PostCard";
import { postRepository } from "~/models/post.server"; // 追加
import { favoriteRepository } from "~/models/favorite.server";

type PostCardProps = {
  id: number;
  parentId: number | null;
  originalString: string;
  substring: string;
  createdAt: string;
  initialIsFavorite: boolean; // 初期のお気に入り状態
  initialFavoriteCount: number; // 初期のお気に入り数
};

const FAVORITES_PER_PAGE = 10; // お気に入りの投稿数

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

  // お気に入り投稿の総数をカウント
  const totalFavorites = await postRepository.countFavoritesByUserId(profileUser.id);
  const totalPages = Math.ceil(totalFavorites / FAVORITES_PER_PAGE);

  // お気に入りの投稿を取得
  const favorites = await postRepository.findFavoritesByUserId(
    profileUser.id,
    (page - 1) * FAVORITES_PER_PAGE,
    FAVORITES_PER_PAGE
  );

  // favorites にお気に入りデータを追加し、createdAt を JST で成形
  const postsWithFavoriteData = (await favoriteRepository.postsWithFavoriteData(favorites.map(f => f.post), user?.id || null)).map(post => ({
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

  return new Response(
    JSON.stringify({ user, profileUser, favorites: postsWithFavoriteData, page, totalPages }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}


export default function UserFavorites() {
  const { user, profileUser, favorites, page, totalPages } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
          {profileUser.name}さんのお気に入り投稿
        </h1>

        <ul className="space-y-2">
          {favorites.length > 0 ? (
            favorites.map((favorite:PostCardProps) => (
              <li key={favorite.id}>
                <PostCard 
                  key={favorite.id} 
                  id={favorite.id}
                  parentId={favorite.parentId}
                  originalString={favorite.originalString}
                  substring={favorite.substring}
                  createdAt={favorite.createdAt}
                  initialIsFavorite={favorite.initialIsFavorite} // 初期のお気に入り状態
                  initialFavoriteCount={favorite.initialFavoriteCount} // 初期のお気に入り数
                />
              </li>
            ))
          ) : (
            <p className="dark:text-gray-400">お気に入りの投稿がありません。</p>
          )}
        </ul>
      </div>

      {/* ページネーション */}
      <div className="flex justify-center space-x-2 mt-4">
        {/* 最初のページ */}
        {page > 1 && (
          <Link
            to="?page=1"
            className={`px-4 py-2 border rounded ${
              page === 1 ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400'
            }`}
          >
            1
          </Link>
        )}

        {/* 省略記号 */}
        {page > 3 && <span className="px-2 dark:text-white">…</span>}

        {/* 現在のページの前後 */}
        {page > 2 && (
          <Link
            to={`?page=${page - 1}`}
            className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400"
          >
            {page - 1}
          </Link>
        )}

        {/* 現在のページ */}
        <span className="px-4 py-2 border rounded bg-blue-500 text-white dark:bg-blue-600">{page}</span>

        {page < totalPages && (
          <Link
            to={`?page=${page + 1}`}
            className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400"
          >
            {page + 1}
          </Link>
        )}

        {/* 省略記号 */}
        {page < totalPages - 2 && <span className="px-2 dark:text-white">…</span>}

        {/* 最後のページ */}
        {page < totalPages - 1 && (
          <Link
            to={`?page=${totalPages}`}
            className={`px-4 py-2 border rounded ${
              page === totalPages ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400'
            }`}
          >
            {totalPages}
          </Link>
        )}
      </div>

      {/* プロフィールへのリンク */}
      <Link
        to={`/profile/${profileUser.name}`}
        className="text-blue-600 hover:underline mt-4 dark:text-blue-400"
      >
        プロフィールに戻る
      </Link>
    </div>
  );
}
