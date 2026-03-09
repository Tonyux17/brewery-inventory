"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaginaLogin() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setCargando(true);

      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          password: contrasena,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }

      router.push("/panel");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #1f2937 0%, #111827 35%, #f3f4f6 35%, #f9fafb 100%)",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "1fr 460px",
          gap: "28px",
          alignItems: "stretch",
        }}
      >
        <section
          style={{
            borderRadius: "30px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
            color: "#ffffff",
            boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "620px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#cbd5e1",
                fontWeight: 700,
              }}
            >
              Brewery Inventory
            </p>

            <h1
              style={{
                margin: "18px 0 0 0",
                fontSize: "56px",
                lineHeight: 1.02,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Sistema de inventario para cervecería
            </h1>

            <p
              style={{
                margin: "22px 0 0 0",
                maxWidth: "560px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#d1d5db",
              }}
            >
              Controla productos, movimientos, reportes y alertas de stock
              desde un panel administrativo moderno, claro y profesional.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "16px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "24px" }}>📦</div>
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Productos
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                Control del catálogo y stock.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "16px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "24px" }}>🔄</div>
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Movimientos
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                Entradas, salidas y ajustes.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "16px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "24px" }}>📊</div>
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Reportes
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                Métricas y exportaciones.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "30px",
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
            border: "1px solid #e5e7eb",
            padding: "34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "620px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9ca3af",
                fontWeight: 700,
              }}
            >
              Acceso
            </p>

            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "38px",
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Iniciar sesión
            </h2>

            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "15px",
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Ingresa con tu cuenta para acceder al panel de administración del
              inventario.
            </p>
          </div>

          <form
            onSubmit={manejarSubmit}
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
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
                Correo
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="admin@cerveceria.com"
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px solid #d1d5db",
                  padding: "14px 16px",
                  fontSize: "15px",
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
                Contraseña
              </label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px solid #d1d5db",
                  padding: "14px 16px",
                  fontSize: "15px",
                  color: "#111827",
                  background: "#ffffff",
                  outline: "none",
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
              disabled={cargando}
              style={{
                marginTop: "4px",
                width: "100%",
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "16px",
                padding: "15px 18px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "pointer",
                opacity: cargando ? 0.75 : 1,
                boxShadow: "0 12px 24px rgba(17,24,39,0.18)",
              }}
            >
              {cargando ? "Entrando..." : "Entrar al sistema"}
            </button>
          </form>

          <div
            style={{
              marginTop: "26px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <span>Acceso administrativo</span>
              <span style={{ fontWeight: 700, color: "#374151" }}>
                Inventario cervecero
              </span>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Mantén control sobre productos, stock, movimientos y reportes en
              una sola plataforma.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}