"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaginaEditarCategoria() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function cargarCategoria() {
    try {
      setCargando(true);

      const respuesta = await fetch(`/api/categorias/${id}`);
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || "No se pudo cargar la categoría");
      }

      setNombre(data.nombre || "");
      setDescripcion(data.descripcion || "");
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los datos de la categoría");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (id) {
      cargarCategoria();
    }
  }, [id]);

  async function manejarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setGuardando(true);

      const respuesta = await fetch(`/api/categorias/${id}`, {
        method: "PUT",
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
        setError(data.error || "No se pudo actualizar la categoría");
        return;
      }

      router.push("/categorias");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al actualizar la categoría");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <p className="text-gray-600">Cargando categoría...</p>
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
                Editar categoría
              </h1>
              <p className="mt-2 text-gray-600">
                Modifica la información de la categoría seleccionada.
              </p>
            </div>

            <Link
              href="/categorias"
              className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Volver a categorías
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
                rows={5}
              />
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