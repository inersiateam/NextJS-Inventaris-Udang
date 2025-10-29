import { PrismaClient, Jabatan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const saltABL = await bcrypt.genSalt(12);
  const hashedABL = await bcrypt.hash("123456", saltABL);

  const saltATM = await bcrypt.genSalt(12);
  const hashedATM = await bcrypt.hash("123456", saltATM);

  await prisma.admin.createMany({
    data: [
      {
        username: "abl",
        password: hashedABL,
        jabatan: Jabatan.ABL,
      },
      {
        username: "atm",
        password: hashedATM,
        jabatan: Jabatan.ATM,
      },
    ],
    skipDuplicates: true,
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
