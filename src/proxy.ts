import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const roleRoutes: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/staff", roles: ["STAFF", "ADMIN"] },
  { prefix: "/doctor", roles: ["DOCTOR", "ADMIN"] },
  { prefix: "/dat-lich", roles: ["PATIENT"] },
  { prefix: "/lich-hen-cua-toi", roles: ["PATIENT"] },
  { prefix: "/ho-so-benh-an", roles: ["PATIENT"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const match = roleRoutes.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const role = req.auth?.user?.role;

  if (!role) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (!match.roles.includes(role)) {
    const homeUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/doctor/:path*",
    "/dat-lich/:path*",
    "/lich-hen-cua-toi/:path*",
    "/ho-so-benh-an/:path*",
  ],
};
