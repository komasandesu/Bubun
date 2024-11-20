// app/routes/posts._index.tsx
import { Post } from '.prisma/client';
import { json, SerializeFrom, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';
import { favoriteRepository } from '../models/favorite.server'; // お気に入りのリポジトリをインポート

import PostCard from './components/PostCard';
import PostForm from './components/PostForm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const lastId = url.searchParams.get('lastId');
  const parsedLastId = lastId !== null ? parseInt(lastId, 10) : undefined;
  const limit = 20;

  const posts = await postRepository.findInfiniteScrollWithoutReplies(limit, parsedLastId);
  const user = await getAuthenticatedUserOrNull(request);

  // userがnullの場合には、userIdにnullを渡す
  const postsWithFavoriteData = (await favoriteRepository.postsWithFavoriteData(posts, user?.id || null)).map(post => ({
    ...post,
    createdAt: new Date(post.createdAt).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  }));
  
  const hasNextPage = posts.length === limit;
  return json({ posts: postsWithFavoriteData, hasNextPage });
};

type PostType = SerializeFrom<Post> & {
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
};

export default function PostIndex() {
  const { posts: initialPosts, hasNextPage: initialHasNextPage } = useLoaderData<{ posts: PostType[], hasNextPage: boolean }>();
  const [posts, setPosts] = useState(initialPosts);
  const [lastId, setLastId] = useState<number | null>(initialPosts[initialPosts.length - 1]?.id || null);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const observerRef = useRef<HTMLDivElement>(null);
  const [loadingDelay, setLoadingDelay] = useState(false);

  const loadMorePosts = useCallback(async () => {
    if (!hasNextPage || loading || loadingDelay) return;

    setLoading(true);
    setLoadingDelay(true);

    try {
      const query = lastId !== null ? `&lastId=${encodeURIComponent(lastId)}` : '';
      const res = await fetch(`/posts?_data=routes/posts._index${query}`);
      
      if (!res.ok) {
        throw new Error('読み込みに失敗しました。');
      }

      const data = await res.json();

      if (data.posts.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setLastId(data.posts[data.posts.length - 1]?.id || null);
        setHasNextPage(data.hasNextPage);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingDelay(false);
      }, 1000);
    }
  }, [hasNextPage, loading, loadingDelay, lastId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasNextPage && entry.intersectionRatio > 0.95) {
        loadMorePosts();
      }
    }, { threshold: 0.95 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasNextPage, loadMorePosts]);

  return (
    <div className="container mx-auto p-4">
      <PostForm />
      <div className="flex flex-col space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            id={post.id}
            parentId={post.parentId}
            originalString={post.originalString}
            substring={post.substring}
            createdAt={post.createdAt}
            initialIsFavorite={post.initialIsFavorite} // 初期のお気に入り状態
            initialFavoriteCount={post.initialFavoriteCount} // 初期のお気に入り数
          />
        ))}
      </div>
      <div ref={observerRef} className="loading-spinner">
        {loading && hasNextPage && <p>Loading...</p>}
      </div>
    </div>
  );
}
