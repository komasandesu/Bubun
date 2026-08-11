// app/components/ReplyForm.tsx
import React from 'react';
import SubstringForm from './SubstringForm';

interface ReplyFormProps {
  postId: number;
  redirectTo?: string;
  onClose?: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  postId,
  redirectTo,
  onClose,
}) => {
  return (
    <SubstringForm
      action="/resources/replies"
      buttonText="リプライを送信"
      postId={postId}
      redirectTo={redirectTo || `/posts/${postId}`}
      onSuccess={onClose}
    />
  );
};

export default ReplyForm;

