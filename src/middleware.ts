import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mas-cafe-admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminAuthed = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);

  if (isAdminRoute && !isAdminLogin && !isAdminAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminLogin && isAdminAuthed) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
