import { upsertUser, cleanup } from "./seed-lib.mjs";

const PASSWORD = process.env.SEED_TEACHER_PASSWORD || "Guru1234";

const TEACHERS = [
  { nip: "198011012009011002", full_name: "Dewi Lestari, S.Pd.", email: "dewi.lestari@absenku.sch.id" },
  { nip: "198502152010012001", full_name: "Budi Santoso, S.Pd.", email: "budi.santoso@absenku.sch.id" },
  { nip: "197802102005011003", full_name: "Sri Rahayu, M.Pd.", email: "sri.rahayu@absenku.sch.id" },
  { nip: "199105202015041001", full_name: "Rizky Pratama, S.Kom.", email: "rizky.pratama@absenku.sch.id" },
  { nip: "198707142011012004", full_name: "Nur Aini, S.E.", email: "nur.aini@absenku.sch.id" },
];

try {
  for (const t of TEACHERS) {
    const { created } = await upsertUser({
      email: t.email,
      password: PASSWORD,
      nip: t.nip,
      fullName: t.full_name,
      role: "TEACHER",
    });
    console.log(
      created ? `Guru dibuat: ${t.email} / ${PASSWORD}` : `Lewat: ${t.email} (sudah ada)`
    );
  }
} catch (e) {
  console.error(e.message ?? e);
  process.exitCode = 1;
} finally {
  await cleanup();
}
