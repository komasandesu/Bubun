-- 1. カラム名のリネーム（既存のお気に入りデータを保護）
ALTER TABLE "Favorite" RENAME COLUMN "PostId" TO "postId";

-- 2. 既存の外部キー制約・ユニーク制約を削除
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_PostId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_postId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_PostId_key";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_postId_key";

ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_parentId_fkey";

-- 3. ON DELETE CASCADE を付与した外部キー制約の作成
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. ユニーク制約の再作成
CREATE UNIQUE INDEX "Favorite_userId_postId_key" ON "Favorite"("userId", "postId");

-- 5. パフォーマンス向上用インデックスの追加
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_parentId_idx" ON "Post"("parentId");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Favorite_postId_idx" ON "Favorite"("postId");
