import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@winmart.com" },
    update: {},
    create: {
      name: "Store Manager",
      email: "manager@winmart.com",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  console.log("Seeded user:", manager);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });