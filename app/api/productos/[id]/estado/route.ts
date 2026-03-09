import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { activo } = body;

    if (typeof activo !== "boolean") {
      return NextResponse.json(
        { error: "El campo activo es obligatorio" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: { activo },
    });

    return NextResponse.json(productoActualizado);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el estado del producto" },
      { status: 500 }
    );
  }
}