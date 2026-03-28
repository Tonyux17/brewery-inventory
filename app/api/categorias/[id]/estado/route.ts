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

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        productos: {
          where: { activo: true },
          select: {
            id: true,
          },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    if (!activo && categoria.productos.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar la categoría porque tiene productos activos asociados",
        },
        { status: 409 }
      );
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: { activo },
    });

    return NextResponse.json(categoriaActualizada);
  } catch (error) {
    console.error("Error al cambiar estado de categoría:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el estado de la categoría" },
      { status: 500 }
    );
  }
}