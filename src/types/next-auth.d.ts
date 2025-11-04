/* eslint-disable unused-imports/no-unused-imports */
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | number;
      roles?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string | number;
    roles?: string;
  }
}
