// app/routes/posts.$postId.tsx
import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import { postRepository } from '~/models/post.server';
import { favoriteRepository } from '~/models/favorite.server'; // お気に入りのリポジトリをインポート

import { getAuthenticatedUserOrNull, requireAuthenticatedUser } from '~/services/auth.server';

import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { post } = data;

  return [
    { title: `bubutter | ${post?.originalString}の${post?.substring}の部分` },
    { name: "description", content: `${post?.originalString}の${post?.substring}の部分` },
    { property: "og:title", content: `${post?.originalString}の${post?.substring}の部分` },
    { property: "og:description", content: `${post?.originalString}の${post?.substring}の部分` },
    { property: "og:site_name", content: "bubutter" },
    { property: "og:type", content: "article" },
    { property: "og:url", content: `https://bubutter.at-math.com/posts/${post?.id}` },
    { property: "og:image", content: "https://bubutter.at-math.com/og-image.png" },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getAuthenticatedUserOrNull(request); // ユーザー情報を取得
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);

    if (post.parentId) {
      return redirect(`/posts/${post.parentId}`);
    }

    // 投稿の createdAt を成形
    const formattedPostDate = new Date(post.createdAt).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // 投稿のメインアイテムのお気に入り情報を取得
    const [isFavorite, favoriteCount] = await Promise.all([
      user?.id ? favoriteRepository.isFavorite({ PostId: postId, userId: user?.id || null }) : Promise.resolve(false),
      favoriteRepository.countFavorites(postId)
    ]);
    

    // posts にお気に入りデータを追加し、createdAt を JST で成形
    const repliesWithFavoriteInfo = (await favoriteRepository.postsWithFavoriteData(post.replies, user?.id || null)).map(post => ({
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

    return new Response(JSON.stringify({
      post: { 
        ...post, 
        createdAt: formattedPostDate,
        replies: repliesWithFavoriteInfo },
      user,
      initialIsFavorite: isFavorite,
      initialFavoriteCount: favoriteCount,
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    throw new Response("Post Not Found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request);
  
  if(user === null){
    return redirect("/login");
  }

  const formData = new URLSearchParams(await request.text());
  const originalString = formData.get('originalString');
  const substring = formData.get('substring');
  const postId = parseInt(params.postId || '', 10);
  const authorId = user.id;

  if (!originalString || !substring || isNaN(postId)) {
    throw new Response("Invalid Data", { status: 400 });
  }

  await postRepository.createReply({ originalString, substring, authorId, parentId: postId });

  return redirect(`/posts/${postId}`);
};

export default function PostShow() {
  const { post, user, initialIsFavorite, initialFavoriteCount } = useLoaderData<typeof loader>();

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

      <ReplyList replies={post.replies} postId={post.id} userId={user?.id || null} />
      {/* エラーメッセージの表示 */}
      {errorMessage && (
        <div className="error-message" style={{ color: 'red' }}>
          {errorMessage}
        </div>
      )}
      <ReplyForm postId={post.id}/>
    </div>
  );
}
