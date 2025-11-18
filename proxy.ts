import { NextResponse } from "next/server";
import { server_base_url } from "./constant/server-constants";

export default async function proxy(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const publicPaths = ["/", "/sign-in", "/_next", "/favicon.ico", "/public", "/api"];
  
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookie = request.headers.get("Cookie") ?? "";
  console.log('Middleware - Cookie present:', !!cookie);
  console.log('Middleware - Calling API:', `${server_base_url}/users/me`);

  try {
    const res = await fetch(`${server_base_url}/api/v1/users/me`, {
      method: "GET",
      headers: { 
        Cookie: cookie,
        "Content-Type": "application/json"
      },
      credentials: "include",
      cache: "no-store",
    });

    console.log('Middleware - Response status:', res.status);
    console.log('Middleware - Response ok:', res.ok);

    if (!res.ok) {
      console.log('Middleware - Auth failed, redirecting to sign-in');
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Get raw text first to see what's actually returned
    const rawText = await res.text();
    console.log('Middleware - Raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Middleware - Parsed data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('Middleware - JSON parse error:', parseError);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // Check response structure
    if (!data || !data.success || !data.data || !data.data.role) {
      console.log('Middleware - Invalid response structure:', {
        hasData: !!data,
        hasSuccess: data?.success,
        hasDataProp: !!data?.data,
        hasRole: data?.data?.role
      });
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const user = data.data;
    const userRole = user.role;

    console.log('Middleware - User Role:', userRole);
    console.log('Middleware - Pathname:', pathname);

    // Role-based access control
    if (pathname.startsWith("/super-admin") && userRole !== "super-admin") {
      console.log('Middleware - Redirecting to:', `/${userRole}/dashboard`);
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }

    if (pathname.startsWith("/branch-admin") && userRole !== "branch-admin") {
      console.log('Middleware - Redirecting to:', `/${userRole}/dashboard`);
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }

    // If user tries to access a protected route without specific role prefix
    const hasRolePrefix = pathname.startsWith("/super-admin") || 
                         pathname.startsWith("/branch-admin") || 
                         pathname.startsWith("/staff");

    if (!hasRolePrefix && userRole) {
      console.log('Middleware - No role prefix, redirecting to:', `/${userRole}/dashboard`);
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }

    console.log('Middleware - Access granted to:', pathname);
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware - Network error:', error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$|api).*)",
  ],
};