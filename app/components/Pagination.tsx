import { Link } from 'react-router';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  queryParamName?: string;
  extraQueryParams?: Record<string, string>;
  getLinkUrl?: (page: number) => string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl = '',
  queryParamName = 'page',
  extraQueryParams = {},
  getLinkUrl,
}) => {
  if (totalPages <= 1) return null;

  const buildUrl = (pageNumber: number) => {
    if (getLinkUrl) {
      return getLinkUrl(pageNumber);
    }
    const params = new URLSearchParams();
    Object.entries(extraQueryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, val);
      }
    });
    params.set(queryParamName, pageNumber.toString());
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl || '?page=1';
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {currentPage > 1 && (
        <Link
          to={buildUrl(1)}
          className={`px-4 py-2 border rounded ${
            currentPage === 1
              ? 'bg-blue-500 text-white dark:bg-blue-600'
              : 'bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400'
          }`}
        >
          1
        </Link>
      )}

      {currentPage > 3 && <span className="px-2 dark:text-white">…</span>}

      {currentPage > 2 && (
        <Link
          to={buildUrl(currentPage - 1)}
          className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400"
        >
          {currentPage - 1}
        </Link>
      )}

      <span className="px-4 py-2 border rounded bg-blue-500 text-white dark:bg-blue-600 font-semibold">
        {currentPage}
      </span>

      {currentPage < totalPages && (
        <Link
          to={buildUrl(currentPage + 1)}
          className="px-4 py-2 border rounded bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400"
        >
          {currentPage + 1}
        </Link>
      )}

      {currentPage < totalPages - 2 && (
        <span className="px-2 dark:text-white">…</span>
      )}

      {currentPage < totalPages - 1 && (
        <Link
          to={buildUrl(totalPages)}
          className={`px-4 py-2 border rounded ${
            currentPage === totalPages
              ? 'bg-blue-500 text-white dark:bg-blue-600'
              : 'bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-400'
          }`}
        >
          {totalPages}
        </Link>
      )}
    </div>
  );
};

export default Pagination;
