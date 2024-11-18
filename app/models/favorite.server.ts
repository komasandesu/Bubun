// app/models/favorite.server.ts
import { PrismaClient } from '@prisma/client';
import { Favorite, Post } from '.prisma/client';

const prisma = new PrismaClient();

class FavoriteRepository {
  // お気に入り追加
  async addFavorite(params: { PostId: number; userId: string }) {
    const { PostId, userId } = params;
    return prisma.favorite.create({
      data: {
        PostId,
        userId,
      },
    });
  }

  // お気に入り削除
  async removeFavorite(params: { PostId: number; userId: string }) {
    const { PostId, userId } = params;
    return prisma.favorite.deleteMany({
      where: {
        PostId,
        userId,
      },
    });
  }

  // 特定ユーザーのお気に入り投稿を取得
  async findFavoritesByUser(userId: string): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        post: true, // 投稿情報を含めて取得
      },
    });
  }

  // 特定投稿のお気に入り情報を取得
  async findFavoritesByPost(PostId: number): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: {
        PostId,
      },
      include: {
        user: true, // ユーザー情報を含めて取得
      },
    });
  }

  // お気に入りの切り替え
  async toggleFavorite(params: { PostId: number; userId: string }): Promise<{ added: boolean }> {
    const { PostId, userId } = params;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_PostId: {
          userId,
          PostId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return { added: false };
    } else {
      await prisma.favorite.create({
        data: {
          PostId,
          userId,
        },
      });
      return { added: true };
    }
  }

  // お気に入りの状態を確認
  async isFavorite(params: { PostId: number; userId: string | null }): Promise<boolean> {
    const { PostId, userId } = params;
    if (!userId) {
      return false; // userId がない場合、フォールバックとしてお気に入りではないと見なす
    }
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_PostId: {
          userId,
          PostId,
        },
      },
    });
    return !!favorite;
  }

  // 特定の投稿のお気に入り数を取得
  async countFavorites(PostId: number): Promise<number> {
    return prisma.favorite.count({
      where: {
        PostId,
      },
    });
  }

  // 特定の投稿リストに対して、お気に入りの状態とカウントを含めたデータを取得
  async postsWithFavoriteData(posts: Post[], userId: string | null) {
    const postIds = posts.map((post) => post.id);
  
    // userId が null の場合、favoriteStatuses と favoriteCounts を空の配列として扱う
    const favoriteStatuses = userId ? await prisma.favorite.findMany({
      where: {
        PostId: { in: postIds },
        userId,
      },
      select: {
        PostId: true,
      },
    }) : [];
  
    const favoriteCounts = await prisma.favorite.groupBy({
      by: ['PostId'],
      _count: true,
      where: {
        PostId: { in: postIds },
      },
    });
  
    return posts.map((post) => {
      const isFavorite = userId ? favoriteStatuses.some((favorite) => favorite.PostId === post.id) : false;
      const favoriteCount = favoriteCounts.find((count) => count.PostId === post.id)?._count || 0;
  
      return {
        ...post,
        initialIsFavorite: isFavorite,
        initialFavoriteCount: favoriteCount,
      };
    });
  }
  
}

const favoriteRepository = new FavoriteRepository();
export { favoriteRepository };
