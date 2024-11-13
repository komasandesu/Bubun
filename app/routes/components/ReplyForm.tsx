// app/routes/components/ReplyForm.tsx
import { Form } from '@remix-run/react';
import { useState } from 'react';

interface ReplyFormProps {
  postId: number;
  redirectTo?: string;
  onClose?: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ postId, redirectTo, onClose }) => {
  const [originalString, setOriginalString] = useState('');
  const [substring, setSubstring] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // フォームが送信された後にタイトルとコンテンツを空にする
    setOriginalString('');
    setSubstring('');
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form
        action={`/resources/replies`}
        method="post"
        className="mb-4 p-4 border-2 border-gray-300 rounded-lg shadow-md w-full"  // フォームの枠線
        onSubmit={handleSubmit}
    >
      {/* 上段：○○の */}
      <div className="flex items-center mb-2 w-full">
          <textarea
              name="originalString"
              required
              rows={1}
              className="border rounded p-2 flex-1"  // flex-1 で入力欄の幅を広げる
              placeholder="○○"
              value={originalString}
              onChange={(e) => setOriginalString(e.target.value)}
          />
          <span className="text-gray-500 ml-2">の</span>
      </div>

      {/* 下段：××の部分 */}
      <div className="flex items-center mb-2 w-full">
          <textarea
              name="substring"
              required
              rows={1}
              className="border rounded p-2 flex-1 resize-y"
              placeholder="××"
              value={substring}
              onChange={(e) => setSubstring(e.target.value)}
          />
          <span className="text-gray-500 ml-2 whitespace-nowrap">の部分</span>
      </div>

      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="redirectTo" value={redirectTo || `/posts/${postId}`} />
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2"
      >
        リプライを送信
      </button>
    </Form>
  );
};

export default ReplyForm;
