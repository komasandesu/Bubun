// app/routes/search.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { getAuthenticatedUserOrNull } from "~/services/auth.server";
import { postRepository } from "~/models/post.server";

import { useLoaderData, Link } from "@remix-run/react";
import PostCard from "./components/PostCard";
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

const POSTS_PER_PAGE = 10; // 1ページに表示する投稿数

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUserOrNull(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  // 検索結果の総数をカウント
  const totalPosts = await postRepository.countSearchPosts(query);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 検索結果を取得
  const posts = await postRepository.searchPosts(query, (page - 1) * POSTS_PER_PAGE, POSTS_PER_PAGE);

  // userがnullの場合には、userIdにnullを渡す
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

  return new Response(
    JSON.stringify({ user, posts: postsWithFavoriteData, page, totalPages, query }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export default function SearchResults() {
    const { user, posts, page, totalPages, query } = useLoaderData<typeof loader>();
  
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">検索結果: "{query}"</h1>
        <ul className="space-y-2">
          {posts.length > 0 ? (
            posts.map((post:PostCardProps) => (
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
            <p className="text-gray-500">一致する投稿がありません。</p>
          )}
        </ul>
  
        {/* ページネーション */}
        <div className="flex justify-center space-x-2 mt-4">
          {/* 最初のページ */}
          {page > 2 && (
            <Link
              to={`?query=${query}&page=1`}
              className={`px-4 py-2 border rounded ${page === 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
            >
              1
            </Link>
          )}

          {/* 省略記号 */}
          {page > 3 && <span className="px-2">…</span>}

          {/* 現在のページの前のページ */}
          {page > 1 && (
            <Link
              to={`?query=${query}&page=${page - 1}`}
              className="px-4 py-2 border rounded bg-white text-blue-500"
            >
              {page - 1}
            </Link>
          )}

          {/* 現在のページ */}
          <span className="px-4 py-2 border rounded bg-blue-500 text-white">{page}</span>

          {/* 現在のページの次のページ */}
          {page < totalPages && (
            <Link
              to={`?query=${query}&page=${page + 1}`}
              className="px-4 py-2 border rounded bg-white text-blue-500"
            >
              {page + 1}
            </Link>
          )}

          {/* 省略記号 */}
          {page < totalPages - 2 && <span className="px-2">…</span>}

          {/* 最後のページ */}
          {page < totalPages - 1 && (
            <Link
              to={`?query=${query}&page=${totalPages}`}
              className={`px-4 py-2 border rounded ${page === totalPages ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
            >
              {totalPages}
            </Link>
          )}
        </div>
      </div>
    );
  }