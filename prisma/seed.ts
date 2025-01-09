import { prisma } from "./app"; // Adjust the import path as needed
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Check if an admin user already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: "admin" },
  });

  // If the admin doesn't exist, create it
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
      },
    });

    console.log("Admin user created!");
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error("Error creating admin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
