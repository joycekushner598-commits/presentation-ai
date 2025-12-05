import { auth } from "@/server/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 开发模式：跳过认证检查
  const isDevelopment = process.env.NODE_ENV === "development";
  const skipAuth = process.env.SKIP_AUTH === "true";
  
  if (isDevelopment || skipAuth) {
    // 开发模式下直接放行，跳过所有认证检查
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/presentation", request.url));
    }
    return NextResponse.next();
  }

  const session = await auth();
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  // Always redirect from root to /presentation
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // If user is on auth page but already signed in, redirect to home page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!session && !isAuthPage && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
