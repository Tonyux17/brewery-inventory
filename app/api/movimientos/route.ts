import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const movimientos = await prisma.movimientoInventario.findMany({
      include: {
        producto: {
          include: {
            categoria: true,
          },
        },
        usuario: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });

    return NextResponse.json(movimientos);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los movimientos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      productoId,
      tipo,
      motivo,
      cantidad,
      notas,
      usuarioCorreo,
    } = body;

    if (!productoId) {
      return NextResponse.json(
        { error: "El producto es obligatorio" },
        { status: 400 }
      );
    }

    if (!tipo) {
      return NextResponse.json(
        { error: "El tipo de movimiento es obligatorio" },
        { status: 400 }
      );
    }

    if (!motivo) {
      return NextResponse.json(
        { error: "El motivo del movimiento es obligatorio" },
        { status: 400 }
      );
    }

    if (cantidad === undefined || cantidad === null || Number(cantidad) < 0) {
      return NextResponse.json(
        { error: "La cantidad es obligatoria y debe ser válida" },
        { status: 400 }
      );
    }

    if (!usuarioCorreo) {
      return NextResponse.json(
        { error: "No se pudo identificar el usuario" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        correo: usuarioCorreo,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: {
        id: productoId,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const cantidadNumero = Number(cantidad);
    const stockAnterior = producto.stock;
    let stockNuevo = stockAnterior;

    if (tipo === "ENTRADA") {
      stockNuevo = stockAnterior + cantidadNumero;
    } else if (tipo === "SALIDA") {
      if (cantidadNumero > stockAnterior) {
        return NextResponse.json(
          { error: "No hay stock suficiente para realizar la salida" },
          { status: 400 }
        );
      }

      stockNuevo = stockAnterior - cantidadNumero;
    } else if (tipo === "AJUSTE") {
      stockNuevo = cantidadNumero;
    }

    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productoActualizado = await tx.producto.update({
        where: {
          id: producto.id,
        },
        data: {
          stock: stockNuevo,
        },
      });

      const movimiento = await tx.movimientoInventario.create({
        data: {
          tipo,
          motivo,
          cantidad: cantidadNumero,
          stockAnterior,
          stockNuevo,
          notas: notas?.trim() || null,
          productoId: producto.id,
          usuarioId: usuario.id,
        },
        include: {
          producto: true,
          usuario: true,
        },
      });

      return { productoActualizado, movimiento };
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo registrar el movimiento" },
      { status: 500 }
    );
  }
}