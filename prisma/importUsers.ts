// scripts/importUsers.ts
import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users: { password: string; name: string; image: string }[] = [];

  // CSVファイルを読み込む
  fs.createReadStream('prisma/users.csv') // CSVファイルのパスを指定
    .pipe(csv())
    .on('data', (row) => {
      users.push(row);
    })
    .on('end', async () => {
      // 読み込んだユーザーデータをデータベースに追加
      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10); // パスワードをハッシュ化
        await prisma.user.create({
          data: {
            password: hashedPassword,
            name: user.name,
            image: user.image,
          },
        });
      }
      console.log('Users imported successfully!');
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

//$ npx node --loader ts-node/esm prisma/importUsers.ts
//$ npx prisma studio
