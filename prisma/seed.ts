import { PrismaClient, Jabatan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash("123456", saltRounds);

  await prisma.admin.upsert({
    where: { username: "abl" },
    update: { password: hashedPassword },
    create: {
      username: "abl",
      password: hashedPassword,
      jabatan: Jabatan.ABL,
    },
  });

  await prisma.admin.upsert({
    where: { username: "atm" },
    update: { password: hashedPassword },
    create: {
      username: "atm",
      password: hashedPassword,
      jabatan: Jabatan.ATM,
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
