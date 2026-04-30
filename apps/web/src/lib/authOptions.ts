// lib/authOptions.ts
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import { sdk } from "@repo/sdk";

export const authOptions: NextAuthOptions = {
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
          const user = await sdk.auth.login({
            email: creds.email,
            password: creds.password,
          });
          return {
            id: String(user.id),
            email: user.email,
            name: user.displayName,
            roles: user.roles ?? "",
          };
        } catch (err) {
          if (err instanceof Error && err.message.includes("Sai email hoặc mật khẩu")) {
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
