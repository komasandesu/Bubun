import { useLoaderData, type LoaderFunction } from 'react-router';
import { postRepository } from '~/models/post.server';
import { favoriteRepository } from '~/models/favorite.server';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import { commitSession } from '~/services/session.server';
import PostCard from '~/components/PostCard';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';

export const loader: LoaderFunction = async ({ request }) => {
  // user と session を受け取る
  const { user, session } = await getAuthenticatedUserOrNull(request);

  // 次に、投稿データを取得する
  const url = new URL(request.url);
  const lastId = url.searchParams.get('lastId');
  const parsedLastId = lastId !== null ? parseInt(lastId, 10) : undefined;
  const limit = 20;

  const posts = await postRepository.findInfiniteScrollWithoutReplies(
    limit,
    parsedLastId
  );

  // user?.id を使ってお気に入り情報を取る
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

  const hasNextPage = posts.length === limit;

  // 最後に、セッションを更新するヘッダーを付けてレスポンスを返す
  const body = JSON.stringify({ posts: postsWithFavoriteData, hasNextPage });
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { status: 200, headers });
};

// Loader の型
type PostItemType = {
  id: number;
  parentId: number | null;
  originalString: string;
  substring: string;
  createdAt: string;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
};

type LoaderData = {
  posts: PostItemType[];
  hasNextPage: boolean;
};

export default function PostIndex() {
  const { posts: initialPosts, hasNextPage: initialHasNextPage } =
    useLoaderData<LoaderData>();

  const {
    items: posts,
    hasNextPage,
    isLoading,
    observerRef,
  } = useInfiniteScroll<PostItemType>({
    initialItems: initialPosts,
    initialHasNextPage,
    getItemPageUrl: (lastId) =>
      `/posts?index${lastId !== null ? `&lastId=${encodeURIComponent(lastId)}` : ''}`,
    getItemId: (item) => item.id,
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {posts.map((post) => (
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
        ))}
      </div>
      <div ref={observerRef} className="loading-spinner, dark:text-gray-400">
        {isLoading && hasNextPage && <p>Loading...</p>}
      </div>
    </div>
  );
}

