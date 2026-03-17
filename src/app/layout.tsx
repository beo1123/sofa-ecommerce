// app/layout.tsx
import "./globals.css"; // adjust path if you keep global css elsewhere
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { baseMetadata } from "@/seo/baseMetadata";
import { organizationSchema, websiteSchema } from "@/seo/schema";

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema, organizationSchema]),
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
