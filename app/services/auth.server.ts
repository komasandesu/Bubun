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
export let authenticator = new Authenticator<User | null>();

// FormStrategy を使って、フォーム認証をセットアップ
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let name = form.get("name") as string;
    let password = form.get("password") as string;

    if (!name || !password) {
      throw new Error("Name and password are required");
    }

    let user = await login(name, password);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    return user;
  }),
  "user-pass" // ストラテジーの名前を指定
);


// 共通認証処理の関数を追加
export async function requireAuthenticatedUser(request: Request) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");

  // ユーザーがセッションに保存されていない場合、ログイン画面にリダイレクト
  if (!user) {
    throw redirect("/login");
  }

  // セッションからユーザー情報を最新のものに更新
  const userName = session.get("userName");
  if (userName) {
    user.name = userName; // ユーザー名が変更されている場合に更新
  }

  return user;
}

export async function getAuthenticatedUserOrNull(request: Request): Promise<User | null> {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");

  // ユーザーがセッションに保存されていない場合、null を返す
  if (!user) {
    return null; // ユーザーが認証されていない場合は null を返す
  }

  // セッションから最新のユーザー名を取得して、ユーザー情報を更新
  const userName = session.get("userName");
  if (userName) {
    user.name = userName; // ユーザー名が変更されている場合に更新
  }

  return user;
}