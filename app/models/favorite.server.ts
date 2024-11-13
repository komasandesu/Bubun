// app/models/favorite.server.ts
import { PrismaClient } from '@prisma/client';
import { Favorite } from '.prisma/client';

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
  async isFavorite(params: { PostId: number; userId: string }): Promise<boolean> {
    const { PostId, userId } = params;
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
  
}

const favoriteRepository = new FavoriteRepository();
export { favoriteRepository };
