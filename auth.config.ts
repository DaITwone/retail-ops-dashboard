import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const protectedRoutes = [
        "/dashboard",
        "/inventory",
        "/orders",
        "/staff",
        "/cancellations",
        "/waste"
      ];
      const isOnProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route),
      );

      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

/**
 * auth.config.ts -> Authorization
 * - authorize() -> Cho vào/chặn route
 * - pages.signIn -> redirect khi chưa login
 * - không tự chạy phải có proxy.ts lúc này authorize() mới được gọi.
 */
