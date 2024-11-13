// app/routes/search.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuthenticatedUser } from "~/services/auth.server";
import { postRepository } from "~/models/post.server";

import { useLoaderData, Link } from "@remix-run/react";
import PostCard from "./components/PostCard";

const POSTS_PER_PAGE = 10; // 1ページに表示する投稿数

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuthenticatedUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  // 検索結果の総数をカウント
  const totalPosts = await postRepository.countSearchPosts(query);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 検索結果を取得
  const posts = await postRepository.searchPosts(query, (page - 1) * POSTS_PER_PAGE, POSTS_PER_PAGE);

  return json({ user, posts, page, totalPages, query });
}

export default function SearchResults() {
    const { user, posts, page, totalPages, query } = useLoaderData<typeof loader>();
  
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">検索結果: "{query}"</h1>
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
            <p className="text-gray-500">一致する投稿がありません。</p>
          )}
        </ul>
  
        {/* ページネーション */}
        <div className="flex justify-center space-x-2 mt-4">
          {/* ページネーションのロジックを追加 */}
          {/* 省略 */}
        </div>
      </div>
    );
  }