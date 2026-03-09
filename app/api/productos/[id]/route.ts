import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const producto = await prisma.producto.findUnique({
      where: { id },
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

    return NextResponse.json(producto);
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
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

    const productoActual = await prisma.producto.findUnique({
      where: { id },
    });

    if (!productoActual) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const productoConMismoSku = await prisma.producto.findFirst({
      where: {
        sku: sku.trim(),
        NOT: {
          id,
        },
      },
    });

    if (productoConMismoSku) {
      return NextResponse.json(
        { error: "Ya existe otro producto con ese SKU" },
        { status: 409 }
      );
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
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

    return NextResponse.json(productoActualizado);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 }
    );
  }
}