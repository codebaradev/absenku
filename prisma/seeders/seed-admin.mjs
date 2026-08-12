import { upsertUser, cleanup } from "./seed-lib.mjs";

const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@absenku.sch.id";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin1234";
const NIP = process.env.SEED_ADMIN_NIP || "19900101202401001";
const FULL_NAME = process.env.SEED_ADMIN_NAME || "Admin AbsenKu";

try {
  const { created } = await upsertUser({
    email: EMAIL,
    password: PASSWORD,
    nip: NIP,
    fullName: FULL_NAME,
    role: "ADMIN",
  });
  console.log(
    created
      ? `Admin dibuat: ${EMAIL} / ${PASSWORD} (NIP ${NIP})`
      : `Sudah ada: ${EMAIL} — tidak ada yang dibuat.`
  );
} catch (e) {
  console.error(e.message ?? e);
  process.exitCode = 1;
} finally {
  await cleanup();
}
