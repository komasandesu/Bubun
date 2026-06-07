// app/routes/components/PostCard.tsx
import { Link } from "react-router";
import FavoriteButton from '~/routes/components/FavoriteButton';

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
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 dark:bg-gray-800 dark:shadow-none dark:border-gray-700 dark:text-white">
            <Link
                to={`/posts/${id}`}
                className="block text-xl font-medium text-gray-800 hover:underline mb-2 truncate dark:text-gray-200"
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
            <p className="text-gray-600 mb-4 dark:text-gray-400">
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