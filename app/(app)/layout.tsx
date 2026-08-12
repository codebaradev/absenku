import { AppShell } from "./app-shell";
import { requireTeacher } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireTeacher();
  return <AppShell fullName={user.fullName}>{children}</AppShell>;
}
