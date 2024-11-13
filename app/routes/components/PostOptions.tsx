// app/routes/components/PostOptions.tsx
import { useState } from 'react';
import PostEditForm from './PostEditForm';
import ReplyForm from './ReplyForm';
import DeleteButton from './PostDeleteButton';

interface PostOptionsProps {
    postId: number;
    parentId: number | null;
    authorId: string; // 投稿者のID
    currentUserId: string; // 現在のユーザーのID
    originalString?: string;    // タイトルを追加
    substring?: string;  // コンテンツを追加
}

const PostOptions: React.FC<PostOptionsProps> = ({ postId, parentId, authorId, currentUserId, originalString, substring }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isReplyModalOpen, setEditReplyOpen] = useState(false);


    const toggleEditModal = () => {
        setEditModalOpen((prev) => !prev);
    };

    const toggleReplyModal = () => {
        setEditReplyOpen((prev) => !prev);
    };

    return (
        <div>
            <div className="inline-flex">
            <button 
                onClick={toggleReplyModal} 
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
                返信
            </button>
            {/* 現在のユーザーが投稿者の場合のみ編集・削除ボタンを表示 */}
            {currentUserId === authorId && (
                <>
                <button
                    onClick={toggleEditModal}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                >
                    編集
                </button>
                <DeleteButton postId={postId} />
                </>
            )}
            </div>
            {/* 編集モーダルの表示 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-md">
                        <PostEditForm 
                            postId={postId} 
                            initialOriginalString={originalString || ""} // デフォルト値を設定
                            initialSubstring={substring || ""} // デフォルト値を設定
                        />
                        <button
                            onClick={toggleEditModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
            {/* 返信モーダルの表示 */}
            {isReplyModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-md">
                        {/* 親投稿のIDがない場合は、投稿IDをそのまま使う */}
                        <ReplyForm postId={parentId || postId} onClose={toggleReplyModal} />
                        <button
                            onClick={toggleReplyModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostOptions;
