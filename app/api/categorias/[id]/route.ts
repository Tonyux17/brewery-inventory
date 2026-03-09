import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(categoria);
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener la categoría" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { nombre, descripcion } = body;

    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const categoriaActual = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoriaActual) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const categoriaConMismoNombre = await prisma.categoria.findFirst({
      where: {
        nombre: nombre.trim(),
        NOT: {
          id,
        },
      },
    });

    if (categoriaConMismoNombre) {
      return NextResponse.json(
        { error: "Ya existe otra categoría con ese nombre" },
        { status: 409 }
      );
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      },
    });

    return NextResponse.json(categoriaActualizada);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la categoría" },
      { status: 500 }
    );
  }
}