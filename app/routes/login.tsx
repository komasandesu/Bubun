// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";



// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/posts",
    failureRedirect: "/login",
  });
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/posts",
  });
};

export default function Screen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto p-6 max-w-md bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">ログイン</h1>
        
        <Form method="post" className="space-y-4">
          <input
            type="text"
            name="name"
            required
            placeholder="ユーザー名"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="パスワード"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            サインイン
          </button>
        </Form>
        
        <div className="mt-4 text-center text-black">
          <p>
            新規登録は
            <a href="/register" className="text-blue-600 hover:underline">こちら</a>
            からどうぞ。
          </p>
        </div>
      </div>
    </div>
  );
}