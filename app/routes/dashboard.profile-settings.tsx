// app/routes/dashboard.profile-settings.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import bcrypt from 'bcrypt';
import { Form, Link, useActionData } from '@remix-run/react';

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

  // パスワードが変更されている場合は、現在のパスワードを確認
  let isValidPassword = true;
  if (newPassword) {
    isValidPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      return { error: "現在のパスワードが正しくありません。" };
    }
  }

  // 更新データの準備
  const updateData: any = {};
  if (name) updateData.name = name;
  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  // 同じ名前やメールアドレスがすでに存在するかチェック
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name: updateData.name },
      ],
      NOT: {
        id: user.id, // 自分自身のIDは除外
      },
    },
  });

  if (existingUser) {
    if (existingUser.name === updateData.name) {
      return { error: "この名前は既に登録されています。" };
    }
  }

  // ユーザー情報の更新
  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return { success: "プロフィールが正常に更新されました。" };
}

export default function Profile() {
  const actionData = useActionData<ActionData>(); // アクションの結果を取得

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      {actionData?.error && (
        <p className="text-red-500">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500">{actionData.success}</p>
      )}
      <Form method="post" className="mt-6">
        <input
          type="text"
          name="name"
          placeholder="名前"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <input
          type="password"
          name="currentPassword"
          required
          placeholder="現在のパスワード"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="新しいパスワード（変更する場合）"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          プロフィールを更新する
        </button>
      </Form>
      <Link to="/dashboard" className="mt-4 text-blue-500 hover:underline">ダッシュボードに戻る</Link>
    </div>
  );
}
