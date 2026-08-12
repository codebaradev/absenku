import { AppShell } from "./app-shell";
import { requireTeacher } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacher();
  return <AppShell>{children}</AppShell>;
}
