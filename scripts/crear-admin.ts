import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const correo = "admin@cerveceria.com";
  const passwordPlano = "Admin12345";
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  const existente = await prisma.usuario.findUnique({
    where: { correo },
  });

  if (existente) {
    const usuarioActualizado = await prisma.usuario.update({
      where: { correo },
      data: {
        nombre: "Administrador",
        passwordHash,
      },
    });

    console.log("Usuario existente actualizado correctamente:");
    console.log({
      id: usuarioActualizado.id,
      correo: usuarioActualizado.correo,
      password: passwordPlano,
    });
    return;
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      correo,
      passwordHash,
      rol: "ALMACENISTA",
    },
  });

  console.log("Usuario creado correctamente:");
  console.log({
    id: usuario.id,
    correo: usuario.correo,
    password: passwordPlano,
  });
}

main()
  .catch((error) => {
    console.error("Error al crear/actualizar usuario:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });