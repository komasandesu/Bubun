// app/components/PostForm.tsx
import React from 'react';
import SubstringForm from './SubstringForm';

const PostForm: React.FC = () => {
  return <SubstringForm action="/resources/posts" buttonText="投稿する" />;
};

export default PostForm;

