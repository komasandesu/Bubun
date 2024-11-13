// app/routes/components/PostDeleteButton.tsx
import { Form } from '@remix-run/react';

interface DeleteButtonProps {
    postId: number;
    redirectTo?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ postId, redirectTo }) => {
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        const confirmDelete = window.confirm("本当に削除しますか？");
        if (!confirmDelete) {
            event.preventDefault(); // 確認が取れない場合はデフォルトの動作をキャンセル
        }
    };

    return (
        <Form action={`/resources/delete`} method="post" navigate={false}>
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="redirectTo" value={redirectTo || `/posts`} />
            <button
                type="submit"
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
                削除
            </button>
        </Form>
    );
};

export default DeleteButton;
