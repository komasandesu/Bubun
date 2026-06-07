import {
  redirect,
  useLoaderData,
  useLocation,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from 'react-router';
import { postRepository } from '~/models/post.server';
import { favoriteRepository } from '~/models/favorite.server';
import {
  getAuthenticatedUserOrNull,
  requireAuthenticatedUser,
} from '~/services/auth.server';
import { commitSession } from '~/services/session.server';

import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { post } = data as any;

  return [
    { title: `bubutter | ${post?.originalString}の${post?.substring}の部分` },
    {
      name: 'description',
      content: `${post?.originalString}の${post?.substring}の部分`,
    },
    {
      property: 'og:title',
      content: `${post?.originalString}の${post?.substring}の部分`,
    },
    {
      property: 'og:description',
      content: `${post?.originalString}の${post?.substring}の部分`,
    },
    { property: 'og:site_name', content: 'bubutter' },
    { property: 'og:type', content: 'article' },
    {
      property: 'og:url',
      content: `https://bubutter.at-math.com/posts/${post?.id}`,
    },
    {
      property: 'og:image',
      content: 'https://bubutter.at-math.com/og-image.png',
    },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  // user と session を受け取る(ユーザーがいなくてもsessionは返ってくる)
  const { user, session } = await getAuthenticatedUserOrNull(request);
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  if (!postId) {
    throw new Response('Not Found', { status: 404 });
  }

  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);
    if (post.parentId) {
      return redirect(`/posts/${post.parentId}`);
    }

    const formattedPostDate = new Date(post.createdAt).toLocaleString('ja-JP', {
      /* ... */
    });

    const [isFavorite, favoriteCount] = await Promise.all([
      user
        ? favoriteRepository.isFavorite({ PostId: postId, userId: user.id })
        : false,
      favoriteRepository.countFavorites(postId),
    ]);

    const repliesWithFavoriteInfo = (
      await favoriteRepository.postsWithFavoriteData(
        post.replies,
        user?.id || null
      )
    ).map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt).toLocaleString('ja-JP', {
        /* ... */
      }),
    }));

    // レスポンスを返す時に、セッションを更新するヘッダーを付ける
    const body = JSON.stringify({
      post: {
        ...post,
        createdAt: formattedPostDate,
        replies: repliesWithFavoriteInfo,
      },
      user, // user オブジェクトか null がここに入る
      initialIsFavorite: isFavorite,
      initialFavoriteCount: favoriteCount,
    });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.set('Set-Cookie', await commitSession(session));

    return new Response(body, { headers });
  } catch {
    throw new Response('Post Not Found', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  // こちらは認証が必須
  const { user, session } = await requireAuthenticatedUser(request);

  const formData = new URLSearchParams(await request.text());
  const originalString = formData.get('originalString');
  const substring = formData.get('substring');
  const postId = parseInt(params.postId || '', 10);
  const authorId = user.id;

  if (!originalString || !substring || isNaN(postId)) {
    throw new Response('Invalid Data', { status: 400 });
  }

  await postRepository.createReply({
    originalString,
    substring,
    authorId,
    parentId: postId,
  });

  // リダイレクトの時も、ちゃんとヘッダーを付けてセッションを更新
  return redirect(`/posts/${postId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export default function PostShow() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loaderData = useLoaderData() as any;
  const { post, user, initialIsFavorite, initialFavoriteCount } = loaderData;

  // クエリパラメータからエラーメッセージを取得
  const location = useLocation();
  const errorType = new URLSearchParams(location.search).get('error');
  let errorMessage = '';

  switch (errorType) {
    case 'missingFields':
      errorMessage = 'タイトルと内容の両方が必要です。';
      break;
    case 'tooLong':
      errorMessage = 'タイトルまたは内容は 200 文字未満である必要があります。';
      break;
    default:
      errorMessage = '';
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <article className="mb-6">
        <PostItem
          id={post.id}
          parentId={post.parentId}
          originalString={post.originalString}
          substring={post.substring}
          createdAt={post.createdAt}
          authorId={post.authorId}
          authorName={post.author.name}
          userId={user?.id || null}
          initialIsFavorite={initialIsFavorite} // 初期のお気に入り状態
          initialFavoriteCount={initialFavoriteCount} // 初期のお気に入り数
        />
      </article>

      <ReplyList replies={post.replies} userId={user?.id || null} />
      {/* エラーメッセージの表示 */}
      {errorMessage && (
        <div className="error-message" style={{ color: 'red' }}>
          {errorMessage}
        </div>
      )}
      <ReplyForm postId={post.id} />
    </div>
  );
}
