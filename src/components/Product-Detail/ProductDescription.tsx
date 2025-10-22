"use client";

import { useState } from "react";

type ProductDescriptionProps = {
  description?: string;
  shortDescription?: string;
};

export function ProductDescription({ description, shortDescription }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  return (
    <section className="mt-8 lg:mt-12">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex-1 py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                activeTab === "description"
                  ? "bg-[var(--color-brand-400)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-gray-100"
              }`}>
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                activeTab === "specs"
                  ? "bg-[var(--color-brand-400)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-gray-100"
              }`}>
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                activeTab === "reviews"
                  ? "bg-[var(--color-brand-400)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-gray-100"
              }`}>
              Đánh giá
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 lg:p-8">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: description || shortDescription || "Chưa có mô tả sản phẩm.",
                }}
              />
            </div>
          )}

          {activeTab === "specs" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
              <div className="grid gap-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-[var(--color-text-muted)]">Chất liệu:</span>
                  <span className="font-medium">Da cao cấp / Vải bọc</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-[var(--color-text-muted)]">Kích thước:</span>
                  <span className="font-medium">M (200x150cm) / L (250x180cm)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-[var(--color-text-muted)]">Xuất xứ:</span>
                  <span className="font-medium">Việt Nam</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-[var(--color-text-muted)]">Bảo hành:</span>
                  <span className="font-medium">24 tháng</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-lg">Chưa có đánh giá nào cho sản phẩm này.</p>
              <button className="mt-4 px-6 py-2 bg-[var(--color-brand-400)] text-white rounded-lg hover:bg-[var(--color-brand-300)] transition-colors">
                Viết đánh giá đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
