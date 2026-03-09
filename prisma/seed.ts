import "dotenv/config";
import { PrismaClient, RolUsuario } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en el archivo .env");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin12345", 10);

  await prisma.usuario.upsert({
    where: { correo: "admin@cerveceria.com" },
    update: {},
    create: {
      nombre: "Administrador",
      correo: "admin@cerveceria.com",
      passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
    },
  });

  console.log("Administrador creado correctamente");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });