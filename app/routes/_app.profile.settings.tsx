import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Form,
  Link,
  useActionData,
  useLoaderData,
} from 'react-router';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { prisma } from '~/models/db.server';
import { commitSession } from '~/services/session.server';

interface ActionData {
  success?: string;
  error?: string;
}

interface LoaderData {
  profile: string | null;
  twitterId: string | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, session } = await requireAuthenticatedUser(request);

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { profile: true, twitterId: true },
  });

  if (!userData) {
    throw new Response('ユーザー情報が見つかりません。', { status: 404 });
  }

  const body = JSON.stringify({
    profile: userData.profile ?? null,
    twitterId: userData.twitterId ?? null,
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { status: 200, headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, session } = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const profile = formData.get('profile') as string;
  const twitterId = formData.get('twitterId') as string;

  const updateData: { profile?: string; twitterId?: string } = {};
  if (profile !== null) updateData.profile = profile;
  if (twitterId !== null) updateData.twitterId = twitterId;

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  const body = JSON.stringify({ success: 'プロフィールが更新されました。' });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.set('Set-Cookie', await commitSession(session));

  return new Response(body, { status: 200, headers });
}

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
        <p className="text-green-500 dark:text-green-400">
          {actionData.success}
        </p>
      )}
      <Form method="post" className="mt-6">
        <label
          htmlFor="profile"
          className="text-lg font-semibold text-black dark:text-white mb-2 block"
        >
          プロフィール文
        </label>
        <textarea
          name="profile"
          id="profile"
          placeholder="プロフィール"
          defaultValue={loaderData.profile || ''}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white mb-4"
        ></textarea>

        <label
          htmlFor="twitterId"
          className="text-lg font-semibold text-black dark:text-white mb-2 block"
        >
          Twitter ID
        </label>
        <div className="flex items-center mb-4">
          <span className="mr-2 text-gray-600 dark:text-gray-400">@</span>
          <input
            type="text"
            name="twitterId"
            id="twitterId"
            placeholder="Twitter ID"
            defaultValue={loaderData.twitterId || ''}
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
        to="/profile/settings/account-settings"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 underline mt-4 block"
      >
        アカウント設定はこちら
      </Link>
    </div>
  );
}
