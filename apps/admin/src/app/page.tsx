import { prisma } from "@repo/db";

// ── Example: Server Component using shared Prisma ─────────
// This demonstrates how apps/admin uses @repo/db directly.
// The admin dashboard runs on port 3001 (`next dev --port 3001`).

export default async function AdminDashboardPage() {
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: "#555" }}>
        Connected to NeonDB via <code>@repo/db</code>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <StatCard label="Products" value={productCount} />
        <StatCard label="Orders" value={orderCount} />
        <StatCard label="Users" value={userCount} />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    >
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>{label}</p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: 700 }}>{value}</p>
    </div>
  );
}
