"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type ReviewItem = {
  id: number;
  rating: number;
  title?: string | null;
  body?: string | null;
  createdAt?: string | Date;
};

type ProductDescriptionProps = {
  description?: string;
  shortDescription?: string;
  reviews?: ReviewItem[];
};

export function ProductDescription({ description, shortDescription, reviews = [] }: ProductDescriptionProps) {
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  return (
    <section className="mt-8 sm:mt-10 lg:mt-14">
      <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)] overflow-hidden">
        {/* Header / Tab Navigation */}
        <div className="border-b border-[var(--color-brand-50)] bg-[var(--color-bg-muted)]/60 p-4 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-300)]">
              Chi tiết chế tác
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-[var(--color-text-default)]">
              Thông tin & Mô tả sản phẩm
            </h2>
          </div>

          {hasReviews && (
            <div className="inline-flex w-full sm:w-auto rounded-full bg-[var(--color-bg-page)] p-1 ring-1 ring-[var(--color-brand-50)]">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`flex-1 sm:flex-initial text-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "description"
                    ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
                }`}>
                Mô tả sản phẩm
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 sm:flex-initial text-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
                }`}>
                Đánh giá ({reviews.length})
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-10">
          {activeTab === "description" || !hasReviews ? (
            <div className="tiptap-editor-content rich-html-content max-w-none text-[var(--color-text-default)] leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: description || shortDescription || "Chưa có mô tả chi tiết cho sản phẩm này.",
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl bg-[var(--color-bg-muted)] p-4 sm:p-5 ring-1 ring-[var(--color-brand-50)] space-y-2">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        fill={i < review.rating ? "var(--color-brand-300)" : "transparent"}
                        stroke="var(--color-brand-300)"
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h3 className="text-base font-semibold text-[var(--color-text-default)]">{review.title}</h3>
                  )}
                  {review.body && <p className="text-sm text-[var(--color-text-muted)]">{review.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
