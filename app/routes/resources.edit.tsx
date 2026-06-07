// // app/routes/resources.edit.tsx
// import { redirect, type ActionFunctionArgs } from 'react-router';
// import { postRepository } from '~/models/post.server';
// import { requireAuthenticatedUser } from '~/services/auth.server';
// import { commitSession } from '~/services/session.server';

// export const action = async ({ request }: ActionFunctionArgs) => {
//   // user と session を受け取る
//   const { user, session } = await requireAuthenticatedUser(request);

//   // どのレスポンスでも使えるように、ヘッダーを先に作っておく
//   const headers = {
//     headers: {
//       "Set-Cookie": await commitSession(session),
//     },
//   };
  
//   const formData = await request.formData();
  
//   const postId = formData.get('postId') as string | null;
//   const originalString = formData.get('originalString') as string | null;
//   const substring = formData.get('substring') as string | null;
//   const redirectTo = formData.get('redirectTo') as string | null;

//   if (!postId || !originalString || !substring) {
//     const errorHeaders = new Headers(headers.headers);
//     errorHeaders.set('Content-Type', 'application/json');
//     const body = JSON.stringify({ error: 'Post ID, title, and content are required' });
//     return new Response(body, { status: 400, headers: errorHeaders });
//   }

//   try {
//     // 自分の投稿だけ編集できるように、ちゃんと user.id を渡す
//     await postRepository.update({
//       id: parseInt(postId, 10),
//       originalString,
//       substring,
//       userId: user.id,
//     });

//     // 成功した時のリダイレクトにヘッダーを付ける
//     return redirect(redirectTo || `/posts/${postId}`, headers);
//   } catch (error) {
//     console.error("Error updating post:", error);

//     if (error instanceof Error && error.message === 'You are not authorized to edit this post') {
//       // 権限エラーでリダイレクトする時も、ちゃんとヘッダーを付けてあげる
//       return redirect(redirectTo || `/posts/${postId}`, headers);
//     }

//     // ここで throw したエラーは ErrorBoundary でキャッチされる
//     throw new Response("Error updating post", { status: 500 });
//   }
// };