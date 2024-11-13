// app/routes/posts.$postId.tsx
import { useSyncExternalStore } from 'react';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

import { requireAuthenticatedUser } from '~/services/auth.server';

import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request); // ユーザー情報を取得
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);

    // 投稿が返信である場合は親ポストにリダイレクト
    if (post.parentId) {
      return redirect(`/posts/${post.parentId}`);
    }

    return json({ post, user }); // 投稿とユーザー情報を返す
  } catch (error) {
    throw new Response("Post Not Found", { status: 404 });
  }
};


export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request);

  const formData = new URLSearchParams(await request.text());
  const originalString = formData.get('originalString'); // タイトルを取得
  const substring = formData.get('substring');
  const postId = parseInt(params.postId || '', 10); // postIdをparamsから取得
  const authorId = user.id; // 現在のユーザーのIDを設定してください

  if (!originalString || !substring || isNaN(postId)) {
    throw new Response("Invalid Data", { status: 400 });
  }

  await postRepository.createReply({ originalString, substring, authorId, parentId: postId });

  return redirect(`/posts/${postId}`);
};



export default function PostShow() {
  const { post, user } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <article className="mb-6">
        {/* PostItemコンポーネントを使用して投稿を表示 */}
      <PostItem
        id={post.id}
        parentId={post.parentId}
        originalString={post.originalString}
        substring={post.substring}
        createdAt={post.createdAt}
        authorId={post.authorId}
        authorName={post.author.name}
        userId={user.id}
      />
      </article>

      <ReplyList replies={post.replies} postId={post.id} userId={user.id} />
      <ReplyForm postId={post.id}/>
    </div>
  );
}