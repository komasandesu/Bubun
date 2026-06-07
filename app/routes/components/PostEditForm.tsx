// app/routes/components/PostEditForm.tsx
import { Form } from 'react-router';
import { useState, useEffect } from 'react';

interface PostEditFormProps {
  postId: number;
  initialOriginalString: string;
  initialSubstring: string;
  redirectTo?: string;
}

const PostEditForm: React.FC<PostEditFormProps> = ({ postId, initialOriginalString, initialSubstring, redirectTo }) => {
    const [originalString, setOriginalString] = useState(initialOriginalString);
    const [substring, setSubstring] = useState(initialSubstring);
  
    useEffect(() => {
      setOriginalString(initialOriginalString);
      setSubstring(initialSubstring);
    }, [initialOriginalString, initialSubstring]);
  
    return (
      <Form
        action={`/resources/edit`}  // ルートを "resources.edit" に変更
        method="post"
        className="mt-4"
      >
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="redirectTo" value={redirectTo || `/posts/${postId}`} />
        <input
          type="text"
          name="originalString"
          required
          className="w-full border rounded p-2"
          placeholder="タイトルを入力..."
          value={originalString}
          onChange={(e) => setOriginalString(e.target.value)}
        />
        <textarea
          name="substring"
          rows={4}
          required
          className="w-full border rounded p-2 mt-2"
          placeholder="内容を入力..."
          value={substring}
          onChange={(e) => setSubstring(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2"
        >
          投稿を編集
        </button>
      </Form>
    );
  };
  
  export default PostEditForm;
