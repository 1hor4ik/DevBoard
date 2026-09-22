import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
  const session = await getSession(request.headers);

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/create-workspace" ||
    pathname.startsWith("/projects");

  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  if (!session?.user?.id && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
  }

  if (session?.user?.id && isAuthRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/create-workspace",
    "/sign-in",
    "/sign-up",
  ],
};
