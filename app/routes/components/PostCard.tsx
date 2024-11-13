// app/routes/components/PostCard.tsx
import { Link } from "@remix-run/react";
import FavoriteButton from '~/routes/components/FavoriteButton';
import { Post } from '.prisma/client';
import { useSyncExternalStore } from "react";

type PostCardProps = {
  post: Post;
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const formattedCreatedDate = useSyncExternalStore(
        () => () => {},
        () => {
            const date = new Date(post.createdAt);
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // 24時間制にする場合
            });
        },
        () => '~' // SSR用の仮の値
    );

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <Link
                to={`/posts/${post.id}`}
                className="block text-xl font-medium text-gray-800 hover:underline mb-2 truncate"
                style={{
                    display: 'block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%', // 必要に応じて調整可能
                }}
            >
                {post.originalString} <span className="mx-0.5">の</span> {post.substring} <span className="mx-0.5">の部分</span>
            </Link>
            <p className="text-gray-600 mb-4">
                {formattedCreatedDate}
            </p>
            <div className="flex justify-between items-center">
                <FavoriteButton PostId={post.id} />
            </div>
        </div>
    );
};

export default PostCard;
