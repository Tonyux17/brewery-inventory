import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        creadoEn: "desc",
      },
    });

    return NextResponse.json(categorias);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener las categorías" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion } = body;

    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        nombre: nombre.trim(),
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear la categoría" },
      { status: 500 }
    );
  }
}