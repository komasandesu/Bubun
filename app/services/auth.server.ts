// app/services/auth.server.ts
import { redirect } from '@remix-run/node';
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { PrismaClient } from "@prisma/client"; // Prisma クライアントを使ってログインする
import { User } from ".prisma/client";


import { FormStrategy } from "remix-auth-form"; // フォーム戦略のインポート

const prisma = new PrismaClient(); // Prisma クライアントのインスタンスを作成

import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function login(name: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { name } });

  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
}

// 新しいパスワードを設定する関数を追加
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

// Authenticator インスタンスの作成、ジェネリックには User 型を指定
export const authenticator = new Authenticator<User | null>();

// FormStrategy を使って、フォーム認証をセットアップ
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const name = form.get("name") as string;
    const password = form.get("password") as string;

    if (!name || !password) {
      throw new Error("Name and password are required");
    }

    const user = await login(name, password);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    return user;
  }),
  "user-pass" // ストラテジーの名前を指定
);


// ユーザーIDから最新のユーザー情報を取得
async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

// 共通認証処理の関数を追加
export async function requireAuthenticatedUser(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const userInSession = session.get("user");

  if (!userInSession) {
    throw redirect("/login");
  }

  // ユーザーIDを元に最新のユーザー情報を取得
  const updatedUser = await getUserById(userInSession.id);

  // もしDBからユーザーが消えてたら、セッションを破棄してログイン画面へ
  if (!updatedUser) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  }

  // セッションに最新のユーザー情報をセット
  session.set("user", updatedUser);

  // 最新のユーザー情報と、更新したセッションを両方返す
  return { user: updatedUser, session };
}

// ユーザー情報が存在しない場合は最新情報を取得してセッションを更新
export async function getAuthenticatedUserOrNull(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const userInSession = session.get("user");

  // セッションにユーザーがいなかったら、user: null と session を返す
  if (!userInSession) {
    return { user: null, session };
  }

  // セッションにユーザーがいたら、DBの最新情報をチェック！
  const user = await getUserById(userInSession.id);

  // DBからユーザーが消えていたら、不正なセッションなのでログアウトさせる
  if (!user) {
    throw redirect("/login", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    });
  }

  // 最新のユーザー情報をセッションにセット
  session.set("user", user);

  // 最新のユーザー情報と、更新したセッションを両方返す
  return { user, session };
}