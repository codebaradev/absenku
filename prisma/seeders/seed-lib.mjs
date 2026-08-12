import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getDefaultSchool() {
  const school = await prisma.school.findFirst({
    select: { id: true, name: true },
  });
  if (!school) {
    throw new Error(
      "Belum ada data sekolah. Isi tabel schools dulu (npx prisma studio)."
    );
  }
  return school;
}

async function createOrReuseAuthUser(email, password) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!error) return data.user.id;

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const match = users?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!match) throw new Error(`Gagal membuat akun auth ${email}: ${error.message}`);
  // akun auth sudah ada -> paksa password ikut seeder supaya login selalu bisa
  await supabaseAdmin.auth.admin.updateUserById(match.id, { password });
  return match.id;
}

export async function upsertUser({ email, password, nip, fullName, role }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { nip }] },
    select: { id: true, email: true, role: true },
  });
  if (existing) {
    await createOrReuseAuthUser(email, password);
    return { created: false, user: existing };
  }

  const school = await getDefaultSchool();
  const uid = await createOrReuseAuthUser(email, password);
  const user = await prisma.user.create({
    data: {
      id: uid,
      nip,
      full_name: fullName,
      email,
      role,
      is_active: true,
      school_id: school.id,
    },
  });
  return { created: true, user };
}

export async function cleanup() {
  await prisma.$disconnect();
}
