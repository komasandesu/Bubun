# データベース構造改善 移行計画書 (Bubun / Supabase + Prisma)

本ドキュメントは、現在運用中の Supabase PostgreSQL データベースに対して、データの整合性・安全性・パフォーマンスを向上させるための移行（マイグレーション）手順書です。

---

## 1. 移行概要と目的

### 目的
1. **データ整合性の自動化**: `onDelete: Cascade` による削除時不整合の解消とコード簡略化
2. **パフォーマンス向上**: 投稿・リプライ・お気に入りクエリに対する適切なインデックスの追加
3. **命名規則の統一**: `Favorite.PostId` などのブレを解消し、TypeScript 開発体験と可読性を向上
4. **ゼロデータロス / 最小ダウンタイム**: 本番稼働中データの安全な保護

---

## 2. 変更スコープとリスク評価

| 変更項目 | 対象 | リスク | 対策 |
| :--- | :--- | :--- | :--- |
| **インデックス追加** | `Post(authorId, parentId, createdAt)`, `Favorite(postId)` | 🟢 低 | ロック時間の短い安全なインデックス作成 |
| **カスケード削除 (`onDelete: Cascade`)** | `Post` ⇄ `User`, `Post` ⇄ `Post(parent)`, `Favorite` ⇄ `User/Post` | 🟡 中 | 外部キー制約の張り替えのみ。既存データは残存 |
| **リレーション名変更** | `Post.Favorite` → `favorites`, `User.Favorite` → `favorites` | 🟢 低 (DB変更なし) | PrismaクライアントおよびTypeScriptコード側のみの修正 |
| **カラム名変更** | `Favorite.PostId` → `postId` | 🔴 高 | `DROP & ADD` ではなく **`ALTER TABLE ... RENAME COLUMN`** を明示的に使用 |
| **主キーの整理 (任意)** | `Favorite.id` 削除 → `@@id([userId, postId])` | 🟡 中 | 重複のない複合主キーへ安全に切り替え |

---

## 3. 事前準備 (Phase 0: バックアップ)

マイグレーション実行前に、必ず手元に完全なダンプデータを取得します。

### バックアップコマンド例 (`pg_dump`)
```bash
# 日時付きでバックアップを取得
pg_dump "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres" -f backup_bubun_$(date +%Y%m%d_%H%M%S).sql
```

> [!IMPORTANT]
> バックアップファイルが正常に生成され、ファイルサイズが0でないことを確認してください。

---

## 4. 移行実行ステップ (Step-by-Step)

```mermaid
flowchart TD
    A[Step 0: DBバックアップ] --> B[Step 1: schema.prisma 修正]
    B --> C[Step 2: migrate --create-only でSQL生成]
    C --> D[Step 3: migration.sql の安全確認・修正]
    D --> E[Step 4: TypeScriptコードの修正 & ビルドテスト]
    E --> F[Step 5: Supabaseへ migrate deploy]
    F --> G[Step 6: アプリデプロイ & 動作確認]
```

### Step 1: `schema.prisma` の修正
`prisma/schema.prisma` を以下のように更新します。

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Supabase Direct Connection (5432ポート)
}

model User {
  id        String     @id @default(cuid())
  name      String     @unique
  password  String
  image     String?
  provider  String     @default("Credentials")
  profile   String?
  twitterId String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  posts     Post[]
  favorites Favorite[]
}

model Post {
  id             Int        @id @default(autoincrement())
  originalString String
  substring      String
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  authorId       String
  author         User       @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // リプライ（自己参照）
  parentId       Int?
  parent         Post?      @relation("PostReply", fields: [parentId], references: [id], onDelete: Cascade)
  replies        Post[]     @relation("PostReply")

  favorites      Favorite[]

  @@index([authorId])
  @@index([parentId])
  @@index([createdAt])
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    String
  postId    Int      // PostId -> postId に変更
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([postId])
}
```

---

### Step 2: マイグレーションファイルの生成（適用は保留）

```bash
npx prisma migrate dev --create-only --name improve_database_structure
```

---

### Step 3: `migration.sql` の検証と手動修正

生成された `prisma/migrations/<timestamp>_improve_database_structure/migration.sql` を確認します。

> [!CAUTION]
> **カラム名変更の注意点**
> Prisma が `DROP COLUMN "PostId"` を生成している場合、既存のお気に入りデータが消えてしまいます。
> 必ず以下のように `RENAME COLUMN` を使用する SQL に差し替えてください。

#### 修正後の理想的な `migration.sql` 例:
```sql
-- 1. カラム名のリネーム（データ保持）
ALTER TABLE "Favorite" RENAME COLUMN "PostId" TO "postId";

-- 2. 古い外部キー制約の削除
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_PostId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_parentId_fkey";

-- 3. ON DELETE CASCADE を付与した外部キー制約の再作成
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. ユニーク制約の再作成
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_PostId_key";
CREATE UNIQUE INDEX "Favorite_userId_postId_key" ON "Favorite"("userId", "postId");

-- 5. パフォーマンス用インデックスの追加
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_parentId_idx" ON "Post"("parentId");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Favorite_postId_idx" ON "Favorite"("postId");
```

---

### Step 4: アプリケーションコードの更新 & 型チェック

1. **Prisma クライアントの再生成**:
   ```bash
   npx prisma generate
   ```

2. **コード修正対象**:
   - `app/models/favorite.server.ts`: `PostId` ➔ `postId`、`include: { post: true }`
   - `app/models/post.server.ts`:
     - カスケード削除がDBレベルで動作するため、手動で行っていた `delete` 内のループクエリ（L83〜L99）を `prisma.post.delete` の1行に簡素化可能。
     - `Favorite` ➔ `favorites` へのプロパティ修正。

3. **ビルド検証**:
   ```bash
   yarn typecheck
   yarn build
   ```

---

### Step 5: Supabase（本番DB）への適用

マイグレーションファイルとコードの準備ができたら、本番DBに適用します。

```bash
# 本番の DATABASE_URL / DIRECT_URL を指定してマイグレーションを実行
npx prisma migrate deploy
```

---

### Step 6: アプリケーションのデプロイ & 動作確認

1. 新しいバージョンの Web アプリケーションをデプロイ。
2. 動作確認チェックリスト:
   - [ ] 投稿の作成・一覧表示・タイムラインソート
   - [ ] リプライの作成・一覧表示
   - [ ] お気に入りの追加・解除・一覧表示
   - [ ] 投稿削除（紐づくリプライやお気に入りが自動で安全に消えることの確認）
   - [ ] ユーザー削除時の整合性確認

---

## 5. ロールバック手順 (万が一の障害時)

マイグレーション実行後に致命的な問題が発生した場合の復元手順です。

1. **DBの復元**:
   ```bash
   psql "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres" < backup_bubun_YYYYMMDD_HHMMSS.sql
   ```
2. **アプリケーションのロールバック**:
   - 前バージョンのコミット/デプロイに切り替える。
