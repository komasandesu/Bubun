// app/routes/profile.$username_.favorite.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/models/db.server";
import { useLoaderData, Link, Form } from '@remix-run/react';
import { json } from "@remix-run/node";
import { requireAuthenticatedUser } from "~/services/auth.server";
import PostCard from "./components/PostCard";
import { postRepository } from "~/models/post.server"; // 追加

const POSTS_PER_PAGE = 10; // 1ページに表示する投稿数
const FAVORITES_PER_PAGE = 10; // お気に入りの投稿数

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

  // お気に入り投稿の総数をカウント
  const totalFavorites = await postRepository.countFavoritesByUserId(profileUser.id);
  const totalPages = Math.ceil(totalFavorites / FAVORITES_PER_PAGE);

  // お気に入りの投稿を取得
  const favorites = await postRepository.findFavoritesByUserId(
    profileUser.id,
    (page - 1) * FAVORITES_PER_PAGE,
    FAVORITES_PER_PAGE
  );

  return json({ user, profileUser, favorites, page, totalPages });
}


export default function UserFavorites() {
  const { user, profileUser, favorites, page, totalPages } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">{profileUser.name}さんのお気に入り投稿</h1>

        <ul className="space-y-2">
          {favorites.length > 0 ? (
            favorites.map((favorite) => (
              <li key={favorite.id}>
                <PostCard post={{ 
                    ...favorite.post, 
                    createdAt: new Date(favorite.post.createdAt), 
                    updatedAt: new Date(favorite.post.updatedAt) 
                    }} 
                />
              </li>
            ))
          ) : (
            <p className="text-gray-500">お気に入りの投稿がありません。</p>
          )}
        </ul>
      </div>

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

      {/* プロフィールへのリンク */}
      <Link to={`/profile/${profileUser.name}`} className="text-blue-600 hover:underline mt-4">
        プロフィールに戻る
      </Link>
    </div>
  );
}
