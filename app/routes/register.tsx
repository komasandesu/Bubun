// app/routes/register.tsx
import { Form, redirect, useActionData } from "@remix-run/react";
import { prisma } from "~/models/db.server"; // Prismaの設定をインポートする
import bcrypt from "bcrypt";
import type { ActionFunctionArgs } from "@remix-run/node"; // 型をインポート

interface ActionData {
    error?: string;
}


// 新規登録のアクション関数を追加
export async function action({ request }: ActionFunctionArgs) {
    const formData = new URLSearchParams(await request.text());
    const name = formData.get("name"); 
    const password = formData.get("password");

    // null チェックを追加
    if (!name || !password) {
        return { error: "ユーザー名、パスワードは必須です。" };
    }

    // ユーザー名がアルファベットと数字のみに限定されているかを確認する
    const alphaNumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphaNumericRegex.test(name)) {
        return { error: "ユーザー名はアルファベット、数字、アンダーバーのみ使用できます。" };
    }

    // 名前の重複を確認
    const existingUserByName = await prisma.user.findUnique({ where: { name } });
    if (existingUserByName) {
        return { error: "この名前は既に使用されています。" }; // 名前の重複エラーを返す
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザーを作成
    await prisma.user.create({
        data: {
        name,
        password: hashedPassword,
        },
    });

    return redirect("/login"); // 登録後にログインページへリダイレクト
}


export default function Register() {
    const actionData = useActionData<ActionData>(); // actionData を取得
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto p-6 max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
                新規登録
                </h1>
                {actionData?.error && (
                <p className="text-red-500 mb-4 text-center">{actionData.error}</p>
                )}{" "}
                {/* エラーメッセージを表示 */}
                <Form method="post" action="/register" className="space-y-4">
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
                        登録する
                    </button>
                    <div className="mt-4 text-center">
                        <p>
                        ログインは
                        <a
                            href="/login"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            こちら
                        </a>
                        からどうぞ。
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}