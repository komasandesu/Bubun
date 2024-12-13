// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap",
  },
  // faviconの設定
  {
    rel: "icon",
    href: "/favicon.ico", // publicディレクトリに配置したfaviconのパス
    type: "image/x-icon",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "bubutter" },
    { name: 'description', content: '部分ったー - 部分を投稿して共有するプラットフォームです。' },
    { property: 'og:description', content: '部分を投稿して共有するプラットフォームです。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'bubutter' },
    { property: 'og:url', content: 'https://bubutter.at-math.com/' },
    { property: 'og:image', content: 'https://bubutter.at-math.com/og-image.png' },
  ];
};


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
      <div>
        <Outlet /> {/* ページごとのコンテンツがここにレンダリングされる */}
      </div>
  );
}
