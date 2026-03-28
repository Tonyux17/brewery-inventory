"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  creadoEn: string;
  activo: boolean;
};

type FiltroEstado = "todos" | "activas" | "inactivas";

export default function PaginaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoEstado, setProcesandoEstado] = useState<string | null>(null);

  async function cargarCategorias() {
    const respuesta = await fetch("/api/categorias?incluirInactivas=true", {
      cache: "no-store",
    });
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.error || "No se pudieron cargar las categorías");
    }

    setCategorias(data);
  }

  useEffect(() => {
    async function init() {
      try {
        setCargando(true);
        await cargarCategorias();
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las categorías");
      } finally {
        setCargando(false);
      }
    }

    init();
  }, []);

  async function manejarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setGuardando(true);

      const respuesta = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo guardar la categoría");
        return;
      }

      setNombre("");
      setDescripcion("");
      await cargarCategorias();
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al guardar la categoría");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoCategoria(id: string, activo: boolean) {
    try {
      setError("");
      setProcesandoEstado(id);

      const respuesta = await fetch(`/api/categorias/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo actualizar el estado");
        return;
      }

      setCategorias((prev) =>
        prev.map((categoria) =>
          categoria.id === id ? { ...categoria, activo: data.activo } : categoria
        )
      );
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al actualizar el estado");
    } finally {
      setProcesandoEstado(null);
    }
  }

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return categorias
      .filter((categoria) => {
        const coincideTexto =
          !texto ||
          categoria.nombre.toLowerCase().includes(texto) ||
          (categoria.descripcion || "").toLowerCase().includes(texto);

        const coincideEstado =
          filtroEstado === "todos" ||
          (filtroEstado === "activas" && categoria.activo) ||
          (filtroEstado === "inactivas" && !categoria.activo);

        return coincideTexto && coincideEstado;
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) {
          return a.activo ? -1 : 1;
        }

        return a.nombre.localeCompare(b.nombre);
      });
  }, [categorias, busqueda, filtroEstado]);

  function exportarCategoriasCSV() {
    const encabezados = ["Nombre", "Descripcion", "Estado", "FechaCreacion"];

    const filas = categoriasFiltradas.map((categoria) => [
      categoria.nombre,
      categoria.descripcion || "",
      categoria.activo ? "Activa" : "Inactiva",
      new Date(categoria.creadoEn).toLocaleString(),
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
    enlace.download = "categorias.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
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
                Categorías
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
                Organiza el catálogo del sistema mediante categorías claras y bien
                estructuradas para facilitar la gestión del inventario.
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
                Nueva categoría
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Registra una nueva categoría para clasificar productos.
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
                  placeholder="Ej. Lager"
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
                  placeholder="Descripción opcional"
                  rows={5}
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
                {guardando ? "Guardando..." : "Guardar categoría"}
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
                    Explorar categorías
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    Busca, filtra y exporta las categorías del sistema.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportarCategoriasCSV}
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
                  gridTemplateColumns: "minmax(0, 1fr) auto auto auto",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o descripción"
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
                  Todas
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstado("activas")}
                  style={{
                    border: "1px solid #d1d5db",
                    background: filtroEstado === "activas" ? "#16a34a" : "#ffffff",
                    color: filtroEstado === "activas" ? "#ffffff" : "#111827",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Activas
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstado("inactivas")}
                  style={{
                    border: "1px solid #d1d5db",
                    background: filtroEstado === "inactivas" ? "#dc2626" : "#ffffff",
                    color: filtroEstado === "inactivas" ? "#ffffff" : "#111827",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Inactivas
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
                  Mostrando {categoriasFiltradas.length} categoría(s)
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
                  Cargando categorías...
                </p>
              </section>
            ) : categoriasFiltradas.length === 0 ? (
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
                  No se encontraron categorías con los filtros aplicados.
                </p>
              </section>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {categoriasFiltradas.map((categoria) => (
                  <article
                    key={categoria.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "28px",
                      padding: "24px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                      opacity: categoria.activo ? 1 : 0.78,
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
                            {categoria.nombre}
                          </h3>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              borderRadius: "999px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: 800,
                              background: categoria.activo ? "#dcfce7" : "#e5e7eb",
                              color: categoria.activo ? "#166534" : "#475569",
                            }}
                          >
                            {categoria.activo ? "Activa" : "Inactiva"}
                          </span>
                        </div>

                        <p
                          style={{
                            margin: "12px 0 0 0",
                            fontSize: "15px",
                            color: "#6b7280",
                          }}
                        >
                          {categoria.descripcion || "Sin descripción"}
                        </p>
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
                          Creada
                        </p>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#374151",
                            fontWeight: 700,
                          }}
                        >
                          {new Date(categoria.creadoEn).toLocaleDateString()}
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
                        href={`/categorias/${categoria.id}`}
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
                        Editar categoría
                      </Link>

                      {categoria.activo ? (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmado = window.confirm(
                              `¿Deseas eliminar la categoría "${categoria.nombre}"?`
                            );

                            if (confirmado) {
                              cambiarEstadoCategoria(categoria.id, false);
                            }
                          }}
                          disabled={procesandoEstado === categoria.id}
                          style={{
                            border: "none",
                            borderRadius: "16px",
                            background: "#dc2626",
                            color: "#ffffff",
                            padding: "12px 16px",
                            fontSize: "14px",
                            fontWeight: 800,
                            cursor: "pointer",
                            opacity: procesandoEstado === categoria.id ? 0.7 : 1,
                          }}
                        >
                          {procesandoEstado === categoria.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmado = window.confirm(
                              `¿Deseas restaurar la categoría "${categoria.nombre}"?`
                            );

                            if (confirmado) {
                              cambiarEstadoCategoria(categoria.id, true);
                            }
                          }}
                          disabled={procesandoEstado === categoria.id}
                          style={{
                            border: "1px solid #d1d5db",
                            borderRadius: "16px",
                            background: "#ffffff",
                            color: "#111827",
                            padding: "12px 16px",
                            fontSize: "14px",
                            fontWeight: 800,
                            cursor: "pointer",
                            opacity: procesandoEstado === categoria.id ? 0.7 : 1,
                          }}
                        >
                          {procesandoEstado === categoria.id
                            ? "Restaurando..."
                            : "Restaurar"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}