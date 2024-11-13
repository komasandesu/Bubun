// app/routes/logout.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  // ログアウト処理
  await authenticator.logout(request, { redirectTo: "/login" });
}
