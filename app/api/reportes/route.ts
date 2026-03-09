import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const where: {
      creadoEn?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (desde || hasta) {
      where.creadoEn = {};

      if (desde) {
        where.creadoEn.gte = new Date(`${desde}T00:00:00`);
      }

      if (hasta) {
        where.creadoEn.lte = new Date(`${hasta}T23:59:59`);
      }
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
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

    const totalMovimientos = movimientos.length;

    const totalEntradas = movimientos
      .filter((m) => m.tipo === "ENTRADA")
      .reduce((acc, m) => acc + m.cantidad, 0);

    const totalSalidas = movimientos
      .filter((m) => m.tipo === "SALIDA")
      .reduce((acc, m) => acc + m.cantidad, 0);

    const totalAjustes = movimientos
      .filter((m) => m.tipo === "AJUSTE")
      .reduce((acc, m) => acc + m.cantidad, 0);

    const totalMermas = movimientos
      .filter((m) => m.motivo === "MERMA")
      .reduce((acc, m) => acc + m.cantidad, 0);

    const resumenPorTipo = [
      {
        tipo: "ENTRADA",
        total: movimientos
          .filter((m) => m.tipo === "ENTRADA")
          .reduce((acc, m) => acc + m.cantidad, 0),
      },
      {
        tipo: "SALIDA",
        total: movimientos
          .filter((m) => m.tipo === "SALIDA")
          .reduce((acc, m) => acc + m.cantidad, 0),
      },
      {
        tipo: "AJUSTE",
        total: movimientos
          .filter((m) => m.tipo === "AJUSTE")
          .reduce((acc, m) => acc + m.cantidad, 0),
      },
    ];

    const motivos = ["PRODUCCION", "VENTA", "MERMA", "AJUSTE_MANUAL"] as const;

    const resumenPorMotivo = motivos.map((motivo) => ({
      motivo,
      total: movimientos
        .filter((m) => m.motivo === motivo)
        .reduce((acc, m) => acc + m.cantidad, 0),
    }));

    const acumuladoProductos = new Map<
      string,
      {
        productoId: string;
        nombre: string;
        categoria: string;
        totalCantidad: number;
        totalMovimientos: number;
      }
    >();

    for (const movimiento of movimientos) {
      const key = movimiento.productoId;
      const existente = acumuladoProductos.get(key);

      if (existente) {
        existente.totalCantidad += movimiento.cantidad;
        existente.totalMovimientos += 1;
      } else {
        acumuladoProductos.set(key, {
          productoId: movimiento.productoId,
          nombre: movimiento.producto.nombre,
          categoria: movimiento.producto.categoria.nombre,
          totalCantidad: movimiento.cantidad,
          totalMovimientos: 1,
        });
      }
    }

    const productosMasMovidos = Array.from(acumuladoProductos.values())
      .sort((a, b) => b.totalCantidad - a.totalCantidad)
      .slice(0, 10);

    return NextResponse.json({
      totalMovimientos,
      totalEntradas,
      totalSalidas,
      totalAjustes,
      totalMermas,
      resumenPorTipo,
      resumenPorMotivo,
      productosMasMovidos,
      movimientos,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron generar los reportes" },
      { status: 500 }
    );
  }
}