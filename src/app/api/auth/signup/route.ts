import { normalizeError, validateRequest } from "@/server/utils/api";
import { PrismaClient } from "../../../../../generated/prisma_client";
import { AuthService } from "@/services/auth.service";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    validateRequest(body, { email: "string", password: "string" });
    const res = await authService.signup(body);
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
