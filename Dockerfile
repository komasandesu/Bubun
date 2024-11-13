FROM node:22-alpine

# 作業ディレクトリを設定
WORKDIR /app


# ルートディレクトリから package.json と package-lock.json をコンテナにコピー
# COPY ./package*.json /app/

# アプリケーションのソースコードをすべてコピー
# COPY . /app
COPY . .



# npm install で依存関係をインストール
# RUN npm install
RUN yarn install



# RUN npx prisma generate
RUN npx prisma generate


# ポートを公開
EXPOSE 5173

# アプリケーションを起動時にデータベースを同期してからアプリを起動
CMD ["sh", "-c", "npx prisma db push && yarn dev"]


# アプリケーションを起動
# CMD ["npm", "run", "dev"]

# 起動したら docker exec -it [コンテナ名] sh
# 以下を実行
# npx prisma db push