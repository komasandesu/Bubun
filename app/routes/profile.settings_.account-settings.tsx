// app/routes/profile.settings.account-settings.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireAuthenticatedUser } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import bcrypt from 'bcrypt';
import { Form, Link, useActionData } from '@remix-run/react';
import { commitSession, sessionStorage } from "~/services/session.server";

interface ActionData {
  success?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const name = formData.get("name") as string;

  const user = await requireAuthenticatedUser(request);
  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userData) {
    return { error: "ユーザー情報が見つかりません。" };
  }

  // パスワードが変更されている場合は、現在のパスワードを確認
  if (newPassword && !currentPassword) {
    return { error: "現在のパスワードを入力してください。" };
  }

  if (newPassword && !await bcrypt.compare(currentPassword, userData.password)) {
    return { error: "現在のパスワードが正しくありません。" };
  }

  // 更新データの準備
  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

  // 同じ名前がすでに存在するかチェック
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name: updateData.name },
      ],
      NOT: { id: user.id }, // 自分自身のIDは除外
    },
  });

  // ユーザー名が指定されている場合の重複チェック
  if (updateData.name) {
    const alphaNumericRegex = /^[a-zA-Z0-9_]+$/; // アンダーバーも許可
    if (!alphaNumericRegex.test(name)) {
      return { error: "ユーザー名はアルファベット、数字、アンダーバーのみ使用できます。" };
    }
    if (existingUser && existingUser.name === updateData.name) {
      return { error: "この名前は既に登録されています。" };
    }
  }

  // ユーザー情報の更新
  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // セッションを更新
  let new_session = await sessionStorage.getSession(request.headers.get("cookie"));
  new_session.set("user", user);

  // プロフィール更新後にリダイレクト
  return redirect(`/profile/${updateData.name || userData.name}`, {
    headers: { "Set-Cookie": await commitSession(new_session) },
  });
}

export default function AccountSettings() {
  const actionData = useActionData<ActionData>(); // アクションの結果を取得

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