"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaginaRegistro() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          correo,
          password,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo registrar el usuario");
        return;
      }

      setMensaje("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      setNombre("");
      setCorreo("");
      setPassword("");
      setConfirmarPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al registrar el usuario");
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
            minHeight: "680px",
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
              Crear nueva cuenta
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
              Registra un usuario para acceder al sistema de inventario de la
              cervecería y administrar productos, movimientos y reportes.
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
              }}
            >
              <div style={{ fontSize: "24px" }}>📦</div>
              <p style={{ margin: "10px 0 0 0", fontSize: "14px", fontWeight: 700 }}>
                Productos
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
                Control del catálogo y stock.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "24px" }}>🔄</div>
              <p style={{ margin: "10px 0 0 0", fontSize: "14px", fontWeight: 700 }}>
                Movimientos
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
                Entradas, salidas y ajustes.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "22px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "24px" }}>📊</div>
              <p style={{ margin: "10px 0 0 0", fontSize: "14px", fontWeight: 700 }}>
                Reportes
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
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
            minHeight: "680px",
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
              Registro
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
              Crear usuario
            </h2>

            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "15px",
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Completa los datos para registrar un nuevo acceso al sistema.
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
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Administrador"
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
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
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
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
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

            {mensaje ? (
              <div
                style={{
                  borderRadius: "16px",
                  background: "#ecfdf5",
                  border: "1px solid #bbf7d0",
                  padding: "12px 14px",
                  color: "#166534",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {mensaje}
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
              {cargando ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "18px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "#111827", fontWeight: 700 }}>
              Inicia sesión
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}