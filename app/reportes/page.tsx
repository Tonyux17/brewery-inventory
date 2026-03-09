"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

type ResumenTipo = {
  tipo: string;
  total: number;
};

type ResumenMotivo = {
  motivo: string;
  total: number;
};

type ProductoMovido = {
  productoId: string;
  nombre: string;
  categoria: string;
  totalCantidad: number;
  totalMovimientos: number;
};

type ReporteData = {
  totalMovimientos: number;
  totalEntradas: number;
  totalSalidas: number;
  totalAjustes: number;
  totalMermas: number;
  resumenPorTipo: ResumenTipo[];
  resumenPorMotivo: ResumenMotivo[];
  productosMasMovidos: ProductoMovido[];
};

export default function PaginaReportes() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  async function cargarReportes() {
    try {
      setCargando(true);
      setError("");

      const params = new URLSearchParams();

      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);

      const query = params.toString();
      const url = query ? `/api/reportes?${query}` : "/api/reportes";

      const respuesta = await fetch(url);
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || "No se pudieron cargar los reportes");
      }

      setData(resultado);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los reportes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  function limpiarFiltros() {
    setDesde("");
    setHasta("");
  }

  function exportarReporteProductosMasMovidosCSV() {
    if (!data) return;

    const encabezados = [
      "Posicion",
      "Producto",
      "Categoria",
      "TotalMovido",
      "CantidadMovimientos",
    ];

    const filas = data.productosMasMovidos.map((producto, index) => [
      index + 1,
      producto.nombre,
      producto.categoria,
      producto.totalCantidad,
      producto.totalMovimientos,
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
    enlace.download = "reporte_productos_mas_movidos.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  }

  const datosGraficaTipos = useMemo(() => {
    if (!data) return null;

    return {
      labels: data.resumenPorTipo.map((item) => item.tipo),
      datasets: [
        {
          label: "Cantidad",
          data: data.resumenPorTipo.map((item) => item.total),
          backgroundColor: [
            "rgba(34, 197, 94, 0.7)",
            "rgba(59, 130, 246, 0.7)",
            "rgba(234, 179, 8, 0.7)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(234, 179, 8, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const datosGraficaMotivos = useMemo(() => {
    if (!data) return null;

    return {
      labels: data.resumenPorMotivo.map((item) => item.motivo),
      datasets: [
        {
          label: "Cantidad",
          data: data.resumenPorMotivo.map((item) => item.total),
          backgroundColor: [
            "rgba(16, 185, 129, 0.75)",
            "rgba(59, 130, 246, 0.75)",
            "rgba(239, 68, 68, 0.75)",
            "rgba(168, 85, 247, 0.75)",
          ],
          borderColor: [
            "rgba(16, 185, 129, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(168, 85, 247, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const datosGraficaProductos = useMemo(() => {
    if (!data) return null;

    return {
      labels: data.productosMasMovidos.map((item) => item.nombre),
      datasets: [
        {
          label: "Total movido",
          data: data.productosMasMovidos.map((item) => item.totalCantidad),
          backgroundColor: "rgba(17, 24, 39, 0.75)",
          borderColor: "rgba(17, 24, 39, 1)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [data]);

  const opcionesDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const opcionesBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

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
                Analytics
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
                Reportes
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
                Consulta métricas del inventario, analiza movimientos, filtra por
                fecha y exporta información clave para seguimiento operativo.
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
              Filtros
            </p>
            <h2
              style={{
                margin: "10px 0 0 0",
                fontSize: "30px",
                color: "#111827",
                fontWeight: 800,
              }}
            >
              Rango de fechas
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Aplica filtros para analizar el comportamiento del inventario en un
              periodo específico.
            </p>
          </div>

          <div
            style={{
              marginTop: "22px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "12px",
              alignItems: "end",
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
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
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
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
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

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={cargarReportes}
                style={{
                  background: "#111827",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Aplicar filtros
              </button>

              <button
                type="button"
                onClick={limpiarFiltros}
                style={{
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <section
            style={{
              background: "#ffffff",
              borderRadius: "28px",
              padding: "24px",
              border: "1px solid #fecaca",
              boxShadow: "0 8px 24px rgba(239,68,68,0.06)",
            }}
          >
            <div
              style={{
                borderRadius: "20px",
                padding: "18px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <p style={{ margin: 0, color: "#b91c1c", fontWeight: 800 }}>
                Error
              </p>
              <p style={{ margin: "8px 0 0 0", color: "#b91c1c", fontSize: "14px" }}>
                {error}
              </p>
            </div>
          </section>
        ) : null}

        {cargando ? (
          <section
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
            Cargando reportes...
          </section>
        ) : null}

        {data ? (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  padding: "22px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Movimientos
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#111827" }}>
                  {data.totalMovimientos}
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  padding: "22px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Entradas
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#166534" }}>
                  {data.totalEntradas}
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  padding: "22px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Salidas
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#1d4ed8" }}>
                  {data.totalSalidas}
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  padding: "22px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Ajustes
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#92400e" }}>
                  {data.totalAjustes}
                </p>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)",
                  borderRadius: "24px",
                  padding: "22px",
                  boxShadow: "0 6px 20px rgba(239,68,68,0.12)",
                  border: "1px solid #ef4444",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#991b1b", fontWeight: 700 }}>
                  Mermas
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#991b1b" }}>
                  {data.totalMermas}
                </p>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
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
                    Gráfica
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "28px",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    Distribución por tipo
                  </h2>
                </div>

                <div style={{ marginTop: "20px", height: "320px" }}>
                  {datosGraficaTipos ? (
                    <Doughnut data={datosGraficaTipos} options={opcionesDoughnut} />
                  ) : null}
                </div>
              </div>

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
                    Gráfica
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "28px",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    Resumen por motivo
                  </h2>
                </div>

                <div style={{ marginTop: "20px", height: "320px" }}>
                  {datosGraficaMotivos ? (
                    <Bar data={datosGraficaMotivos} options={opcionesBar} />
                  ) : null}
                </div>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
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
                    Resumen
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "28px",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    Resumen por tipo
                  </h2>
                </div>

                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data.resumenPorTipo.map((item) => (
                    <div
                      key={item.tipo}
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #e5e7eb",
                        padding: "16px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        background: "#f9fafb",
                      }}
                    >
                      <p style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
                        {item.tipo}
                      </p>
                      <p style={{ margin: 0, color: "#374151", fontWeight: 800, fontSize: "18px" }}>
                        {item.total}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

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
                    Resumen
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "28px",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    Resumen por motivo
                  </h2>
                </div>

                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data.resumenPorMotivo.map((item) => (
                    <div
                      key={item.motivo}
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #e5e7eb",
                        padding: "16px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        background: "#f9fafb",
                      }}
                    >
                      <p style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
                        {item.motivo}
                      </p>
                      <p style={{ margin: 0, color: "#374151", fontWeight: 800, fontSize: "18px" }}>
                        {item.total}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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
                  alignItems: "flex-end",
                  gap: "16px",
                  flexWrap: "wrap",
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
                    Ranking
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "30px",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    Productos más movidos
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    Productos con mayor movimiento en el rango seleccionado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportarReporteProductosMasMovidosCSV}
                  style={{
                    background: "#111827",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Exportar CSV
                </button>
              </div>

              {datosGraficaProductos && data.productosMasMovidos.length > 0 ? (
                <div style={{ marginTop: "24px", height: "380px" }}>
                  <Bar data={datosGraficaProductos} options={opcionesBar} />
                </div>
              ) : (
                <div
                  style={{
                    marginTop: "22px",
                    borderRadius: "20px",
                    padding: "18px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <p style={{ margin: 0, color: "#1d4ed8", fontWeight: 800 }}>
                    Sin movimientos
                  </p>
                  <p style={{ margin: "8px 0 0 0", color: "#2563eb", fontSize: "14px" }}>
                    No hay movimientos en el rango seleccionado.
                  </p>
                </div>
              )}

              {data.productosMasMovidos.length > 0 ? (
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {data.productosMasMovidos.map((producto, index) => (
                    <div
                      key={producto.productoId}
                      style={{
                        borderRadius: "22px",
                        border: "1px solid #e5e7eb",
                        padding: "18px",
                        background: "#f9fafb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
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
                          #{index + 1}
                        </p>
                        <h3
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "22px",
                            color: "#111827",
                            fontWeight: 800,
                          }}
                        >
                          {producto.nombre}
                        </h3>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          Categoría: {producto.categoria}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#3730a3",
                            borderRadius: "14px",
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          Total movido: {producto.totalCantidad}
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
                          Movimientos: {producto.totalMovimientos}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}