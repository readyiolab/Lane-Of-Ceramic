import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Drinkware", slug: "drinkware" },
      { name: "Tableware", slug: "tableware" },
      { name: "Serveware", slug: "serveware" },
      { name: "Kitchenware", slug: "kitchenware" },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
