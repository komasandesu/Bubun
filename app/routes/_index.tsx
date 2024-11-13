// app/routes/_index.tsx
import { Link, useLoaderData } from '@remix-run/react';
import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/models/db.server';
import { json } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix Social Media' },
    { name: 'description', content: 'Remix Social Media' },
  ];
};

export const loader: LoaderFunction = async () => {
  const posts = await prisma.post.findMany({
    where: { parentId: null }, // 親投稿のみを取得
    orderBy: { createdAt: 'desc' },
    take: 10, // 最新10件を取得
  });

  return json({ posts });
};

export default function Index() {
  const { posts } = useLoaderData<{ posts: { id: string; originalString: string; substring: string; }[] }>();

  return (
    <div className="min-h-screen p-8">
      {/* サービス名 */}
      <div className="flex justify-center mb-10">
        <h1 className="text-5xl font-bold text-gray-200">部分文字列共有サービス</h1>
      </div>

      <div className="flex justify-between">
        {/* 左側: 最新の投稿 */}
        <div className="w-2/5 p-3 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-2 text-black">最新の投稿</h2>
          <div className="space-y-2">
            {posts.map((post) => {

              return (
                <div
                  key={post.id}
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200 text-sm"
                >
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-blue-500 hover:underline text-base block truncate"
                    style={{
                      display: "block",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: "100%", // 必要に応じて幅を調整
                    }}
                  >
                    {post.originalString} <span className="mx-0.5">の</span> {post.substring} <span className="mx-0.5">の部分</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側: リンク（ボタン風） */}
        <div className="w-1/2 flex flex-col items-center justify-center space-y-4">
          <Link
            to="/posts"
            className="bg-blue-500 text-white hover:bg-blue-700 rounded-lg py-3 px-6 text-xl transition duration-300"
          >
            ポスト一覧
          </Link>
          <Link
            to="/login"
            className="bg-blue-500 text-white hover:bg-blue-700 rounded-lg py-3 px-6 text-xl transition duration-300"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}