// app/routes/components/PostForm.tsx
import { Form } from 'react-router';
import { useState } from 'react';

const PostForm: React.FC = () => {
  const [originalString, setOriginalString] = useState('');
  const [substring, setSubstring] = useState('');

  const handleSubmit = () => {
    // フォームが送信された後にタイトルとコンテンツを空にする
    setOriginalString('');
    setSubstring('');
  };

  return (
    <Form
      action={`/resources/posts`}
      method="post"
      className="mb-4 p-4 border-2 border-gray-300 rounded-lg shadow-md w-full" // フォームの枠線
      onSubmit={handleSubmit}
    >
      {/* 上段：○○の */}
      <div className="flex items-center mb-4 w-full">
        {' '}
        {/* 枠線だけ残す */}
        <textarea
          name="originalString"
          required
          rows={1}
          className="dark:text-gray-300 border border-gray-300 rounded p-2 flex-1" // 枠線のみ
          placeholder="○○"
          value={originalString}
          onChange={(e) => setOriginalString(e.target.value)}
        />
        <span className="dark:text-gray-300 ml-2 whitespace-nowrap">の</span>
      </div>

      {/* 下段：××の部分 */}
      <div className="flex items-center mb-4 w-full">
        {' '}
        {/* 枠線だけ残す */}
        <textarea
          name="substring"
          required
          rows={1}
          className="dark:text-gray-300 border border-gray-300 rounded p-2 flex-1 resize-y" // 枠線のみ
          placeholder="××"
          value={substring}
          onChange={(e) => setSubstring(e.target.value)}
        />
        <span className="dark:text-gray-300 ml-2 whitespace-nowrap">
          の部分
        </span>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-4"
      >
        投稿する
      </button>
    </Form>
  );
};

export default PostForm;
