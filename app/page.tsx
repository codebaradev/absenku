import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import LoginPage from "@/app/login/page";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return <LoginPage />;
}
