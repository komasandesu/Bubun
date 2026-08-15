// app/models/favorite.server.ts
import { prisma } from '~/models/db.server';
import type { Favorite, Post } from '@prisma/client';

class FavoriteRepository {
  // お気に入り追加
  async addFavorite(params: { postId: number; userId: string }) {
    const { postId, userId } = params;
    return prisma.favorite.create({
      data: {
        postId,
        userId,
      },
    });
  }

  // お気に入り削除
  async removeFavorite(params: { postId: number; userId: string }) {
    const { postId, userId } = params;
    return prisma.favorite.deleteMany({
      where: {
        postId,
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
  async findFavoritesByPost(postId: number): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: {
        postId,
      },
      include: {
        user: true, // ユーザー情報を含めて取得
      },
    });
  }

  // お気に入りの切り替え
  async toggleFavorite(params: {
    postId: number;
    userId: string;
  }): Promise<{ added: boolean }> {
    const { postId, userId } = params;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
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
          postId,
          userId,
        },
      });
      return { added: true };
    }
  }

  // お気に入りの状態を確認
  async isFavorite(params: {
    postId: number;
    userId: string | null;
  }): Promise<boolean> {
    const { postId, userId } = params;
    if (!userId) {
      return false; // userId がない場合、フォールバックとしてお気に入りではないと見なす
    }
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return !!favorite;
  }

  // 特定の投稿のお気に入り数を取得
  async countFavorites(postId: number): Promise<number> {
    return prisma.favorite.count({
      where: {
        postId,
      },
    });
  }

  // 特定の投稿リストに対して、お気に入りの状態とカウントを含めたデータを取得
  async postsWithFavoriteData(posts: Post[], userId: string | null) {
    const postIds = posts.map((post) => post.id);

    // userId が null の場合、favoriteStatuses と favoriteCounts を空の配列として扱う
    const favoriteStatuses = userId
      ? await prisma.favorite.findMany({
          where: {
            postId: { in: postIds },
            userId,
          },
          select: {
            postId: true,
          },
        })
      : [];

    const favoriteCounts = await prisma.favorite.groupBy({
      by: ['postId'],
      _count: true,
      where: {
        postId: { in: postIds },
      },
    });

    return posts.map((post) => {
      const isFavorite = userId
        ? favoriteStatuses.some((favorite) => favorite.postId === post.id)
        : false;
      const favoriteCount =
        favoriteCounts.find((count) => count.postId === post.id)?._count || 0;

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
