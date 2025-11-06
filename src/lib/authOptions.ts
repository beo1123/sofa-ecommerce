// lib/authOptions.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/services/auth.service";
import { Adapter } from "next-auth/adapters";

const authService = new AuthService(prisma);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email: {}, password: {} },
      async authorize(creds): Promise<User | null> {
        if (!creds?.email || !creds?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        try {
          const user = await authService.verifyCredentials(creds.email, creds.password);
          return {
            id: String(user.id),
            email: user.email,
            name: user.displayName,
            roles: user.roles,
          };
        } catch (err: any) {
          if (err.body?.error?.code === "INVALID_CREDENTIALS") {
            throw new Error("Sai email hoặc mật khẩu");
          }
          throw new Error("Đăng nhập thất bại, vui lòng thử lại sau");
        }
      },
    }),
  ],
  pages: {
    signIn: "/dang-nhap",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};
