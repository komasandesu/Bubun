// // app/routes/resources.edit.tsx
// import { redirect, type ActionFunctionArgs } from '@remix-run/node';
// import { postRepository } from '~/models/post.server';
// import { requireAuthenticatedUser } from '~/services/auth.server';

// export const action = async ({ request, params }: ActionFunctionArgs) => {
//   const user = await requireAuthenticatedUser(request);
  
//   if(user === null){
//     return redirect("/login");
//   }
  
//   const formData = await request.formData();
  
//   const postId = formData.get('postId') as string | null;
//   const originalString = formData.get('originalString') as string | null;
//   const substring = formData.get('substring') as string | null;
//   const redirectTo = formData.get('redirectTo') as string | null;

//   if (!postId || !originalString || !substring) {
//     return new Response(
//         JSON.stringify({ error: 'Post ID, title, and content are required' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//   }

//   try {
//     await postRepository.update({
//       id: parseInt(postId, 10),
//       originalString,
//       substring,
//       userId: user.id,
//     });

//     return redirect(redirectTo || `/posts/${postId}`);
//   } catch (error) {
//     console.error("Error updating post:", error);

//     if (error instanceof Error && error.message === 'You are not authorized to edit this post') {
//       return redirect(redirectTo || `/posts/${postId}`);
//     }

//     throw new Response("Error updating post", { status: 500 });
//   }
// };
