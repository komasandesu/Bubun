import { useCallback, useState } from 'react';
import { useFetcher } from 'react-router';

interface UseInfiniteScrollOptions<T> {
  initialItems: T[];
  initialHasNextPage: boolean;
  getItemPageUrl: (lastId: number | null) => string;
  getItemId: (item: T) => number;
}

export function useInfiniteScroll<T>({
  initialItems,
  initialHasNextPage,
  getItemPageUrl,
  getItemId,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [lastId, setLastId] = useState<number | null>(
    initialItems.length > 0
      ? getItemId(initialItems[initialItems.length - 1])
      : null
  );
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingDelay, setLoadingDelay] = useState(false);

  const fetcher = useFetcher<{ posts: T[]; hasNextPage: boolean }>();

  // fetcher.data の変更をレンダー中に同期
  const [prevFetcherData, setPrevFetcherData] = useState(fetcher.data);
  if (fetcher.data && fetcher.data !== prevFetcherData) {
    setPrevFetcherData(fetcher.data);
    if (fetcher.data.posts && fetcher.data.posts.length > 0) {
      const newItems = fetcher.data.posts;
      setItems((prevItems) => {
        const prevIds = new Set(prevItems.map((item) => getItemId(item)));
        const filtered = newItems.filter(
          (item) => !prevIds.has(getItemId(item))
        );
        return [...prevItems, ...filtered];
      });
      setLastId(getItemId(newItems[newItems.length - 1]));
      setHasNextPage(fetcher.data.hasNextPage);
    } else {
      setHasNextPage(false);
    }
  }

  const isLoading = fetcher.state !== 'idle';

  const loadMore = useCallback(() => {
    if (!hasNextPage || fetcher.state !== 'idle' || loadingDelay) return;

    setLoadingDelay(true);

    const url = getItemPageUrl(lastId);
    fetcher.load(url);

    setTimeout(() => {
      setLoadingDelay(false);
    }, 1000);
  }, [hasNextPage, fetcher, loadingDelay, lastId, getItemPageUrl]);

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (
            entry.isIntersecting &&
            hasNextPage &&
            entry.intersectionRatio > 0.95
          ) {
            loadMore();
          }
        },
        { threshold: 0.95 }
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    },
    [hasNextPage, loadMore]
  );

  return {
    items,
    hasNextPage,
    isLoading,
    observerRef,
  };
}
