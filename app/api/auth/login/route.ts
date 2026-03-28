import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearToken, guardarSesion } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const correo = String(body.correo || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!correo || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { error: "Usuario desactivado" },
        { status: 403 }
      );
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await crearToken({
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
    });

    await guardarSesion(token);

    return NextResponse.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}