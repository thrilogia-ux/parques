import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = "admin_session";

export function middleware(req: NextRequest) {
  if (!ADMIN_PASSWORD) return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();
  if (path === "/admin/login") return NextResponse.next();
  if (req.cookies.get(COOKIE_NAME)?.value) return NextResponse.next();
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", path);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
