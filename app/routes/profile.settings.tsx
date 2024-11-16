// app/routes/dashboard.profile-settings.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import bcrypt from 'bcrypt';
import { Form, Link, useActionData } from '@remix-run/react';
import { commitSession, getSession } from "~/services/session.server";

interface ActionData {
  success?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const name = formData.get("name") as string;

  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userData) {
    return { error: "ユーザー情報が見つかりません。" };
  }

  // 更新データの準備
  const updateData: any = {};
  if (name) {
    // 名前の形式をチェック
    const alphaNumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphaNumericRegex.test(name)) {
      return { error: "ユーザー名はアルファベット、数字、アンダーバーのみ使用できます。" };
    }

    // 他のユーザーと重複していないか確認
    const existingUser = await prisma.user.findFirst({
      where: {
        name: name,
        NOT: { id: user.id }, // 自分以外のユーザーを対象に
      },
    });

    if (existingUser) {
      return { error: "この名前は既に登録されています。" };
    }

    updateData.name = name;
  }

  if (newPassword) {
    // パスワードの確認が必要
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      return { error: "現在のパスワードが正しくありません。" };
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  // 更新データがない場合、処理を中断
  if (Object.keys(updateData).length === 0) {
    return { error: "変更内容がありません。" };
  }

  // ユーザー情報の更新
  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // セッションを更新（名前変更があった場合のみ）
  const session = await getSession(request.headers.get("Cookie"));
  if (updateData.name) {
    session.set(authenticator.sessionKey, { ...user, name: updateData.name });
  }

  return redirect(`/profile/${updateData.name || user.name}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}


export default function Profile() {
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
          required
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
    </div>
  );
}

