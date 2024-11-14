// app/routes/components/PostCard.tsx
import { Link } from "@remix-run/react";
import FavoriteButton from '~/routes/components/FavoriteButton';
import { Post } from '.prisma/client';
import { useSyncExternalStore } from "react";

type PostCardProps = {
    id: number;
    parentId: number | null;
    originalString: string;
    substring: string;
    createdAt: string;
    initialIsFavorite: boolean; // 初期のお気に入り状態
    initialFavoriteCount: number; // 初期のお気に入り数
};

const PostCard: React.FC<PostCardProps> = ({  
    id,
    originalString,
    substring,
    createdAt,
    initialIsFavorite,
    initialFavoriteCount
 }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <Link
                to={`/posts/${id}`}
                className="block text-xl font-medium text-gray-800 hover:underline mb-2 truncate"
                style={{
                    display: 'block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%', // 必要に応じて調整可能
                }}
            >
                {originalString} <span className="mx-0.5">の</span> {substring} <span className="mx-0.5">の部分</span>
            </Link>
            <p className="text-gray-600 mb-4">
                {createdAt}
            </p>
            <div className="flex justify-between items-center">
                {/* FavoriteButton に初期データを渡す */}
                <FavoriteButton 
                    PostId={id}
                    initialIsFavorite={initialIsFavorite}
                    initialFavoriteCount={initialFavoriteCount}
                />
            </div>
        </div>
    );
};

export default PostCard;
