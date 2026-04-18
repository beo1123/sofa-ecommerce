// app/layout.tsx
import "./globals.css"; // adjust path if you keep global css elsewhere
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { baseMetadata } from "@/seo/baseMetadata";
import { prisma } from "@/lib/prisma";
import { buildSiteNavigationSchema, organizationSchema, websiteSchema } from "@/seo/schema";

export const metadata: Metadata = baseMetadata;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      slug: true,
    },
  });

  const siteNavigationSchema = buildSiteNavigationSchema(categories);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema, organizationSchema, siteNavigationSchema]),
          }}
        />
        <ReduxProvider>
          <ReactQueryProvider>
            {children}
            <Analytics />
          </ReactQueryProvider>
        </ReduxProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
