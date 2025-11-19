"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Heart, BarChart3 } from "lucide-react";
import MiniCartDrawer from "./cart/MiniCartDrawer";
import { useAppSelector } from "@/store/hook";
import { selectCartItemCount } from "@/store/selector/cartSelectors";
import SearchBox from "./Header/SearchBox";
import HeaderUser from "./Header/HeaderUser";
import HeaderUserMobile from "./Header/HeaderUserMobile";
import { SafeImage } from "./ui/SafeImage";

/**
 * Header.tsx — Responsive cho mọi màn hình, giữ nguyên nội dung & màu sắc gốc
 *
 * Responsive breakpoints:
 * - xs: < 640px (mobile nhỏ)
 * - sm: ≥640px (mobile lớn)
 * - md: ≥768px (tablet)
 * - lg: ≥1024px (desktop nhỏ)
 * - xl: ≥1280px (desktop lớn)
 *
 * Các phần ẩn/hiện:
 * - Top bar: hidden md:block
 * - Desktop nav: hidden lg:flex
 * - Desktop search: hidden lg:flex
 * - User profile: hidden xl:flex
 * - Wishlist/Compare icons: hidden sm:flex
 * - Mobile menu: lg:hidden
 * - Mobile search: lg:hidden
 * - Sidebar: lg:hidden (full responsive với calc width cho scrollbar)
 */

const navLinks = [
  { href: "/", label: "Trang Chủ" },
  { href: "/san-pham", label: "Sản Phẩm" },
  { href: "/gioi-thieu", label: "Giới Thiệu" },
  { href: "/news", label: "Tin Tức" },
  { href: "/contact", label: "Liên Hệ" },
];

/* Framer motion variants */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.28 },
  }),
};

/* Hook lock scroll */
function useLockBodyScroll(active: boolean) {
  const prevRef = useRef<{
    bodyOverflow: string;
    docOverflow: string;
    bodyPaddingRight: string;
    docPaddingRight: string;
  } | null>(null);

  useEffect(() => {
    const body = document.body;
    const doc = document.documentElement;

    if (active) {
      prevRef.current = {
        bodyOverflow: body.style.overflow,
        docOverflow: doc.style.overflow,
        bodyPaddingRight: body.style.paddingRight || "",
        docPaddingRight: doc.style.paddingRight || "",
      };

      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
        doc.style.paddingRight = `${scrollBarWidth}px`;
      }

      body.style.overflow = "hidden";
      doc.style.overflow = "hidden";

      doc.classList.add("menu-open");
      body.classList.add("menu-open");
    } else {
      if (prevRef.current) {
        body.style.overflow = prevRef.current.bodyOverflow;
        doc.style.overflow = prevRef.current.docOverflow;
        body.style.paddingRight = prevRef.current.bodyPaddingRight;
        doc.style.paddingRight = prevRef.current.docPaddingRight;
        prevRef.current = null;
      }
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
    }

    return () => {
      if (prevRef.current) {
        body.style.overflow = prevRef.current.bodyOverflow;
        doc.style.overflow = prevRef.current.docOverflow;
        body.style.paddingRight = prevRef.current.bodyPaddingRight;
        doc.style.paddingRight = prevRef.current.docPaddingRight;
        prevRef.current = null;
      }
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
    };
  }, [active]);
}

