"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Categoria = {
  id: string;
  nombre: string;
};

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  sku: string;
  codigoBarras: string | null;
  volumenMl: number | null;
  precioCompra: string;
  precioVenta: string;
  stock: number;
  stockMinimo: number;
  categoriaId: string;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function PaginaEditarProducto({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sku, setSku] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [volumenMl, setVolumenMl] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  async function cargarCategorias() {
    const respuesta = await fetch("/api/categorias");
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar las categorías");
    }

    setCategorias(data);
  }

  async function cargarProducto() {
    const respuesta = await fetch(`/api/productos/${id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudo cargar el producto");
    }

    const producto: Producto = data;

    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || "");
    setSku(producto.sku);
    setCodigoBarras(producto.codigoBarras || "");
    setVolumenMl(producto.volumenMl?.toString() || "");
    setPrecioCompra(producto.precioCompra?.toString() || "");
    setPrecioVenta(producto.precioVenta?.toString() || "");
    setStock(producto.stock.toString());
    setStockMinimo(producto.stockMinimo.toString());
    setCategoriaId(producto.categoriaId);
  }

  async function cargarDatos() {
    try {
      setCargando(true);
      await Promise.all([cargarCategorias(), cargarProducto()]);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los datos del producto");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function manejarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setGuardando(true);

      const respuesta = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo actualizar el producto");
        return;
      }

      router.push("/productos");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al actualizar el producto");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar producto
              </h1>
              <p className="mt-2 text-gray-600">
                Modifica la información del producto seleccionado.
              </p>
            </div>

            <Link
              href="/productos"
              className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Volver a productos
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Código de barras
              </label>
              <input
                type="text"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Volumen (ml)
                </label>
                <input
                  type="number"
                  value={volumenMl}
                  onChange={(e) => setVolumenMl(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Precio de compra
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Precio de venta
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stock mínimo
                </label>
                <input
                  type="number"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {guardando ? "Guardando cambios..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}