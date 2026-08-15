// app/models/post.server.ts
import { prisma } from '~/models/db.server';
import type { Post } from '@prisma/client';

class PostRepository {
  async find(params: { id: number }) {
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      throw new Error(`Post with id ${params.id} not found`);
    }
    return post;
  }

  async findAll(): Promise<Post[]> {
    return prisma.post.findMany();
  }

  async create(params: {
    originalString: string;
    substring: string;
    authorId: string;
  }) {
    const { originalString, substring, authorId } = params;
    if (!originalString || !substring)
      throw new Error('OriginalString and substring are required');
    return prisma.post.create({
      data: {
        originalString,
        substring,
        authorId,
      },
    });
  }

  // リプライの作成
  async createReply(params: {
    originalString: string;
    substring: string;
    authorId: string;
    parentId: number;
  }) {
    const { originalString, substring, authorId, parentId } = params;

    if (!originalString || !substring)
      throw new Error('OriginalString and substring are required');

    // 親投稿の存在確認
    const parentPost = await prisma.post.findUnique({
      where: { id: parentId },
    });

    if (!parentPost) throw new Error('Parent post does not exist');

    // 親投稿がリプライでないことを確認（リプライの場合はparentIdが存在する）
    if (parentPost.parentId) {
      throw new Error('Replies to replies are not allowed');
    }

    return prisma.post.create({
      data: {
        originalString,
        substring,
        authorId,
        parentId,
      },
    });
  }

  async delete(params: { id: number; userId: string }) {
    // 1. 投稿を取得して作成者を確認
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });
    if (!post) {
      throw new Error('Post not found');
    }
    // 投稿の作成者と削除をリクエストしたユーザーが一致するか確認
    if (post.authorId !== params.userId) {
      throw new Error('You are not authorized to delete this post');
    }

    // ON DELETE CASCADE により、返信やお気に入りはDB側で自動的に連動削除されます
    return prisma.post.delete({
      where: { id: params.id },
    });
  }

  async update(params: {
    id: number;
    originalString: string;
    substring: string;
    userId: string;
  }) {
    const { id, originalString, substring, userId } = params;

    // 投稿者が現在のユーザーか確認
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }

    if (post.authorId !== userId) {
      throw new Error('You are not authorized to edit this post');
    }

    // 投稿のタイトルと内容を更新
    return prisma.post.update({
      where: { id },
      data: { originalString, substring },
    });
  }

  // 投稿とその著者情報を取得するメソッド
  async findWithAuthor(params: { id: number }) {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new Error(`Post with id ${params.id} not found`);
    }
    return post;
  }

  async findAllWithoutReplies() {
    const posts = await prisma.post.findMany({
      where: {
        parentId: null, // 返信ではない投稿のみを取得
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  async findPostWithAuthorAndReplies(postId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }

  async findInfiniteScrollWithoutReplies(limit: number, lastId?: number) {
    const posts = await prisma.post.findMany({
      where: {
        id: lastId ? { lt: lastId } : undefined,
      },
      orderBy: {
        id: 'desc',
      },
      take: limit,
    });

    return posts;
  }

  // プロフィール用
  async countByUserId(userId: string) {
    return prisma.post.count({
      where: {
        authorId: userId,
      },
    });
  }

  async findByUserId(userId: string, skip: number, take: number) {
    return prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  // お気に入り用
  async countFavoritesByUserId(userId: string) {
    return prisma.favorite.count({
      where: { userId },
    });
  }

  async findFavoritesByUserId(userId: string, skip: number, take: number) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      include: { post: true },
      skip,
      take,
    });
  }

  // 検索用
  async searchPosts(query: string, skip: number, take: number) {
    return prisma.post.findMany({
      where: {
        OR: [
          { originalString: { contains: query, mode: 'insensitive' } },
          { substring: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async countSearchPosts(query: string) {
    return prisma.post.count({
      where: {
        OR: [
          { originalString: { contains: query, mode: 'insensitive' } },
          { substring: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}

const postRepository = new PostRepository();
export { postRepository };
