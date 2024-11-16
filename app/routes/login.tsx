// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";



// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/posts",
    failureRedirect: "/login?error=Invalid%20credentials",
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
  const actionData = useActionData<{ error?: string }>(); // エラーメッセージを取得
  const [searchParams] = useSearchParams(); // URLのクエリパラメータを取得

  // クエリパラメータの error を取得
  const errorMessage = searchParams.get("error") || actionData?.error;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
          ログイン
        </h1>

        {/* エラーメッセージがあれば表示 */}
        {errorMessage && (
          <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
        )}


        <Form method="post" className="space-y-4">
          <input
              type="text"
              name="name"
              required
              placeholder="ユーザー名"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
              type="password"
              name="password"
              required
              placeholder="パスワード"
              autoComplete="new-password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            サインイン
          </button>
        </Form>

        <div className="mt-4 text-center text-black dark:text-gray-300">
          <p>
            新規登録は
            <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              こちら
            </a>
            からどうぞ。
          </p>
        </div>
      </div>
    </div>
  );
}