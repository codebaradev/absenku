import { prisma } from "@/lib/prisma";
(async () => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log(JSON.stringify(users, null, 1));
})();
