/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{ts,tsx}', // Remixのappディレクトリ内のファイルを対象に
    './app/routes/**/*.tsx', // routesディレクトリ内のtsxファイルを対象に
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'], // Noto Sansをデフォルトのフォントに設定
      },
    },
  },
  plugins: [],
};
