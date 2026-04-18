import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fail } from "@/server/utils/api";

const ADMIN_ROLE = "Admin";

/**
 * Kiểm tra session hiện tại có phải admin không.
 * Nếu không → throw { status, body } để route handler bắt.
 * Nếu có → trả về session (đã xác thực).
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw { status: 401, body: fail("Unauthorized", "UNAUTHORIZED") };
  }

  if (session.user.roles !== ADMIN_ROLE) {
    throw { status: 403, body: fail("Forbidden – admin only", "FORBIDDEN") };
  }

  return session;
}
