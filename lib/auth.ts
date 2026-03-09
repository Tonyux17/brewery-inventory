import "dotenv/config";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET no está definida en el archivo .env");
}

const secretKey = new TextEncoder().encode(SECRET);

export type PayloadSesion = {
  id: string;
  correo: string;
  rol: string;
  nombre: string;
};

export async function crearToken(payload: PayloadSesion) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verificarToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as PayloadSesion;
}

export async function guardarSesion(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("sesion", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function eliminarSesion() {
  const cookieStore = await cookies();

  cookieStore.set("sesion", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function obtenerSesion() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sesion")?.value;

  if (!token) return null;

  try {
    return await verificarToken(token);
  } catch {
    return null;
  }
}