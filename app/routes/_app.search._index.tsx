import { type LoaderFunctionArgs } from 'react-router';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { useLoaderData } from 'react-router';
import { favoriteRepository } from '~/models/favorite.server';
import { commitSession } from '~/services/session.server';
import PostCard from '~/components/PostCard';
import Pagination from '~/components/Pagination';

type PostCardProps = {
  id: number;
  parentId: number | null;
  originalString: string;
  substring: string;
  createdAt: string;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
};

const POSTS_PER_PAGE = 1;

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, session } = await getAuthenticatedUserOrNull(request);

  const url = new URL(request.url);
  const query = url.searchParams.get('query') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  const totalPosts = await postRepository.countSearchPosts(query);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = await postRepository.searchPosts(
    query,
    (page - 1) * POSTS_PER_PAGE,
    POSTS_PER_PAGE
  );

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
                initialIsFavorite={post.initialIsFavorite}
                initialFavoriteCount={post.initialFavoriteCount}
              />
            </li>
          ))
        ) : (
          <p className="dark:text-gray-500">一致する投稿がありません。</p>
        )}
      </ul>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        extraQueryParams={{ query }}
      />
    </div>
  );
}
