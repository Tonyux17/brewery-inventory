"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  activo: boolean;
  creadoEn: string;
  categoria: Categoria;
};

type FiltroEstado = "todos" | "activos" | "inactivos";

export default function PaginaProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoEstado, setProcesandoEstado] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sku, setSku] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [volumenMl, setVolumenMl] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [categoriaId, setCategoriaId] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");

  async function cargarCategorias() {
    const respuesta = await fetch("/api/categorias", {
      cache: "no-store",
    });
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar las categorías");
    }

    setCategorias(data);
  }

  async function cargarProductos() {
    const respuesta = await fetch("/api/productos?incluirInactivos=true", {
      cache: "no-store",
    });
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar los productos");
    }

    setProductos(data);
  }

  async function cargarDatos() {
    try {
      setCargando(true);
      await Promise.all([cargarCategorias(), cargarProductos()]);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los datos");
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

      const respuesta = await fetch("/api/productos", {
        method: "POST",
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
        setError(data.error || "No se pudo guardar el producto");
        return;
      }

      setNombre("");
      setDescripcion("");
      setSku("");
      setCodigoBarras("");
      setVolumenMl("");
      setPrecioCompra("");
      setPrecioVenta("");
      setStock("");
      setStockMinimo("5");
      setCategoriaId("");

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoProducto(id: string, activo: boolean) {
    try {
      setError("");
      setProcesandoEstado(id);

      const respuesta = await fetch(`/api/productos/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo actualizar el estado del producto");
        return;
      }

      setProductos((prev) =>
        prev.map((producto) =>
          producto.id === id ? { ...producto, activo: data.activo } : producto
        )
      );
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al cambiar el estado del producto");
    } finally {
      setProcesandoEstado(null);
    }
  }

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const filtrados = productos.filter((producto) => {
      const coincideBusqueda =
        texto === "" ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.sku.toLowerCase().includes(texto) ||
        (producto.descripcion || "").toLowerCase().includes(texto);

      const coincideCategoria =
        filtroCategoria === "todas" || producto.categoria.id === filtroCategoria;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && producto.activo) ||
        (filtroEstado === "inactivos" && !producto.activo);

      return coincideBusqueda && coincideCategoria && coincideEstado;
    });

    return filtrados.sort((a, b) => {
      const prioridad = (producto: Producto) => {
        if (!producto.activo) return 0;
        if (producto.stock <= 0) return 1;
        if (producto.stock <= producto.stockMinimo) return 2;
        return 3;
      };

      const prioridadA = prioridad(a);
      const prioridadB = prioridad(b);

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      return a.nombre.localeCompare(b.nombre);
    });
  }, [productos, busqueda, filtroCategoria, filtroEstado]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroCategoria("todas");
    setFiltroEstado("todos");
  }

  function exportarProductosCSV() {
    const encabezados = [
      "Nombre",
      "Descripcion",
      "SKU",
      "CodigoBarras",
      "VolumenMl",
      "PrecioCompra",
      "PrecioVenta",
      "Stock",
      "StockMinimo",
      "Estado",
      "Categoria",
      "FechaCreacion",
    ];

    const filas = productosFiltrados.map((producto) => [
      producto.nombre,
      producto.descripcion || "",
      producto.sku,
      producto.codigoBarras || "",
      producto.volumenMl ?? "",
      producto.precioCompra,
      producto.precioVenta,
      producto.stock,
      producto.stockMinimo,
      producto.activo ? "Activo" : "Inactivo",
      producto.categoria.nombre,
      new Date(producto.creadoEn).toLocaleString(),
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) =>
        fila
          .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "productos.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  }

  function obtenerEstadoInventario(producto: Producto) {
    if (producto.stock <= 0) return "agotado";
    if (producto.stock <= producto.stockMinimo) return "bajo";
    return "normal";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f3f4f6 0%, #fafafa 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <section
          style={{
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              padding: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                Inventario
              </p>
              <h1
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "42px",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                Productos
              </h1>
              <p
                style={{
                  margin: "14px 0 0 0",
                  maxWidth: "720px",
                  fontSize: "16px",
                  color: "#d1d5db",
                  lineHeight: 1.6,
                }}
              >
                Administra el catálogo de productos, controla stock, revisa alertas
                y mantén organizada la información del inventario.
              </p>
            </div>

            <Link
              href="/panel"
              style={{
                textDecoration: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "16px",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Volver al panel
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "380px minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "28px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
              position: "sticky",
              top: "20px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9ca3af",
                  fontWeight: 700,
                }}
              >
                Formulario
              </p>
              <h2
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "30px",
                  color: "#111827",
                  fontWeight: 800,
                }}
              >
                Nuevo producto
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Captura la información principal del producto.
              </p>
            </div>

            <form
              onSubmit={manejarSubmit}
              style={{
                marginTop: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Cerveza Lager 355 ml"
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del producto"
                  rows={4}
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej. LAG-355-001"
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Código de barras
                </label>
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  placeholder="Opcional"
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Volumen (ml)
                  </label>
                  <input
                    type="number"
                    value={volumenMl}
                    onChange={(e) => setVolumenMl(e.target.value)}
                    placeholder="355"
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Categoría
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Precio compra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    placeholder="15.50"
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Precio venta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    placeholder="25.00"
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Stock inicial
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    placeholder="5"
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {error ? (
                <div
                  style={{
                    borderRadius: "16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    padding: "12px 14px",
                    color: "#b91c1c",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={guardando}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "16px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  opacity: guardando ? 0.7 : 1,
                  boxShadow: "0 10px 24px rgba(17,24,39,0.18)",
                }}
              >
                {guardando ? "Guardando..." : "Guardar producto"}
              </button>
            </form>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <section
              style={{
                background: "#ffffff",
                borderRadius: "28px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    Explorar productos
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    Busca, filtra y exporta los registros del catálogo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportarProductosCSV}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Exportar CSV
                </button>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr) auto auto auto",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, SKU o descripción"
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setFiltroEstado("todos")}
                  style={{
                    border: "1px solid #d1d5db",
                    background: filtroEstado === "todos" ? "#111827" : "#ffffff",
                    color: filtroEstado === "todos" ? "#ffffff" : "#111827",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Todos
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstado("activos")}
                  style={{
                    border: "1px solid #d1d5db",
                    background: filtroEstado === "activos" ? "#16a34a" : "#ffffff",
                    color: filtroEstado === "activos" ? "#ffffff" : "#111827",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Activos
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstado("inactivos")}
                  style={{
                    border: "1px solid #d1d5db",
                    background: filtroEstado === "inactivos" ? "#dc2626" : "#ffffff",
                    color: filtroEstado === "inactivos" ? "#ffffff" : "#111827",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Inactivos
                </button>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Mostrando {productosFiltrados.length} producto(s)
                </p>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            </section>

            {cargando ? (
              <section
                style={{
                  background: "#ffffff",
                  borderRadius: "28px",
                  padding: "32px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  Cargando productos...
                </p>
              </section>
            ) : productosFiltrados.length === 0 ? (
              <section
                style={{
                  background: "#ffffff",
                  borderRadius: "28px",
                  padding: "32px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  No se encontraron productos con los filtros aplicados.
                </p>
              </section>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {productosFiltrados.map((producto) => {
                  const estadoInventario = obtenerEstadoInventario(producto);

                  return (
                    <article
                      key={producto.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "28px",
                        padding: "24px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                        opacity: producto.activo ? 1 : 0.78,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "28px",
                                fontWeight: 800,
                                color: "#111827",
                              }}
                            >
                              {producto.nombre}
                            </h3>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: 800,
                                background: producto.activo ? "#dcfce7" : "#e5e7eb",
                                color: producto.activo ? "#166534" : "#475569",
                              }}
                            >
                              {producto.activo ? "Activo" : "Inactivo"}
                            </span>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: 800,
                                background:
                                  estadoInventario === "agotado"
                                    ? "#fee2e2"
                                    : estadoInventario === "bajo"
                                    ? "#fef3c7"
                                    : "#e0f2fe",
                                color:
                                  estadoInventario === "agotado"
                                    ? "#b91c1c"
                                    : estadoInventario === "bajo"
                                    ? "#92400e"
                                    : "#0f766e",
                              }}
                            >
                              {estadoInventario === "agotado"
                                ? "Agotado"
                                : estadoInventario === "bajo"
                                ? "Stock bajo"
                                : "Disponible"}
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "12px 0 0 0",
                              fontSize: "15px",
                              color: "#6b7280",
                            }}
                          >
                            {producto.descripcion || "Sin descripción"}
                          </p>

                          <div
                            style={{
                              marginTop: "18px",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                            }}
                          >
                            {[
                              `SKU: ${producto.sku}`,
                              `Categoría: ${producto.categoria.nombre}`,
                              `Stock: ${producto.stock}`,
                              `Mínimo: ${producto.stockMinimo}`,
                              `Compra: $${producto.precioCompra}`,
                              `Venta: $${producto.precioVenta}`,
                              producto.volumenMl ? `${producto.volumenMl} ml` : null,
                            ]
                              .filter(Boolean)
                              .map((item) => (
                                <span
                                  key={String(item)}
                                  style={{
                                    borderRadius: "14px",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    padding: "10px 12px",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth: "130px",
                            textAlign: "right",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#9ca3af",
                              fontWeight: 800,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                            }}
                          >
                            Creado
                          </p>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "14px",
                              color: "#374151",
                              fontWeight: 700,
                            }}
                          >
                            {new Date(producto.creadoEn).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "22px",
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/productos/${producto.id}`}
                          style={{
                            textDecoration: "none",
                            borderRadius: "16px",
                            border: "1px solid #d1d5db",
                            background: "#ffffff",
                            color: "#111827",
                            padding: "12px 16px",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          Editar producto
                        </Link>

                        {producto.activo ? (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmado = window.confirm(
                                `¿Deseas eliminar el producto "${producto.nombre}"?`
                              );

                              if (confirmado) {
                                cambiarEstadoProducto(producto.id, false);
                              }
                            }}
                            disabled={procesandoEstado === producto.id}
                            style={{
                              border: "none",
                              borderRadius: "16px",
                              background: "#dc2626",
                              color: "#ffffff",
                              padding: "12px 16px",
                              fontSize: "14px",
                              fontWeight: 800,
                              cursor: "pointer",
                              opacity: procesandoEstado === producto.id ? 0.7 : 1,
                            }}
                          >
                            {procesandoEstado === producto.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmado = window.confirm(
                                `¿Deseas restaurar el producto "${producto.nombre}"?`
                              );

                              if (confirmado) {
                                cambiarEstadoProducto(producto.id, true);
                              }
                            }}
                            disabled={procesandoEstado === producto.id}
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: "16px",
                              background: "#ffffff",
                              color: "#111827",
                              padding: "12px 16px",
                              fontSize: "14px",
                              fontWeight: 800,
                              cursor: "pointer",
                              opacity: procesandoEstado === producto.id ? 0.7 : 1,
                            }}
                          >
                            {procesandoEstado === producto.id
                              ? "Restaurando..."
                              : "Restaurar"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}