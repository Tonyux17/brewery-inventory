import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirAnulados = searchParams.get("incluirAnulados") === "true";

    const movimientos = await prisma.movimientoInventario.findMany({
      where: incluirAnulados ? {} : { estado: "ACTIVO" },
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
  } catch (error) {
    console.error("Error al obtener movimientos:", error);

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
        correo: String(usuarioCorreo).trim().toLowerCase(),
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { error: "El usuario está inactivo" },
        { status: 403 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: {
        id: productoId,
      },
      include: {
        categoria: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (!producto.activo) {
      return NextResponse.json(
        { error: "No se pueden registrar movimientos para un producto inactivo" },
        { status: 400 }
      );
    }

    if (!producto.categoria.activo) {
      return NextResponse.json(
        {
          error:
            "No se pueden registrar movimientos para un producto cuya categoría está inactiva",
        },
        { status: 400 }
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
    } else {
      return NextResponse.json(
        { error: "Tipo de movimiento inválido" },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
            estado: "ACTIVO",
            productoId: producto.id,
            usuarioId: usuario.id,
          },
          include: {
            producto: true,
            usuario: true,
          },
        });

        return { productoActualizado, movimiento };
      }
    );

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);

    return NextResponse.json(
      { error: "No se pudo registrar el movimiento" },
      { status: 500 }
    );
  }
}