const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, emailLower: true } });
  for (const u of users) {
    const lower = (u.email ?? "").trim().toLowerCase() || null;
    if (lower !== u.emailLower) {
      await prisma.user.update({ where: { id: u.id }, data: { emailLower: lower } });
    }
  }
  console.log(`Backfilled ${users.length} users.`);
  await prisma.$disconnect();
})();
