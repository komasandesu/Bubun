import React, { useState } from 'react';
import { Form } from 'react-router';

interface SubstringFormProps {
  action: string;
  buttonText: string;
  postId?: number;
  redirectTo?: string;
  onSuccess?: () => void;
  initialOriginalString?: string;
  initialSubstring?: string;
  className?: string;
}

const SubstringForm: React.FC<SubstringFormProps> = ({
  action,
  buttonText,
  postId,
  redirectTo,
  onSuccess,
  initialOriginalString = '',
  initialSubstring = '',
  className = 'mb-4 p-4 border-2 border-gray-300 rounded-lg shadow-md w-full',
}) => {
  const [originalString, setOriginalString] = useState(initialOriginalString);
  const [substring, setSubstring] = useState(initialSubstring);

  const handleSubmit = () => {
    setOriginalString('');
    setSubstring('');
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form
      action={action}
      method="post"
      className={className}
      onSubmit={handleSubmit}
    >
      {/* 上段：○○の */}
      <div className="flex items-center mb-4 w-full">
        <textarea
          name="originalString"
          required
          rows={1}
          className="dark:text-gray-300 border border-gray-300 rounded p-2 flex-1"
          placeholder="○○"
          value={originalString}
          onChange={(e) => setOriginalString(e.target.value)}
        />
        <span className="dark:text-gray-300 ml-2 whitespace-nowrap">の</span>
      </div>

      {/* 下段：××の部分 */}
      <div className="flex items-center mb-4 w-full">
        <textarea
          name="substring"
          required
          rows={1}
          className="dark:text-gray-300 border border-gray-300 rounded p-2 flex-1 resize-y"
          placeholder="××"
          value={substring}
          onChange={(e) => setSubstring(e.target.value)}
        />
        <span className="dark:text-gray-300 ml-2 whitespace-nowrap">
          の部分
        </span>
      </div>

      {postId !== undefined && (
        <input type="hidden" name="postId" value={postId} />
      )}
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2"
      >
        {buttonText}
      </button>
    </Form>
  );
};

export default SubstringForm;
