import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** §18 route aliases — SRS /dashboard/* → /portal/* without duplicating apps. */
const REDIRECTS: Record<string, string> = {
  "/dashboard": "/portal",
  "/dashboard/profile": "/portal/profile",
  "/dashboard/downloads": "/portal/downloads",
  "/dashboard/requests": "/portal/requests",
  "/dashboard/uploads": "/portal/uploads",
  "/dashboard/subscription": "/portal/subscription",
  "/dashboard/payments": "/portal/payments",
  "/dashboard/support": "/portal/support",
  "/dashboard/notifications": "/portal/notifications",
  "/upload": "/portal/uploads",
  "/request": "/portal/requests",
  "/admin/tickets": "/admin/support",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (REDIRECTS[pathname]) {
    const url = req.nextUrl.clone();
    url.pathname = REDIRECTS[pathname];
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard/")) {
    const url = req.nextUrl.clone();
    url.pathname = `/portal/${pathname.slice("/dashboard/".length)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  const origin = req.headers.get("origin");
  const allow = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim());
  if (origin && allow.includes(origin) && pathname.startsWith("/api/")) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
