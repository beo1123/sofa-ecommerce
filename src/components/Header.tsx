// components/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  cartCount?: number;
};

export default function Header({ cartCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    // lock body scroll while sidebar open
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-50 border-b border-[var(--color-brand-50)] bg-[var(--color-bg-page)]">
      {/* Top small bar (optional) */}
      <div className="hidden sm:block bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="text-xs">
            Miễn phí giao hàng cho đơn hàng trên 2,000,000₫
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-[var(--color-brand-300)]">
              Hỗ trợ
            </Link>
            <Link
              href="/account"
              className="hover:text-[var(--color-brand-300)]"
            >
              Tài khoản
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
        {/* LOGO (left) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-400)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  d="M3 10v6a1 1 0 0 0 1 1h1v2h2v-2h10v2h2v-2h1a1 1 0 0 0 1-1v-6H3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10V7a5 5 0 1 1 10 0v3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="ml-1 text-lg font-semibold text-[var(--color-text-default)]">
              Nội Thất
            </span>
          </Link>
        </div>

        {/* SEARCH (desktop center) */}
        <div className="hidden lg:flex flex-1 px-6">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              aria-label="Tìm kiếm sản phẩm"
              className="w-full rounded-full border-2 border-[var(--color-brand-50)] bg-white px-5 py-2.5 pr-12 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-100)]"
            />
            <button
              aria-label="Tìm"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => {
                /* xử lý tìm kiếm hoặc redirect */
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--color-text-default)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* NAV + ICONS (right) */}
        <div className="ml-auto flex items-center gap-4">
          {/* Desktop nav (visible from lg) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--color-text-default)] mr-4">
            <Link href="/" className="hover:text-[var(--color-brand-300)]">
              Trang Chủ
            </Link>
            <Link href="/shop" className="hover:text-[var(--color-brand-300)]">
              Sản Phẩm
            </Link>
            <Link href="/about" className="hover:text-[var(--color-brand-300)]">
              Giới Thiệu
            </Link>
            <Link href="/news" className="hover:text-[var(--color-brand-300)]">
              Tin Tức
            </Link>
            <Link
              href="/contact"
              className="hover:text-[var(--color-brand-300)]"
            >
              Liên Hệ
            </Link>
          </nav>

          {/* Desktop User section (visible md+) */}
          <div className="hidden md:flex items-center gap-3 pr-2 border-r border-transparent md:border-[var(--color-brand-50)]">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-400)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 7.5A3.75 3.75 0 1 1 8.25 7.5a3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0"
                />
              </svg>
            </div>
            <div className="text-sm">
              <div className="font-medium text-[var(--color-text-default)]">
                Xin chào, Khách
              </div>
              <Link
                href="/account"
                className="text-[var(--color-brand-300)] text-xs"
              >
                Đăng nhập / Đăng ký
              </Link>
            </div>
          </div>

          {/* Icons group */}
          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="hidden md:inline-flex p-2 rounded-full hover:bg-[var(--color-bg-muted)]"
              aria-label="Yêu thích"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--color-text-default)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                />
              </svg>
            </Link>

            <Link
              href="/compare"
              className="hidden md:inline-flex p-2 rounded-full hover:bg-[var(--color-bg-muted)]"
              aria-label="So sánh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--color-text-default)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h4l3 9 4-18 3 9h4"
                />
              </svg>
            </Link>

            {/* Cart (always visible) */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-[var(--color-bg-muted)]"
              aria-label="Giỏ hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[var(--color-text-default)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 6h13"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-brand-300)] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile sidebar toggle (right side) */}
            <button
              onClick={() => setOpen(true)}
              className="ml-1 p-2 rounded-md lg:hidden"
              aria-label="Mở menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[var(--color-text-default)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar + overlay */}
      <div aria-hidden={!open}>
        {/* Overlay */}
        <div
          onClick={() => setOpen(false)}
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />

        {/* Sidebar: fixed, full-height, width ~75% (max 420px), slide from right */}
        <aside
          className={`fixed top-0 right-0 h-full w-[75vw] max-w-[420px] bg-[var(--color-bg-page)] z-50 transform offcanvas ${open ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Sidebar header */}
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-400)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      d="M3 10v6a1 1 0 0 0 1 1h1v2h2v-2h10v2h2v-2h1a1 1 0 0 0 1-1v-6H3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10V7a5 5 0 1 1 10 0v3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-lg font-semibold">Nội Thất</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="p-2 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[var(--color-text-default)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* User area */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-400)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5A3.75 3.75 0 1 1 8.25 7.5a3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-default)]">
                  Xin chào, Khách
                </div>
                <div className="mt-1 flex gap-3">
                  <Link
                    href="/account/login"
                    onClick={() => setOpen(false)}
                    className="text-[var(--color-brand-300)]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setOpen(false)}
                    className="text-[var(--color-text-muted)]"
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>

            {/* Search in sidebar */}
            <div className="p-4 border-b">
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-full border px-4 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-100)]"
              />
            </div>

            {/* Menu links */}
            <nav className="p-6 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-5 text-lg">
                <li>
                  <Link href="/" onClick={() => setOpen(false)}>
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link href="/shop" onClick={() => setOpen(false)}>
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link href="/about" onClick={() => setOpen(false)}>
                    Giới Thiệu
                  </Link>
                </li>
                <li>
                  <Link href="/news" onClick={() => setOpen(false)}>
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={() => setOpen(false)}>
                    Liên Hệ
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Bottom actions */}
            <div className="p-6 border-t flex flex-col gap-3">
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="text-sm"
              >
                Yêu thích
              </Link>
              <Link
                href="/compare"
                onClick={() => setOpen(false)}
                className="text-sm"
              >
                So sánh
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="text-sm"
              >
                Giỏ hàng ({cartCount})
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
