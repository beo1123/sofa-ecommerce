import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient as CustomPrismaClient } from "../../../../../generated/prisma_client";
import { PrismaClient as DefaultPrismaClient } from "@prisma/client";
import { AuthService } from "@/services/auth.service";

const prisma = new CustomPrismaClient();
const authService = new AuthService(prisma);

const adapterPrisma = new DefaultPrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(adapterPrisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
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
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.roles = (user as any).roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        roles: token.roles,
      } as any;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
