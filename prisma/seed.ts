import "dotenv/config";
import { PrismaClient, RolUsuario } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en el archivo .env");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin12345", 10);

  const admin = await prisma.usuario.upsert({
    where: { correo: "admin@cerveceria.com" },
    update: {
      nombre: "Administrador",
      passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
    create: {
      nombre: "Administrador",
      correo: "admin@cerveceria.com",
      passwordHash,
      rol: RolUsuario.ADMINISTRADOR,
      activo: true,
    },
  });

  const categoriasData = [
    { nombre: "Lager", descripcion: "Cervezas lager de la cervecería" },
    { nombre: "IPA", descripcion: "Cervezas IPA artesanales" },
    { nombre: "Stout", descripcion: "Cervezas stout oscuras" },
    { nombre: "Porter", descripcion: "Cervezas porter con cuerpo medio" },
    { nombre: "Pale Ale", descripcion: "Pale ale de línea base" },
    { nombre: "Amber Ale", descripcion: "Amber ale de temporada" },
    { nombre: "Wheat Beer", descripcion: "Cervezas de trigo" },
    { nombre: "Edición Especial", descripcion: "Lotes limitados o especiales" },
  ];

  const categoriasMap = new Map<string, string>();

  for (const categoria of categoriasData) {
    const creada = await prisma.categoria.upsert({
      where: { nombre: categoria.nombre },
      update: {
        descripcion: categoria.descripcion,
        activo: true,
      },
      create: {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: true,
      },
    });

    categoriasMap.set(categoria.nombre, creada.id);
  }

  const productosData = [
    {
      nombre: "Montiel Lager Clásica",
      descripcion: "Lager ligera y refrescante",
      sku: "LAG-001",
      codigoBarras: "750000000001",
      volumenMl: 355,
      precioCompra: 24,
      precioVenta: 45,
      stock: 120,
      stockMinimo: 20,
      categoria: "Lager",
      activo: true,
    },
    {
      nombre: "Montiel Lager Light",
      descripcion: "Versión ligera de la lager",
      sku: "LAG-002",
      codigoBarras: "750000000002",
      volumenMl: 355,
      precioCompra: 22,
      precioVenta: 43,
      stock: 84,
      stockMinimo: 20,
      categoria: "Lager",
      activo: true,
    },
    {
      nombre: "Montiel IPA Cítrica",
      descripcion: "IPA con notas cítricas intensas",
      sku: "IPA-001",
      codigoBarras: "750000000003",
      volumenMl: 355,
      precioCompra: 28,
      precioVenta: 52,
      stock: 18,
      stockMinimo: 20,
      categoria: "IPA",
      activo: true,
    },
    {
      nombre: "Montiel IPA Tropical",
      descripcion: "IPA con perfil tropical",
      sku: "IPA-002",
      codigoBarras: "750000000004",
      volumenMl: 355,
      precioCompra: 29,
      precioVenta: 53,
      stock: 0,
      stockMinimo: 18,
      categoria: "IPA",
      activo: true,
    },
    {
      nombre: "Montiel Stout Robusta",
      descripcion: "Stout de cuerpo alto y sabor tostado",
      sku: "STO-001",
      codigoBarras: "750000000005",
      volumenMl: 355,
      precioCompra: 30,
      precioVenta: 55,
      stock: 0,
      stockMinimo: 15,
      categoria: "Stout",
      activo: true,
    },
    {
      nombre: "Montiel Stout Vainilla",
      descripcion: "Stout con toques de vainilla",
      sku: "STO-002",
      codigoBarras: "750000000006",
      volumenMl: 355,
      precioCompra: 31,
      precioVenta: 58,
      stock: 32,
      stockMinimo: 10,
      categoria: "Stout",
      activo: true,
    },
    {
      nombre: "Montiel Porter Ahumada",
      descripcion: "Porter con perfil ahumado",
      sku: "POR-001",
      codigoBarras: "750000000007",
      volumenMl: 355,
      precioCompra: 29,
      precioVenta: 54,
      stock: 10,
      stockMinimo: 12,
      categoria: "Porter",
      activo: true,
    },
    {
      nombre: "Montiel Pale Ale Dorada",
      descripcion: "Pale ale equilibrada",
      sku: "PAL-001",
      codigoBarras: "750000000008",
      volumenMl: 355,
      precioCompra: 26,
      precioVenta: 48,
      stock: 65,
      stockMinimo: 15,
      categoria: "Pale Ale",
      activo: true,
    },
    {
      nombre: "Montiel Amber Reserva",
      descripcion: "Amber ale con notas dulces",
      sku: "AMB-001",
      codigoBarras: "750000000009",
      volumenMl: 355,
      precioCompra: 27,
      precioVenta: 50,
      stock: 9,
      stockMinimo: 10,
      categoria: "Amber Ale",
      activo: true,
    },
    {
      nombre: "Montiel Wheat Suave",
      descripcion: "Cerveza de trigo ligera",
      sku: "WHE-001",
      codigoBarras: "750000000010",
      volumenMl: 355,
      precioCompra: 25,
      precioVenta: 47,
      stock: 44,
      stockMinimo: 12,
      categoria: "Wheat Beer",
      activo: true,
    },
    {
      nombre: "Montiel Edición Barrica",
      descripcion: "Edición especial reposada en barrica",
      sku: "ESP-001",
      codigoBarras: "750000000011",
      volumenMl: 355,
      precioCompra: 40,
      precioVenta: 70,
      stock: 6,
      stockMinimo: 5,
      categoria: "Edición Especial",
      activo: true,
    },
    {
      nombre: "Producto Demo Inactivo",
      descripcion: "Producto de prueba para validar estados",
      sku: "DEM-999",
      codigoBarras: "750000000012",
      volumenMl: 355,
      precioCompra: 20,
      precioVenta: 40,
      stock: 12,
      stockMinimo: 5,
      categoria: "Edición Especial",
      activo: false,
    },
  ];

  for (const producto of productosData) {
    const categoriaId = categoriasMap.get(producto.categoria);

    if (!categoriaId) {
      throw new Error(`No se encontró la categoría ${producto.categoria}`);
    }

    await prisma.producto.upsert({
      where: { sku: producto.sku },
      update: {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        codigoBarras: producto.codigoBarras,
        volumenMl: producto.volumenMl,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        categoriaId,
        activo: producto.activo,
      },
      create: {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        sku: producto.sku,
        codigoBarras: producto.codigoBarras,
        volumenMl: producto.volumenMl,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        categoriaId,
        activo: producto.activo,
      },
    });
  }

  const productos = await prisma.producto.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  const movimientosDemo = [
    {
      sku: "LAG-001",
      tipo: "ENTRADA",
      motivo: "PRODUCCION",
      cantidad: 40,
      stockAnterior: 80,
      stockNuevo: 120,
      notas: "Ingreso demo por producción",
    },
    {
      sku: "IPA-001",
      tipo: "SALIDA",
      motivo: "VENTA",
      cantidad: 12,
      stockAnterior: 30,
      stockNuevo: 18,
      notas: "Salida demo por venta",
    },
    {
      sku: "STO-001",
      tipo: "SALIDA",
      motivo: "VENTA",
      cantidad: 8,
      stockAnterior: 8,
      stockNuevo: 0,
      notas: "Salida demo hasta agotar stock",
    },
    {
      sku: "POR-001",
      tipo: "SALIDA",
      motivo: "MERMA",
      cantidad: 2,
      stockAnterior: 12,
      stockNuevo: 10,
      notas: "Merma demo",
    },
    {
      sku: "AMB-001",
      tipo: "SALIDA",
      motivo: "VENTA",
      cantidad: 3,
      stockAnterior: 12,
      stockNuevo: 9,
      notas: "Salida demo por venta",
    },
    {
      sku: "ESP-001",
      tipo: "AJUSTE",
      motivo: "AJUSTE_MANUAL",
      cantidad: 6,
      stockAnterior: 5,
      stockNuevo: 6,
      notas: "Ajuste demo de inventario",
    },
  ];

  for (const movimiento of movimientosDemo) {
    const producto = productos.find((p) => p.sku === movimiento.sku);

    if (!producto) {
      continue;
    }

    const existente = await prisma.movimientoInventario.findFirst({
      where: {
        productoId: producto.id,
        tipo: movimiento.tipo as "ENTRADA" | "SALIDA" | "AJUSTE",
        motivo: movimiento.motivo as
          | "PRODUCCION"
          | "VENTA"
          | "MERMA"
          | "AJUSTE_MANUAL",
        cantidad: movimiento.cantidad,
        notas: movimiento.notas,
      },
    });

    if (!existente) {
      await prisma.movimientoInventario.create({
        data: {
          tipo: movimiento.tipo as "ENTRADA" | "SALIDA" | "AJUSTE",
          motivo: movimiento.motivo as
            | "PRODUCCION"
            | "VENTA"
            | "MERMA"
            | "AJUSTE_MANUAL",
          cantidad: movimiento.cantidad,
          stockAnterior: movimiento.stockAnterior,
          stockNuevo: movimiento.stockNuevo,
          notas: movimiento.notas,
          estado: "ACTIVO",
          productoId: producto.id,
          usuarioId: admin.id,
        },
      });
    }
  }

  console.log("Seed ejecutado correctamente");
  console.log("Usuario admin: admin@cerveceria.com");
  console.log("Contraseña admin: Admin12345");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });