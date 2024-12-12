// app/routes/logout.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
