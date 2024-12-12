// app/routes/login.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { data, Form, redirect, useActionData, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionFunctionArgs) {
  try {
    // ユーザーの認証
    const user = await authenticator.authenticate("user-pass", request);
    console.log(user);

    // 認証成功した場合、セッションにユーザー情報を保存
    let session = await sessionStorage.getSession(request.headers.get("cookie"));
    session.set("user", user);

    // ホームページにリダイレクト（セッションのセットを含む）
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    // 認証失敗時にエラー処理を行う
    console.error("Authentication failed", error);

    // 失敗した場合、セッションをクリア
    let session = await sessionStorage.getSession(request.headers.get("cookie"));
    session.unset("user");

    // エラーメッセージをURLのクエリパラメータとして設定
    return redirect("/login?error=Invalid%20credentials", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }
}


// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
export async function loader({ request }: LoaderFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");
  if(user){
    throw redirect("/posts");
  }
  return data(null);
}

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
          <p className="text-red-500 mb-4 text-center">ユーザー名かパスワードが違います</p>
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