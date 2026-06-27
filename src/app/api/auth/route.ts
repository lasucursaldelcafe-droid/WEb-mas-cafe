import { NextResponse } from "next/server";
import { AUTH_COOKIE, createSessionValue } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña requeridos" },
      { status: 400 },
    );
  }

  const session = await createSessionValue(username, password);
  if (!session) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, username: session });
  response.cookies.set(AUTH_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
