import { PrismaClient } from "../../generated/prisma_client";
import { fail, ok } from "@/server/utils/api";
import { SignupInput } from "@/types/auth/signup";
import { compare, hash } from "bcryptjs";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  private async ensureCustomerRole(userId: number) {
    const role = await this.prisma.role.upsert({
      where: { name: "Khách hàng" },
      update: {},
      create: { name: "Khách hàng" },
    });
    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  async signup(input: SignupInput) {
    const { email, password, displayName } = input;

    if (!email || !password) throw { status: 400, body: fail("Missing email/password", "VALIDATION_ERROR") };

    const existing = await this.getUserByEmail(email);

    if (existing) throw { status: 400, body: fail("Email already registered", "DUPLICATE_EMAIL") };

    const hashed = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, displayName: displayName ?? email.split("@")[0] },
    });

    await this.ensureCustomerRole(user.id);

    return ok({ id: user.id, email: email });
  }

  async verifyCredentials(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      throw {
        status: 401,
        body: fail("Sai email hoặc mật khẩu", "INVALID_CREDENTIALS"),
      };
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw {
        status: 401,
        body: fail("Sai email hoặc mật khẩu", "INVALID_CREDENTIALS"),
      };
    }
    this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => {});
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles[0]?.role.name,
    };
  }
}
