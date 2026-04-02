import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

                try {
                    const res = await fetch(`${baseUrl}/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        }),
                    });

                    const data = await res.json();

                    if (res.ok && data.token) {
                        // Standard NextAuth user object
                        return {
                            id: data.user.id.toString(),
                            name: data.user.name,
                            email: data.user.email,
                            accessToken: data.token,
                            user: data.user
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.user = (user as any).user;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).user = token.user;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "y0ur_sup3r_s3cr3t_k3y_h3r3",
};
