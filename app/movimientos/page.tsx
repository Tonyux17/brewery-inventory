"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Producto = {
  id: string;
  nombre: string;
  stock: number;
  activo?: boolean;
};

type Movimiento = {
  id: string;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
  motivo: "PRODUCCION" | "VENTA" | "MERMA" | "AJUSTE_MANUAL";
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  notas: string | null;
  creadoEn: string;
  producto: {
    nombre: string;
    categoria: {
      nombre: string;
    };
  };
  usuario: {
    nombre: string;
    correo: string;
  };
};

type FiltroTipo = "TODOS" | "ENTRADA" | "SALIDA" | "AJUSTE";
type FiltroMotivo =
  | "TODOS"
  | "PRODUCCION"
  | "VENTA"
  | "MERMA"
  | "AJUSTE_MANUAL";

export default function PaginaMovimientos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [motivo, setMotivo] = useState<
    "PRODUCCION" | "VENTA" | "MERMA" | "AJUSTE_MANUAL"
  >("PRODUCCION");
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("TODOS");
  const [filtroMotivo, setFiltroMotivo] = useState<FiltroMotivo>("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  async function cargarProductos() {
    const respuesta = await fetch("/api/productos");
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar los productos");
    }

    const productosActivos = data.filter(
      (producto: Producto & { activo?: boolean }) => producto.activo !== false
    );

    setProductos(productosActivos);
  }

  async function cargarMovimientos() {
    const respuesta = await fetch("/api/movimientos");
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar los movimientos");
    }

    setMovimientos(data);
  }

  async function cargarDatos() {
    try {
      setCargando(true);
      await Promise.all([cargarProductos(), cargarMovimientos()]);
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

  useEffect(() => {
    if (tipo === "ENTRADA") {
      setMotivo("PRODUCCION");
    } else if (tipo === "SALIDA") {
      setMotivo("VENTA");
    } else if (tipo === "AJUSTE") {
      setMotivo("AJUSTE_MANUAL");
    }
  }, [tipo]);

  async function manejarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setGuardando(true);

      const respuestaUsuario = await fetch("/api/auth/me");
      const usuario = await respuestaUsuario.json();

      if (!respuestaUsuario.ok) {
        setError("No se pudo obtener la sesión del usuario");
        return;
      }

      const respuesta = await fetch("/api/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productoId,
          tipo,
          motivo,
          cantidad,
          notas,
          usuarioCorreo: usuario.correo,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo registrar el movimiento");
        return;
      }

      setProductoId("");
      setTipo("ENTRADA");
      setMotivo("PRODUCCION");
      setCantidad("");
      setNotas("");

      await Promise.all([cargarProductos(), cargarMovimientos()]);
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al registrar el movimiento");
    } finally {
      setGuardando(false);
    }
  }

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return movimientos.filter((movimiento) => {
      const coincideTexto =
        texto === "" ||
        movimiento.producto.nombre.toLowerCase().includes(texto) ||
        movimiento.producto.categoria.nombre.toLowerCase().includes(texto) ||
        (movimiento.notas || "").toLowerCase().includes(texto) ||
        movimiento.usuario.nombre.toLowerCase().includes(texto) ||
        movimiento.usuario.correo.toLowerCase().includes(texto);

      const coincideTipo =
        filtroTipo === "TODOS" || movimiento.tipo === filtroTipo;

      const coincideMotivo =
        filtroMotivo === "TODOS" || movimiento.motivo === filtroMotivo;

      const fechaMovimiento = new Date(movimiento.creadoEn);
      const soloFechaMovimiento = new Date(
        fechaMovimiento.getFullYear(),
        fechaMovimiento.getMonth(),
        fechaMovimiento.getDate()
      );

      const coincideDesde =
        !fechaDesde || soloFechaMovimiento >= new Date(`${fechaDesde}T00:00:00`);

      const coincideHasta =
        !fechaHasta || soloFechaMovimiento <= new Date(`${fechaHasta}T23:59:59`);

      return (
        coincideTexto &&
        coincideTipo &&
        coincideMotivo &&
        coincideDesde &&
        coincideHasta
      );
    });
  }, [movimientos, busqueda, filtroTipo, filtroMotivo, fechaDesde, fechaHasta]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroTipo("TODOS");
    setFiltroMotivo("TODOS");
    setFechaDesde("");
    setFechaHasta("");
  }

  function exportarMovimientosCSV() {
    const encabezados = [
      "Producto",
      "Categoria",
      "Tipo",
      "Motivo",
      "Cantidad",
      "StockAnterior",
      "StockNuevo",
      "Notas",
      "Usuario",
      "CorreoUsuario",
      "Fecha",
    ];

    const filas = movimientosFiltrados.map((movimiento) => [
      movimiento.producto.nombre,
      movimiento.producto.categoria.nombre,
      movimiento.tipo,
      movimiento.motivo,
      movimiento.cantidad,
      movimiento.stockAnterior,
      movimiento.stockNuevo,
      movimiento.notas || "",
      movimiento.usuario.nombre,
      movimiento.usuario.correo,
      new Date(movimiento.creadoEn).toLocaleString(),
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
    enlace.download = "movimientos.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  }

  function estilosTipo(tipoMovimiento: Movimiento["tipo"]) {
    if (tipoMovimiento === "ENTRADA") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (tipoMovimiento === "SALIDA") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  function estilosMotivo(motivoMovimiento: Movimiento["motivo"]) {
    if (motivoMovimiento === "PRODUCCION") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (motivoMovimiento === "VENTA") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (motivoMovimiento === "MERMA") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    return {
      background: "#f3f4f6",
      color: "#374151",
    };
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
                Movimientos
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
                Registra entradas, salidas y ajustes del inventario. Consulta el
                historial y filtra movimientos por producto, tipo, motivo y fecha.
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
                Nuevo movimiento
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Registra un movimiento para actualizar el inventario.
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
                  Producto
                </label>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} - Stock actual: {producto.stock}
                    </option>
                  ))}
                </select>
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
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) =>
                    setTipo(e.target.value as "ENTRADA" | "SALIDA" | "AJUSTE")
                  }
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="ENTRADA">ENTRADA</option>
                  <option value="SALIDA">SALIDA</option>
                  <option value="AJUSTE">AJUSTE</option>
                </select>
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
                  Motivo
                </label>
                <select
                  value={motivo}
                  onChange={(e) =>
                    setMotivo(
                      e.target.value as
                        | "PRODUCCION"
                        | "VENTA"
                        | "MERMA"
                        | "AJUSTE_MANUAL"
                    )
                  }
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  {tipo === "ENTRADA" && (
                    <option value="PRODUCCION">PRODUCCION</option>
                  )}
                  {tipo === "SALIDA" && (
                    <>
                      <option value="VENTA">VENTA</option>
                      <option value="MERMA">MERMA</option>
                    </>
                  )}
                  {tipo === "AJUSTE" && (
                    <option value="AJUSTE_MANUAL">AJUSTE_MANUAL</option>
                  )}
                </select>
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
                  {tipo === "AJUSTE" ? "Nuevo stock final" : "Cantidad"}
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder={tipo === "AJUSTE" ? "Ej. 120" : "Ej. 10"}
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #d1d5db",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
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
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas opcionales"
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
                  }}
                />
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
                {guardando ? "Guardando..." : "Registrar movimiento"}
              </button>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <div
              style={{
                background: "#ffffff",
                borderRadius: "28px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
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
                  Historial
                </p>
                <h2
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "30px",
                    color: "#111827",
                    fontWeight: 800,
                  }}
                >
                  Historial de movimientos
                </h2>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Busca y filtra movimientos por producto, tipo, motivo y fecha.
                </p>
              </div>

              <div
                style={{
                  marginTop: "22px",
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
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
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Producto, notas, usuario..."
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
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
                    Tipo
                  </label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>
                    <option value="AJUSTE">AJUSTE</option>
                  </select>
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
                    Motivo
                  </label>
                  <select
                    value={filtroMotivo}
                    onChange={(e) =>
                      setFiltroMotivo(e.target.value as FiltroMotivo)
                    }
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="PRODUCCION">PRODUCCION</option>
                    <option value="VENTA">VENTA</option>
                    <option value="MERMA">MERMA</option>
                    <option value="AJUSTE_MANUAL">AJUSTE_MANUAL</option>
                  </select>
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
                    Desde
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
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
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "18px",
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
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: 600,
                  }}
                >
                  Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
                </p>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    style={{
                      background: "#ffffff",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: "14px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Limpiar filtros
                  </button>

                  <button
                    type="button"
                    onClick={exportarMovimientosCSV}
                    style={{
                      background: "#111827",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "14px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Exportar CSV
                  </button>
                </div>
              </div>
            </div>

            {cargando ? (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "28px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Cargando movimientos...
              </div>
            ) : movimientosFiltrados.length === 0 ? (
              <div
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
                    borderRadius: "20px",
                    padding: "18px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <p style={{ margin: 0, color: "#1d4ed8", fontWeight: 800 }}>
                    Sin resultados
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#2563eb",
                      fontSize: "14px",
                    }}
                  >
                    No se encontraron movimientos con los filtros aplicados.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {movimientosFiltrados.map((movimiento) => {
                  const badgeTipo = estilosTipo(movimiento.tipo);
                  const badgeMotivo = estilosMotivo(movimiento.motivo);

                  return (
                    <div
                      key={movimiento.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "28px",
                        padding: "22px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "18px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
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
                              {movimiento.producto.nombre}
                            </h3>

                            <span
                              style={{
                                background: badgeTipo.background,
                                color: badgeTipo.color,
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: 800,
                              }}
                            >
                              {movimiento.tipo}
                            </span>

                            <span
                              style={{
                                background: badgeMotivo.background,
                                color: badgeMotivo.color,
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: 800,
                              }}
                            >
                              {movimiento.motivo}
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "12px 0 0 0",
                              fontSize: "15px",
                              color: "#6b7280",
                              lineHeight: 1.6,
                            }}
                          >
                            Categoría: {movimiento.producto.categoria.nombre}
                          </p>

                          <div
                            style={{
                              marginTop: "18px",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: 700,
                              }}
                            >
                              Cantidad: {movimiento.cantidad}
                            </span>

                            <span
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: 700,
                              }}
                            >
                              Antes: {movimiento.stockAnterior}
                            </span>

                            <span
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: 700,
                              }}
                            >
                              Después: {movimiento.stockNuevo}
                            </span>
                          </div>

                          {movimiento.notas ? (
                            <div
                              style={{
                                marginTop: "18px",
                                borderRadius: "18px",
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                padding: "14px 16px",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "12px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.12em",
                                  color: "#9ca3af",
                                  fontWeight: 700,
                                }}
                              >
                                Notas
                              </p>
                              <p
                                style={{
                                  margin: "8px 0 0 0",
                                  fontSize: "14px",
                                  color: "#374151",
                                  lineHeight: 1.6,
                                }}
                              >
                                {movimiento.notas}
                              </p>
                            </div>
                          ) : null}

                          <div
                            style={{
                              marginTop: "18px",
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                background: "#eef2ff",
                                color: "#3730a3",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: 700,
                              }}
                            >
                              Usuario: {movimiento.usuario.nombre}
                            </span>

                            <span
                              style={{
                                background: "#f3f4f6",
                                color: "#4b5563",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              {movimiento.usuario.correo}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth: "180px",
                            textAlign: "right",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              textTransform: "uppercase",
                              letterSpacing: "0.12em",
                              color: "#9ca3af",
                              fontWeight: 700,
                            }}
                          >
                            Fecha
                          </p>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "14px",
                              color: "#4b5563",
                              fontWeight: 700,
                              lineHeight: 1.5,
                            }}
                          >
                            {new Date(movimiento.creadoEn).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
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