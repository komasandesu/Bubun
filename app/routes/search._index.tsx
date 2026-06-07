// app/routes/search.tsx
import { type LoaderFunctionArgs } from 'react-router';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { useLoaderData, Link } from 'react-router';
import { favoriteRepository } from '~/models/favorite.server';
import { commitSession } from '~/services/session.server';
import PostCard from './components/PostCard';

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
  // user と session を受け取る
  const { user, session } = await getAuthenticatedUserOrNull(request);

  const url = new URL(request.url);
  const query = url.searchParams.get('query') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  // 検索結果の総数をカウント
  const totalPosts = await postRepository.countSearchPosts(query);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 検索結果を取得
  const posts = await postRepository.searchPosts(
    query,
    (page - 1) * POSTS_PER_PAGE,
    POSTS_PER_PAGE
  );

  // userがnullの場合には、userIdにnullを渡す
  const postsWithFavoriteData = (
    await favoriteRepository.postsWithFavoriteData(posts, user?.id || null)
  ).map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt).toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }));

  // 最後に、セッションを更新するヘッダーを付けてレスポンスを返す
  const body = JSON.stringify({
    user,
    posts: postsWithFavoriteData,
    page,
    totalPages,
    query,
  });
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { status: 200, headers });
}

export default function SearchResults() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { posts, page, totalPages, query } = useLoaderData() as any;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">
        検索結果: &quot;{query}&quot;
      </h1>
      <ul className="space-y-2">
        {posts.length > 0 ? (
          posts.map((post: PostCardProps) => (
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
          <p className="dark:text-gray-500">一致する投稿がありません。</p>
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
        <span className="px-4 py-2 border rounded bg-blue-500 text-white">
          {page}
        </span>

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
