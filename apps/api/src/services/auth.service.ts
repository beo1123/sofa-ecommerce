import { prisma } from "@repo/db";
import { compare, hash } from "bcryptjs";
import { fail } from "../lib/response.js";

export class AuthService {
  async signup(input: { email?: string; password?: string; displayName?: string | null }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const displayName = input.displayName?.trim() || null;

    if (!email || !password) {
      throw { status: 400, body: fail("Missing email/password", "VALIDATION_ERROR") };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw { status: 400, body: fail("Email already registered", "DUPLICATE_EMAIL") };
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName ?? email.split("@")[0],
      },
      select: { id: true, email: true, displayName: true },
    });

    const role = await prisma.role.upsert({
      where: { name: "Khách hàng" },
      update: {},
      create: { name: "Khách hàng" },
      select: { id: true },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    return user;
  }

  async login(input: { email?: string; password?: string }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      throw { status: 400, body: fail("Missing email/password", "VALIDATION_ERROR") };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user?.password) {
      throw { status: 401, body: fail("Sai email hoặc mật khẩu", "INVALID_CREDENTIALS") };
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw { status: 401, body: fail("Sai email hoặc mật khẩu", "INVALID_CREDENTIALS") };
    }

    prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => {});

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles[0]?.role.name,
    };
  }
}

export const authService = new AuthService();
