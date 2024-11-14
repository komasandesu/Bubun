# ベースイメージとしてNode.jsを指定
FROM node:22-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルだけをコピーして効率的にキャッシュを活用
COPY package.json yarn.lock ./

# 依存関係をインストール
RUN yarn install --production

# アプリケーションのソースコードをコピー
COPY . .

# Prismaのクライアント生成
RUN npx prisma generate

# 本番環境用にビルドを行う
RUN yarn build

# 本番環境で使用するポートを公開
EXPOSE 5173

# 本番環境での実行コマンド
CMD ["yarn", "start"]
