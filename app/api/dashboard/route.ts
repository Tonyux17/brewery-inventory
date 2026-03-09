import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalProductos = await prisma.producto.count();
    const totalCategorias = await prisma.categoria.count();

    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });

    const movimientosRecientes = await prisma.movimientoInventario.findMany({
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
      take: 5,
    });

    const stockTotal = productos.reduce((acc, producto) => acc + producto.stock, 0);

    const productosStockBajo = productos.filter(
      (producto) => producto.stock <= producto.stockMinimo
    );

    const productosAgotados = productos.filter((producto) => producto.stock === 0);

    return NextResponse.json({
      totalProductos,
      totalCategorias,
      stockTotal,
      totalStockBajo: productosStockBajo.length,
      totalAgotados: productosAgotados.length,
      productosStockBajo,
      movimientosRecientes,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los datos del dashboard" },
      { status: 500 }
    );
  }
}