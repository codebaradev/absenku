import { upsertUser, cleanup } from "./seed-lib.mjs";

const PASSWORD = process.env.SEED_PRINCIPAL_PASSWORD || "Kepsek1234";

const PRINCIPALS = [
  { nip: "197001011990011001", full_name: "Dr. H. Ahmad Wijaya, M.Pd.", email: "kepala.sekolah@absenku.sch.id" },
];

try {
  for (const p of PRINCIPALS) {
    const { created } = await upsertUser({
      email: p.email,
      password: PASSWORD,
      nip: p.nip,
      fullName: p.full_name,
      role: "KEPALA_SEKOLAH",
    });
    console.log(
      created ? `Kepala sekolah dibuat: ${p.email} / ${PASSWORD}` : `Lewat: ${p.email} (sudah ada)`
    );
  }
} catch (e) {
  console.error(e.message ?? e);
  process.exitCode = 1;
} finally {
  await cleanup();
}
