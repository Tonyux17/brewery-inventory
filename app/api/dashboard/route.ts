import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductoDashboard = {
  stock: number;
  stockMinimo: number;
};

export async function GET() {
  try {
    const productos = (await prisma.producto.findMany({
      select: {
        stock: true,
        stockMinimo: true,
      },
    })) as ProductoDashboard[];

    const totalProductos = productos.length;

    const stockTotal = productos.reduce(
      (acc: number, producto: ProductoDashboard) => acc + producto.stock,
      0
    );

    const productosStockBajo = productos.filter(
      (producto: ProductoDashboard) =>
        producto.stock > 0 && producto.stock <= producto.stockMinimo
    );

    const productosAgotados = productos.filter(
      (producto: ProductoDashboard) => producto.stock <= 0
    );

    return NextResponse.json({
      totalProductos,
      stockTotal,
      stockBajo: productosStockBajo.length,
      agotados: productosAgotados.length,
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);

    return NextResponse.json(
      { error: "No se pudo obtener la información del dashboard" },
      { status: 500 }
    );
  }
}