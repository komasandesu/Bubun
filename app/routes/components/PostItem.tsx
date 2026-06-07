import { Link } from 'react-router';
import FavoriteButton from './FavoriteButton';
import PostOptions from './PostOptions';

// 型定義
type PostItemProps = {
  id: number;
  parentId: number | null;
  originalString: string;
  substring: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  userId: string; // 現在のユーザーID
  initialIsFavorite: boolean; // 初期のお気に入り状態
  initialFavoriteCount: number; // 初期のお気に入り数
};

export default function PostItem({
  id,
  parentId,
  originalString,
  substring,
  createdAt,
  authorId,
  authorName,
  userId,
  initialIsFavorite,
  initialFavoriteCount,
}: PostItemProps) {
  return (
    <div className="mb-6 border border-gray-300 rounded-lg shadow-md p-4 bg-white font-sans dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:shadow-none">
      <h1
        className="text-2xl font-sans mb-2 text-black break-words dark:text-gray-200"
        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
      >
        {originalString} <span className="mx-0.5">の</span> {substring}{' '}
        <span className="mx-0.5">の部分</span>
      </h1>

      <p className="dark:text-gray-400">
        投稿者:
        <Link
          to={`/profile/${authorName}`}
          className="text-blue-600 hover:underline ml-1 dark:text-blue-400"
        >
          {authorName || '不明'}
        </Link>
      </p>
      <p className="dark:text-gray-400">投稿日時: {createdAt}</p>
      <div className="flex items-center justify-between mt-2">
        {/* FavoriteButton に初期データを渡す */}
        <FavoriteButton
          PostId={id}
          initialIsFavorite={initialIsFavorite}
          initialFavoriteCount={initialFavoriteCount}
        />
        <PostOptions
          postId={id}
          parentId={parentId}
          authorId={authorId}
          currentUserId={userId}
          originalString={originalString}
          substring={substring}
        />
      </div>
    </div>
  );
}
