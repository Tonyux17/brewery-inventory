import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const loginUrl = new URL("/login", request.url);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    return NextResponse.json(
      { error: "No se pudo cerrar sesión" },
      { status: 500 }
    );
  }
}