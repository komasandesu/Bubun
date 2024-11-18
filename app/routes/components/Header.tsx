import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

const Header: React.FC<{ path: string; title: string; username: string | null }> = ({ path, title, username }) => {
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // メニューの表示状態を管理
  const navigate = useNavigate(); // リダイレクト処理で使用

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!username) {
      e.preventDefault(); // デフォルトのリンク動作を無効化
      navigate("/login"); // ログインページにリダイレクト
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 mb-6 flex items-center justify-between bg-white dark:bg-slate-900 shadow-lg z-10 p-4 border-b-2 border-gray-300 dark:border-gray-700 text-black dark:text-white">
      <Link to="/posts/new" className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400">
        投稿する
      </Link>
      <Link to={`/${path}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400">
        <h1 className="text-2xl font-bold">{title}</h1>
      </Link>

      {/* ハンバーガーメニュー */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)} // メニューのトグル
          className="text-black dark:text-white focus:outline-none"
        >
          {/* ハンバーガーアイコン */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* メニューの内容 */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-300 dark:border-gray-700">
            <form onSubmit={handleSearchSubmit} className="p-2 flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="検索..."
                className="border border-gray-300 dark:border-gray-600 rounded py-1 px-2 flex-grow max-w-xs"
                style={{ width: "150px" }}
              />
              <button type="submit" className="flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded ml-2 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 2a9 9 0 100 18 9 9 0 000-18zm0 16a7 7 0 100-14 7 7 0 000 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </form>
            <Link
              to={`/profile/${username ?? ""}`}
              onClick={handleProfileClick} // ログイン確認処理を実行
              className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 p-2"
            >
              プロフィール
            </Link>
            <Link to="/" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 p-2">
              スタート
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
