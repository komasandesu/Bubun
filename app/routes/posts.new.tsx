//app/routes/posts.new.tsx
import { useLocation } from '@remix-run/react';
import PostForm from './components/PostForm';

export default function PostNew() {
  // クエリパラメータからエラーメッセージを取得
  const location = useLocation();
  const errorType = new URLSearchParams(location.search).get('error');
  let errorMessage = '';

  switch (errorType) {
    case 'missingFields':
      errorMessage = 'タイトルと内容の両方が必要です。';
      break;
    case 'tooLong':
      errorMessage = 'タイトルまたは内容は 200 文字未満である必要があります。';
      break;
    default:
      errorMessage = '';
  }
  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="dark:text-gray-500 text-2xl font-bold mb-4">ポスト新規作成</h1>
      {/* エラーメッセージの表示 */}
      {errorMessage && (
        <div className="error-message" style={{ color: 'red' }}>
          {errorMessage}
        </div>
      )}
      <PostForm />
    </div>
  );
}