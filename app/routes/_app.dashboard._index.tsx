import {
  Form,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { commitSession } from '~/services/session.server';
import { type User } from '@prisma/client';

export async function loader({ request }: LoaderFunctionArgs) {
  // user と session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  // user情報をJSONにして、ヘッダーに更新したセッションを付けて返す
  const body = JSON.stringify({ user });
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, {
    status: 200,
    headers: headers,
  });
}

export default function Dashboard() {
  const { user } = useLoaderData() as { user: User };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">ダッシュボード</h1>
        {user ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {user.name}さん、ようこそ！
            </h2>
            <p className="text-gray-600 dark:text-gray-400">作成日: {String(user.createdAt)}</p>

            {/* パスワード変更用画面へのリンク */}
            <Link
              to="/dashboard/profile-settings"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              プロフィールを編集する
            </Link>
          </div>
        ) : (
          <p className="text-red-500">ユーザー情報が見つかりません。</p>
        )}

        {/* ログアウトボタン */}
        <Form action="/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        </Form>
      </div>
    </div>
  );
}
