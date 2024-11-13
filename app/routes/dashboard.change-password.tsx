// app/routes/change-password.tsx
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

  const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
  if (!isValidPassword) {
    return { error: "現在のパスワードが正しくありません。" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: "パスワードが正常に変更されました。" };
}

export default function ChangePassword() {
  const actionData = useActionData<ActionData>(); // アクションの結果を取得

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">パスワード変更</h1>
      {actionData?.error && (
        <p className="text-red-500">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500">{actionData.success}</p>
      )}
      <Form method="post" className="mt-6">
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
          required
          placeholder="新しいパスワード"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          パスワードを変更する
        </button>
      </Form>
      <Link to="/dashboard" className="mt-4 text-blue-500 hover:underline">ダッシュボードに戻る</Link>
    </div>
  );
}
