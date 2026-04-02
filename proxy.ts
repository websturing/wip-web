import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const proxyMiddleware = withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/login");
        const isRoot = req.nextUrl.pathname === "/";

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
            return null;
        }

        if (isRoot) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    },
    {
        callbacks: {
            async authorized() {
                return true;
            },
        },
    }
);

// In Next.js 16+, 'middleware' is renamed to 'proxy'
export const proxy = proxyMiddleware;

export const config = {
    matcher: ["/", "/admin/:path*", "/login", "/dashboard/:path*"],
};
