import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });

    return NextResponse.json(productos);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre,
      descripcion,
      sku,
      codigoBarras,
      volumenMl,
      precioCompra,
      precioVenta,
      stock,
      stockMinimo,
      categoriaId,
    } = body;

    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    if (!sku || sku.trim().length < 2) {
      return NextResponse.json(
        { error: "El SKU es obligatorio" },
        { status: 400 }
      );
    }

    if (!categoriaId) {
      return NextResponse.json(
        { error: "La categoría es obligatoria" },
        { status: 400 }
      );
    }

    const productoExistente = await prisma.producto.findUnique({
      where: {
        sku: sku.trim(),
      },
    });

    if (productoExistente) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese SKU" },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        sku: sku.trim(),
        codigoBarras: codigoBarras?.trim() || null,
        volumenMl: volumenMl ? Number(volumenMl) : null,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        stock: Number(stock) || 0,
        stockMinimo: Number(stockMinimo) || 5,
        categoriaId,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
} 