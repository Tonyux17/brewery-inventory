import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nombre = String(body.nombre || "").trim();
    const correo = String(body.correo || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!nombre || !correo || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const totalUsuarios = await prisma.usuario.count();

    if (totalUsuarios > 0) {
      return NextResponse.json(
        { error: "El registro público ya no está disponible" },
        { status: 403 }
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        passwordHash,
        rol: "ADMINISTRADOR",
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        activo: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        usuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return NextResponse.json(
      { error: "No se pudo registrar el usuario" },
      { status: 500 }
    );
  }
}