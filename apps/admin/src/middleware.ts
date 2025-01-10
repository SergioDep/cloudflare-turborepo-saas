import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/server/auth";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGGEDIN_REDIRECT,
  publicRoutes,
} from "@/modules/base/lib/config/routes";

export default auth((request) => {
  const { nextUrl } = request;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  let response = NextResponse.next();

  if (isApiAuthRoute) {
    // response = NextResponse.next();
  } else {
    const user = request.auth?.user;

    if (isAuthRoute) {
      if (user) {
        response = NextResponse.redirect(
          new URL(DEFAULT_LOGGEDIN_REDIRECT, nextUrl.origin),
        );
      }
    } else if (!isPublicRoute) {
      if (!user) {
        // Tried to access a protected route without being logged in
        response = NextResponse.redirect(new URL(`/login`, nextUrl.origin));
        // }
      } else {
        // Business specific logic for checking user permissions maybe?
      }
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
