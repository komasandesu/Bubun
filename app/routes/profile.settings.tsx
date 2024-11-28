// app/routes/profile.settings.tsx
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';

interface ActionData {
  success?: string;
  error?: string;
}

interface LoaderData {
  profile: string | null;
  twitterId: string | null;
}

// Loader: 現在のプロフィール情報を取得
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect("/login");
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { profile: true, twitterId: true },
  });

  if (!userData) {
    throw new Response("ユーザー情報が見つかりません。", { status: 404 });
  }

  return Response.json({
    profile: userData.profile ?? null,  // nullの場合は明示的にnullに設定
    twitterId: userData.twitterId ?? null, // nullの場合は明示的にnullに設定
  });
}

// Action: プロフィールを更新
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const profile = formData.get("profile") as string;
  const twitterId = formData.get("twitterId") as string;

  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }

  const updateData: Record<string, any> = {};
  if (profile) updateData.profile = profile;
  if (twitterId) updateData.twitterId = twitterId;

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return { success: "プロフィールが更新されました。" };
}

// コンポーネント
export default function ProfileSettings() {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        プロフィール設定
      </h1>
      {actionData?.error && (
        <p className="text-red-500 dark:text-red-400">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 dark:text-green-400">{actionData.success}</p>
      )}
      <Form method="post" className="mt-6">
        {/* プロフィール文のタイトル */}
        <label htmlFor="profile" className="text-lg font-semibold text-black dark:text-white mb-2 block">
          プロフィール文
        </label>
        <textarea
          name="profile"
          id="profile"
          placeholder="プロフィール"
          defaultValue={loaderData.profile || ""} // nullの場合は空文字列を表示
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white mb-4"
        ></textarea>

        {/* ツイッターIDのタイトル */}
        <label htmlFor="twitterId" className="text-lg font-semibold text-black dark:text-white mb-2 block">
          Twitter ID
        </label>
        <div className="flex items-center mb-4">
          <span className="mr-2 text-gray-600 dark:text-gray-400">@</span>
          <input
            type="text"
            name="twitterId"
            id="twitterId"
            placeholder="Twitter ID"
            defaultValue={loaderData.twitterId || ""} // nullの場合は空文字列を表示
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          プロフィールを更新する
        </button>
      </Form>
      <Link
        to="/account-settings"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 underline mt-4 block"
      >
        アカウント設定はこちら
      </Link>
    </div>
  );
}