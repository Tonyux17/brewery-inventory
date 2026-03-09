import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export default async function PaginaPanel() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/login");
  }

  const [productos, totalCategorias, movimientos] = await Promise.all([
    prisma.producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        nombre: "asc",
      },
    }),
    prisma.categoria.count(),
    prisma.movimientoInventario.findMany({
      include: {
        producto: true,
        usuario: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
      take: 5,
    }),
  ]);

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, producto) => acc + producto.stock, 0);

  const stockBajo = productos.filter(
    (producto) => producto.stock > 0 && producto.stock <= producto.stockMinimo
  );

  const agotados = productos.filter((producto) => producto.stock <= 0);

  const productosCriticos = [...agotados, ...stockBajo]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

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
                Dashboard
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
                Panel principal
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
                Bienvenido, {sesion.nombre}. Aquí puedes consultar el estado
                general del inventario, revisar alertas críticas y acceder a los
                módulos principales del sistema.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "20px",
                padding: "14px 16px",
                minWidth: "220px",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                Sesión activa
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              >
                {sesion.correo}
              </p>
            </div>
          </div>
        </section>

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
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Productos
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#111827" }}>
                  {totalProductos}
                </p>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "18px",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                📦
              </div>
            </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Categorías
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#111827" }}>
                  {totalCategorias}
                </p>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "18px",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🗂️
              </div>
            </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                  Stock total
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#111827" }}>
                  {stockTotal}
                </p>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "18px",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🏭
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              boxShadow: "0 6px 20px rgba(245,158,11,0.15)",
              border: "1px solid #f59e0b",
              background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#92400e", fontWeight: 700 }}>
                  Stock bajo
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#92400e" }}>
                  {stockBajo.length}
                </p>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ⚠️
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              boxShadow: "0 6px 20px rgba(239,68,68,0.16)",
              border: "1px solid #ef4444",
              background: "linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", color: "#991b1b", fontWeight: 700 }}>
                  Agotados
                </p>
                <p style={{ margin: "10px 0 0 0", fontSize: "38px", fontWeight: 800, color: "#991b1b" }}>
                  {agotados.length}
                </p>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ⛔
              </div>
            </div>
          </div>
        </section>

        {(agotados.length > 0 || stockBajo.length > 0) && (
          <section
            style={{
              background: "#ffffff",
              borderRadius: "28px",
              overflow: "hidden",
              border: "1px solid #fecaca",
              boxShadow: "0 8px 24px rgba(239,68,68,0.08)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(90deg, #fef2f2 0%, #fffbeb 100%)",
                borderBottom: "1px solid #fee2e2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "24px", color: "#991b1b", fontWeight: 800 }}>
                  Alerta de inventario
                </h2>
                <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#b91c1c" }}>
                  Hay productos que requieren atención inmediata.
                </p>
              </div>

              <Link
                href="/productos"
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "14px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                Ver productos
              </Link>
            </div>

            <div
              style={{
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              {productosCriticos.map((producto) => {
                const esAgotado = producto.stock <= 0;

                return (
                  <div
                    key={producto.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "18px",
                      border: esAgotado ? "1px solid #fca5a5" : "1px solid #fde68a",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827" }}>
                          {producto.nombre}
                        </h3>
                        <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                          {producto.categoria.nombre}
                        </p>
                      </div>

                      <span
                        style={{
                          background: esAgotado ? "#fee2e2" : "#fef3c7",
                          color: esAgotado ? "#991b1b" : "#92400e",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {esAgotado ? "Agotado" : "Stock bajo"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                      <span
                        style={{
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "12px",
                          padding: "8px 10px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        Stock: {producto.stock}
                      </span>
                      <span
                        style={{
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "12px",
                          padding: "8px 10px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        Mínimo: {producto.stockMinimo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
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
              <h2 style={{ margin: 0, fontSize: "28px", color: "#111827", fontWeight: 800 }}>
                Módulos
              </h2>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                Accede rápidamente a las secciones principales del sistema.
              </p>
            </div>

            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <Link
                href="/categorias"
                style={{
                  textDecoration: "none",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "20px",
                  color: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                      Categorías
                    </h3>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
                      Administra las categorías del sistema.
                    </p>
                  </div>
                  <div style={{ fontSize: "24px" }}>🗂️</div>
                </div>
              </Link>

              <Link
                href="/productos"
                style={{
                  textDecoration: "none",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "20px",
                  color: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                      Productos
                    </h3>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
                      Administra el inventario de productos.
                    </p>
                  </div>
                  <div style={{ fontSize: "24px" }}>📦</div>
                </div>
              </Link>

              <Link
                href="/movimientos"
                style={{
                  textDecoration: "none",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "20px",
                  color: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                      Movimientos
                    </h3>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
                      Registra entradas, salidas y ajustes.
                    </p>
                  </div>
                  <div style={{ fontSize: "24px" }}>🔄</div>
                </div>
              </Link>

              <Link
                href="/reportes"
                style={{
                  textDecoration: "none",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "20px",
                  color: "inherit",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                      Reportes
                    </h3>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
                      Consulta métricas, gráficas y exportaciones.
                    </p>
                  </div>
                  <div style={{ fontSize: "24px" }}>📊</div>
                </div>
              </Link>
            </div>

            <form action="/api/auth/logout" method="POST" style={{ marginTop: "24px" }}>
              <button
                type="submit"
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
                <h2 style={{ margin: 0, fontSize: "28px", color: "#111827", fontWeight: 800 }}>
                  Productos críticos
                </h2>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                  Productos con bajo inventario o agotados.
                </p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {stockBajo.length === 0 && agotados.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "20px",
                      padding: "18px",
                      background: "#ecfdf5",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <p style={{ margin: 0, color: "#166534", fontWeight: 800 }}>
                      Todo en orden
                    </p>
                    <p style={{ margin: "8px 0 0 0", color: "#15803d", fontSize: "14px" }}>
                      No hay productos con stock bajo por el momento.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[...agotados, ...stockBajo].slice(0, 6).map((producto) => {
                      const esAgotado = producto.stock <= 0;

                      return (
                        <div
                          key={producto.id}
                          style={{
                            borderRadius: "20px",
                            padding: "16px",
                            background: esAgotado ? "#fef2f2" : "#fffbeb",
                            border: esAgotado ? "1px solid #fecaca" : "1px solid #fde68a",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <h3 style={{ margin: 0, color: "#111827", fontWeight: 800, fontSize: "16px" }}>
                                {producto.nombre}
                              </h3>
                              <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                                {producto.categoria.nombre}
                              </p>
                            </div>

                            <span
                              style={{
                                background: esAgotado ? "#fee2e2" : "#fef3c7",
                                color: esAgotado ? "#991b1b" : "#92400e",
                                borderRadius: "999px",
                                padding: "6px 10px",
                                fontSize: "12px",
                                fontWeight: 800,
                              }}
                            >
                              {esAgotado ? "Agotado" : "Stock bajo"}
                            </span>
                          </div>

                          <p style={{ margin: "12px 0 0 0", fontSize: "14px", color: "#374151" }}>
                            Stock actual: <strong>{producto.stock}</strong> | Mínimo:{" "}
                            <strong>{producto.stockMinimo}</strong>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                <h2 style={{ margin: 0, fontSize: "28px", color: "#111827", fontWeight: 800 }}>
                  Últimos movimientos
                </h2>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                  Actividad reciente del inventario.
                </p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {movimientos.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    Aún no hay movimientos registrados.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {movimientos.map((movimiento) => (
                      <div
                        key={movimiento.id}
                        style={{
                          borderRadius: "20px",
                          padding: "16px",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0, color: "#111827", fontWeight: 800, fontSize: "16px" }}>
                              {movimiento.producto.nombre}
                            </h3>
                            <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#4b5563" }}>
                              {movimiento.tipo} - {movimiento.motivo} - Cantidad:{" "}
                              {movimiento.cantidad}
                            </p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                              Registrado por: {movimiento.usuario.nombre}
                            </p>
                          </div>

                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            {new Date(movimiento.creadoEn).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}