export default function Header() {
  const cartCount = useAppSelector(selectCartItemCount);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const computeWidth = () => {
      const width = window.innerWidth - document.documentElement.clientWidth;
      setScrollBarWidth(width > 0 ? width : 0);
    };
    computeWidth();
    window.addEventListener("resize", computeWidth);
    return () => window.removeEventListener("resize", computeWidth);
  }, []);

  useLockBodyScroll(isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  const sidebarWidth = scrollBarWidth > 0 ? `calc(85vw + ${scrollBarWidth}px)` : "85vw";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Top Bar - Responsive: Hidden on mobile/tablet (xs, sm, md) */}
        <div className="hidden md:block bg-[var(--color-bg-muted)] border-b border-[var(--color-brand-50)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 text-sm">
              <p className="text-[var(--color-text-default)] text-xs">
                Miễn phí giao hàng cho đơn hàng trên 2,000,000₫
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/help"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-300)] transition-colors text-xs">
                  Hỗ trợ
                </Link>
                <Link
                  href="/account"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-300)] transition-colors text-xs">
                  Tài khoản
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header - Full responsive */}
        <div className="bg-[var(--color-bg-page)] border-b border-[var(--color-brand-50)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 h-16 lg:h-20">
              {/* Logo - Always visible */}
              <Link href="/" className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                <div className="w-20 h-20 lg:w-30 lg:h-30  flex items-center justify-center">
                  <SafeImage src="/images/logo-removebg-preview.png" width={120} height={120} alt="Logo phạm gia" />
                </div>
              </Link>

              {/* Desktop Navigation - Hidden on mobile/tablet (xs, sm, md, lg-) */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-default)] hover:text-[var(--color-brand-300)] transition-colors relative group whitespace-nowrap">
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--color-brand-300)] group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
              </nav>

              {/* Search Bar - Desktop: Hidden on mobile/tablet (xs, sm, md, lg-); Mobile version below */}
              <SearchBox className="hidden lg:flex flex-1 lg:mx-6 xl:mx-8" />

              {/* Right Actions - Responsive icons & profile */}
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 ml-auto">
                {/* User Profile - Hidden on small screens (xs, sm, md, lg, xl-) */}
                <HeaderUser />

                {/* Icon Actions - Wishlist/Compare: Hidden on xs; Cart & Menu: Always on mobile */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/wishlist"
                    className="hidden sm:flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors group"
                    aria-label="Yêu thích">
                    <Heart className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-300)] transition-colors" />
                  </Link>

                  <Link
                    href="/compare"
                    className="hidden sm:flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors group"
                    aria-label="So sánh">
                    <BarChart3 className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-300)] transition-colors" />
                  </Link>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="cursor-pointer relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors group"
                    aria-label="Giỏ hàng">
                    <ShoppingCart className="w-5 h-5 text-[var(--color-text-default)] group-hover:text-[var(--color-brand-300)] transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--color-brand-300)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors"
                    aria-label="Mở menu">
                    <Menu className="w-6 h-6 text-[var(--color-text-default)]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Search Bar - Hidden on desktop (lg+) */}
            <div className="lg:hidden pb-3 pt-1">
              <SearchBox className="relative" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Responsive: Hidden on lg+ */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.24 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: sidebarWidth }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-2xl bg-[var(--color-bg-page)] z-[70] lg:hidden shadow-2xl will-change-transform overflow-y-auto">
              <div className="flex flex-col  h-full overflow-hidden">
                {/* Sidebar Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.24 }}
                  className="flex items-center justify-between p-4 border-b border-[var(--color-brand-50)] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-50)] flex items-center justify-center shadow-sm">
                      <svg
                        className="w-5 h-5 text-[var(--color-brand-400)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10v6a1 1 0 001 1h1v2h2v-2h10v2h2v-2h1a1 1 0 001-1v-6H3z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V7a5 5 0 1110 0v3" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-default)]">Nội Thất</span>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors"
                    aria-label="Đóng menu">
                    <X className="w-6 h-6 text-[var(--color-text-default)]" />
                  </button>
                </motion.div>

                {/* User Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.24 }}
                  className="p-4 border-b border-[var(--color-brand-50)] bg-[var(--color-bg-muted)] flex-shrink-0">
                  <HeaderUserMobile onClose={closeMobileMenu} />
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.li
                        key={link.href}
                        custom={i}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible">
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className="flex items-center px-4 py-3 text-base font-medium text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-brand-300)] rounded-lg transition-colors">
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Additional Links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.32, duration: 0.24 }}
                    className="mt-6 pt-6 border-t border-[var(--color-brand-50)]">
                    <p className="px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                      Tiện ích
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/wishlist"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-brand-300)] rounded-lg transition-colors">
                          <Heart className="w-4 h-4" /> Yêu thích
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/compare"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-brand-300)] rounded-lg transition-colors">
                          <BarChart3 className="w-4 h-4" /> So sánh
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/cart"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-default)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-brand-300)] rounded-lg transition-colors">
                          <ShoppingCart className="w-4 h-4" /> Giỏ hàng
                          {cartCount > 0 && (
                            <span className="ml-auto w-6 h-6 bg-[var(--color-brand-300)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                </nav>

                {/* Bottom Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.24 }}
                  className="p-4 border-t border-[var(--color-brand-50)] bg-[var(--color-bg-muted)] flex-shrink-0">
                  <p className="text-xs text-[var(--color-text-muted)] text-center">
                    Miễn phí giao hàng cho đơn từ 2,000,000₫
                  </p>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
