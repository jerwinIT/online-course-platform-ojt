// prisma/seed.ts
import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");

  const categories = [
    { name: "Web Development", slug: "web-development" },
    { name: "Data Science", slug: "data-science" },
    { name: "Design", slug: "design" },
    { name: "Marketing", slug: "marketing" },
    { name: "Business", slug: "business" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {}, // do nothing if exists
      create: category,
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
