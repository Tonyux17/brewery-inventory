import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const motivoAnulacion = String(body.motivoAnulacion || "").trim();

    if (!motivoAnulacion) {
      return NextResponse.json(
        { error: "El motivo de anulación es obligatorio" },
        { status: 400 }
      );
    }

    const movimiento = await prisma.movimientoInventario.findUnique({
      where: { id },
    });

    if (!movimiento) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      );
    }

    if (movimiento.estado === "ANULADO") {
      return NextResponse.json(
        { error: "El movimiento ya está anulado" },
        { status: 409 }
      );
    }

    const ultimoMovimientoActivo = await prisma.movimientoInventario.findFirst({
      where: {
        productoId: movimiento.productoId,
        estado: "ACTIVO",
      },
      orderBy: [{ creadoEn: "desc" }, { id: "desc" }],
    });

    if (!ultimoMovimientoActivo || ultimoMovimientoActivo.id !== movimiento.id) {
      return NextResponse.json(
        {
          error:
            "Solo se puede anular el último movimiento activo del producto para mantener la consistencia del stock",
        },
        { status: 409 }
      );
    }

    const resultado = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.producto.update({
          where: { id: movimiento.productoId },
          data: {
            stock: movimiento.stockAnterior,
          },
        });

        const movimientoAnulado = await tx.movimientoInventario.update({
          where: { id: movimiento.id },
          data: {
            estado: "ANULADO",
            anuladoEn: new Date(),
            motivoAnulacion,
          },
        });

        return movimientoAnulado;
      }
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al anular movimiento:", error);

    return NextResponse.json(
      { error: "No se pudo anular el movimiento" },
      { status: 500 }
    );
  }
}