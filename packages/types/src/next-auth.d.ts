/* eslint-disable unused-imports/no-unused-imports */
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string; // ✅ string (1 role)
  }
}
