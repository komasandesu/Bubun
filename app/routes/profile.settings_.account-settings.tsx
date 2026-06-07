import { Form, Link, useActionData, type ActionFunctionArgs, redirect } from 'react-router';
import { requireAuthenticatedUser } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import bcrypt from 'bcrypt';
import { commitSession } from "~/services/session.server";

interface ActionData {
  success?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, session } = await requireAuthenticatedUser(request);

  const sessionCookie = await commitSession(session);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
  responseHeaders.set('Set-Cookie', sessionCookie);

  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const name = formData.get("name") as string;


  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userData) {
    const body = JSON.stringify({ error: "ユーザー情報が見つかりません。" });
    return new Response(body, { status: 404, headers: responseHeaders });
  }

  // パスワードが変更されている場合は、現在のパスワードを確認
  if (newPassword && !currentPassword) {
    const body = JSON.stringify({ error: "現在のパスワードを入力してください。" });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  if (newPassword && !await bcrypt.compare(currentPassword, userData.password)) {
    const body = JSON.stringify({ error: "現在のパスワードが正しくありません。" });
    return new Response(body, { status: 400, headers: responseHeaders });
  }

  // 更新データの準備
  const updateData: { name?: string; password?: string } = {};
  if (name) updateData.name = name;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

  if (Object.keys(updateData).length === 0) {
    const body = JSON.stringify({ error: "変更する情報がありません。" });
    return new Response(body, { status: 400, headers: responseHeaders });
  }
  
  if (updateData.name) {
    const alphaNumericRegex = /^[a-zA-Z0-9_]+$/; // アンダーバーも許可
    if (!alphaNumericRegex.test(name)) {
      const body = JSON.stringify({ error: "ユーザー名はアルファベット、数字、アンダーバーのみ使用できます。" });
      return new Response(body, { status: 400, headers: responseHeaders });
    }
    const existingUser = await prisma.user.findFirst({
      where: { name: updateData.name, NOT: { id: user.id } },
    });
    if (existingUser) {
      const body = JSON.stringify({ error: "この名前は既に登録されています。" });
      return new Response(body, { status: 400, headers: responseHeaders });
    }
  }

  const updatedDbUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  session.set("user", updatedDbUser);

  return redirect(`/profile/${updatedDbUser.name}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function AccountSettings() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        プロフィール編集
      </h1>
      {actionData?.error && (
        <p className="text-red-500 dark:text-red-400">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 dark:text-green-400">{actionData.success}</p>
      )}
      <Form method="post" className="mt-6">
        <input
          type="text"
          name="name"
          placeholder="ユーザー名"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white mb-4"
        />
        <input
          type="password"
          name="currentPassword"
          placeholder="現在のパスワード"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white mb-4"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="新しいパスワード（変更する場合）"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          プロフィールを更新する
        </button>
      </Form>
      <Link
        to="/profile/settings"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 underline mt-4 block"
      >
        プロフィール設定はこちら
      </Link>
    </div>
  );
}