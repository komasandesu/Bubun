import PostForm from './components/PostForm';

export default function PostNew() {
  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">ポスト新規作成</h1>
      <PostForm />
    </div>
  );
}