"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, Home, Menu, PhoneCall, Sofa, Sparkles, X } from "lucide-react";
import MiniCartDrawer from "./cart/MiniCartDrawer";
import { useAppSelector } from "@/store/hook";
import { selectCartItemCount } from "@/store/selector/cartSelectors";
import SearchBox from "./Header/SearchBox";
import { SafeImage } from "./ui/SafeImage";
import SocialContact from "./Header/SocialContact";
import { headerLogoSrc } from "@/lib/branding";

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
  { href: "/", label: "Trang Chủ", subtitle: "Không gian nội thất Phạm Gia", icon: Home },
  { href: "/san-pham", label: "Sản Phẩm", subtitle: "Khám phá bộ sưu tập sofa", icon: Sofa },
  { href: "/gioi-thieu", label: "Giới Thiệu", subtitle: "Câu chuyện & Xưởng chế tác", icon: Sparkles },
  { href: "/bai-viet", label: "Bài Viết", subtitle: "Cẩm nang & Xu hướng sống", icon: BookOpen },
  { href: "/lien-he", label: "Liên Hệ", subtitle: "Tư vấn thiết kế riêng 24/7", icon: PhoneCall },
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
  const pathname = usePathname();
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
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  const sidebarWidth = scrollBarWidth > 0 ? `calc(85vw + ${scrollBarWidth}px)` : "85vw";

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--color-bg-page)]/95 backdrop-blur-md shadow-[0_4px_24px_-8px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]">
        {/* Top Bar - Responsive: Hidden on mobile/tablet (xs, sm, md) */}
        <div className="hidden md:block bg-[var(--color-bg-muted)] border-b border-[var(--color-brand-50)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-9 text-xs">
              <p className="text-[var(--color-text-muted)] font-medium tracking-wide">
                Miễn phí giao hàng nội thành cho đơn hàng trên 2,000,000₫
              </p>
              <p className="text-[var(--color-brand-400)] font-semibold">Xưởng sản xuất & Thiết kế Sofa theo yêu cầu</p>
            </div>
          </div>
        </div>

        {/* Main Header - Full responsive */}
        <div className="bg-[var(--color-bg-page)]/90 border-b border-[var(--color-brand-50)] py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 h-20 lg:h-24">
              {/* Logo - Always visible */}
              <Link href="/" className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                <div className="flex h-16 w-24 items-center justify-center overflow-hidden sm:h-16 sm:w-28 lg:h-20 lg:w-32">
                  <SafeImage
                    src={headerLogoSrc}
                    width={144}
                    height={144}
                    alt="Logo Phạm Gia"
                    className="h-full w-full object-contain"
                    priority
                  />
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
                {/* <HeaderUser /> */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <SocialContact
                    facebookUrl={`${process.env.NEXT_PUBLIC_FACEBOOK_URL}`}
                    zaloUrl={`${process.env.NEXT_PUBLIC_ZALO_URL}`}
                    phoneNumber={`${process.env.NEXT_PUBLIC_PHONE_URL}`}
                  />
                  {/* <Link
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
                  </Link> */}

                  {/* <button
                    onClick={() => setIsCartOpen(true)}
                    className="cursor-pointer relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors group"
                    aria-label="Giỏ hàng">
                    <ShoppingCart className="w-5 h-5 text-[var(--color-text-default)] group-hover:text-[var(--color-brand-300)] transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--color-brand-300)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                        {cartCount}
                      </span>
                    )}
                  </button> */}
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
              className="fixed inset-0 bg-[var(--color-text-default)]/50 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: sidebarWidth }}
              className="fixed top-0 right-0 h-full w-[86vw] max-w-sm bg-[var(--color-bg-page)] z-[70] lg:hidden shadow-2xl border-l border-[var(--color-brand-50)] will-change-transform overflow-y-auto">
              <div className="flex flex-col h-full overflow-hidden">
                {/* Sidebar Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.24 }}
                  className="flex items-center justify-between px-5 py-4 bg-[var(--color-bg-muted)]/70 border-b border-[var(--color-brand-50)] flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-bg-page)] p-1 shadow-xs ring-1 ring-[var(--color-brand-50)]">
                      <SafeImage
                        src={headerLogoSrc}
                        width={60}
                        height={60}
                        alt="Logo Phạm Gia"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-base font-bold text-[var(--color-text-default)] leading-tight">
                        Sofa Phạm Gia
                      </span>
                      <span className="block text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                        Nội thất may đo cao cấp
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-page)] hover:bg-[var(--color-brand-50)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-50)] transition-colors cursor-pointer"
                    aria-label="Đóng menu">
                    <X className="w-5 h-5 text-[var(--color-text-default)]" />
                  </button>
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-5">
                  <div>
                    <p className="px-2 mb-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-300)]">
                      Điều hướng
                    </p>
                    <ul className="space-y-2">
                      {navLinks.map((link, i) => {
                        const Icon = link.icon;
                        const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);

                        return (
                          <motion.li
                            key={link.href}
                            custom={i}
                            variants={menuItemVariants}
                            initial="hidden"
                            animate="visible">
                            <Link
                              href={link.href}
                              onClick={closeMobileMenu}
                              className={`group flex items-center justify-between gap-3 p-3 rounded-2xl transition-all duration-200 ${
                                isActive
                                  ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] shadow-sm"
                                  : "bg-[var(--color-bg-page)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-50)] hover:bg-[var(--color-bg-muted)] hover:ring-[var(--color-brand-200)]"
                              }`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                    isActive
                                      ? "bg-[var(--color-bg-page)]/15 text-[var(--color-bg-page)]"
                                      : "bg-[var(--color-bg-muted)] text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)] group-hover:bg-[var(--color-bg-page)]"
                                  }`}>
                                  <Icon size={18} strokeWidth={2} />
                                </span>
                                <div className="min-w-0">
                                  <span className="block text-sm font-bold leading-snug">{link.label}</span>
                                  <span
                                    className={`block text-xs truncate ${
                                      isActive ? "text-[var(--color-brand-50)]" : "text-[var(--color-text-muted)]"
                                    }`}>
                                    {link.subtitle}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                size={16}
                                className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                                  isActive ? "text-[var(--color-bg-page)]" : "text-[var(--color-text-muted)]"
                                }`}
                              />
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Bento Consultation Card inside Sidebar */}
                  <div className="rounded-2xl bg-[var(--color-bg-muted)] p-4 ring-1 ring-[var(--color-brand-50)] space-y-3">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-300)]">
                        Xưởng sản xuất trực tiếp
                      </span>
                      <p className="text-sm font-bold text-[var(--color-text-default)] mt-0.5">
                        Đặt đóng sofa theo kích thước & màu sắc riêng
                      </p>
                    </div>
                    <a
                      href={`tel:${(process.env.NEXT_PUBLIC_PHONE_URL || "0932111620").replace(/\s+/g, "")}`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-brand-400)] px-4 py-2.5 text-xs font-bold text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)] transition-colors shadow-xs">
                      <PhoneCall size={14} />
                      <span>Gọi tư vấn: {process.env.NEXT_PUBLIC_PHONE_URL || "0932 111 620"}</span>
                    </a>
                  </div>
                </nav>

                {/* Bottom Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.24 }}
                  className="px-4 py-3.5 border-t border-[var(--color-brand-50)] bg-[var(--color-bg-muted)]/60 flex-shrink-0">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] text-center">
                    Miễn phí giao hàng nội thành cho đơn từ 2,000,000₫
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
