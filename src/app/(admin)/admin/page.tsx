"use client";

import React from "react";
import Link from "next/link";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import { Package, FileText, Upload, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  {
    title: "Sản phẩm",
    description: "Quản lý danh sách sản phẩm, thêm mới, chỉnh sửa hoặc import từ Excel.",
    href: "/admin/products",
    icon: Package,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Bài viết",
    description: "Quản lý blog, tạo bài viết mới, chỉnh sửa nội dung.",
    href: "/admin/articles",
    icon: FileText,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Upload ảnh",
    description: "Upload hình ảnh lên Cloudinary CDN để sử dụng cho sản phẩm & bài viết.",
    href: "/admin/products/new",
    icon: Upload,
    color: "bg-purple-50 text-purple-600",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <Heading level={2}>Dashboard</Heading>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card variant="elevated" hoverable className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--color-text-muted)] mb-3">{item.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-300)]">
                    Truy cập <ArrowRight size={14} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
