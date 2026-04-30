// lib/authOptions.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";
import { compare } from "bcryptjs";

async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: true } } },
  });
  if (!user?.password) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const valid = await compare(password, user.password);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }
  prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => {});
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles: user.userRoles[0]?.role.name,
  };
}

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
          const user = await verifyCredentials(creds.email, creds.password);
          return {
            id: String(user.id),
            email: user.email,
            name: user.displayName,
            roles: user.roles,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
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
