import { NextResponse } from "next/server";

function crearRespuestaLogout(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set("sesion", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export async function POST(request: Request) {
  return crearRespuestaLogout(request);
}

export async function GET(request: Request) {
  return crearRespuestaLogout(request);
}