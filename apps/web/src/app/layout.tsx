// app/layout.tsx
import "./globals.css"; // adjust path if you keep global css elsewhere
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  buildOrganizationSchema,
  buildSiteNavigationSchema,
  buildWebsiteSchema,
  generateBaseMetadata,
} from "@repo/seo";
import { sdk } from "@repo/sdk";

export const dynamic = "force-dynamic";
export const metadata: Metadata = generateBaseMetadata();

export default async function RootLayout({ children }: { children: ReactNode }) {
  const categories = await sdk.categories.getAll().catch(() => []);

  const siteNavigationSchema = buildSiteNavigationSchema(categories);
  const websiteSchema = buildWebsiteSchema();
  const organizationSchema = buildOrganizationSchema();

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
