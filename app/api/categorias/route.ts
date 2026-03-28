import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirInactivas = searchParams.get("incluirInactivas") === "true";

    const categorias = await prisma.categoria.findMany({
      where: incluirInactivas ? {} : { activo: true },
      orderBy: {
        creadoEn: "desc",
      },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener las categorías" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const descripcion = body.descripcion ? String(body.descripcion).trim() : null;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const existente = await prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: nombre,
          mode: "insensitive",
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        descripcion,
        activo: true,
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);

    return NextResponse.json(
      { error: "No se pudo crear la categoría" },
      { status: 500 }
    );
  }
}