"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { IconMenu2, IconPhone, IconSearch, IconX } from "@tabler/icons-react";
import Drawer from "@/components/ui/Drawer";
import { SafeImage } from "@/components/ui/SafeImage";
import { headerLogoSrc } from "@/lib/branding";

export interface NavbarCategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface StoreNavbarProps {
  categories: NavbarCategoryItem[];
}

const HOTLINE_DISPLAY = "0932 111 620";
const HOTLINE_TEL = "tel:0932111620";
const ZALO_URL = "https://zalo.me/0932111620";

function NavbarInner({ categories }: StoreNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const activeCategorySlug = pathname === "/san-pham" ? searchParams.get("category") : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname, activeCategorySlug]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(trimmed)}`);
  };

  const desktopCategories = categories.slice(0, 5);

  const navLinkClass = (active: boolean) =>
    clsx(
      "inline-flex h-16 items-center border-b-2 px-1 text-sm font-medium whitespace-nowrap transition-colors duration-150",
      active ? "border-brand-300 text-brand-400" : "border-transparent text-text-default hover:text-brand-300"
    );

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 w-full border-b transition-colors duration-200",
          scrolled ? "border-brand-100 bg-bg-page/80 backdrop-blur-md" : "border-brand-100/70 bg-bg-page"
        )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile hamburger + Brand logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu điều hướng"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50/60 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 lg:hidden cursor-pointer">
              <IconMenu2 size={20} stroke={1.75} aria-hidden="true" />
            </button>

            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-[8px] py-1 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
              <SafeImage
                src={headerLogoSrc}
                alt="Logo Sofa Phạm Gia"
                width={48}
                height={56}
                className="h-11 w-auto max-w-[120px] shrink-0 object-contain sm:h-12"
                priority
              />
              <span className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-brand-400 leading-none sm:text-lg">
                  Sofa Phạm Gia
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-200">
                  Xưởng Sofa TP.HCM
                </span>
              </span>
            </Link>
          </div>

          {/* Center: Category nav links */}
          <nav aria-label="Danh mục sản phẩm" className="hidden lg:flex items-center gap-6 overflow-x-auto">
            <Link href="/san-pham" className={navLinkClass(pathname === "/san-pham" && !activeCategorySlug)}>
              Tất cả sofa
            </Link>

            {desktopCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.slug}`}
                className={navLinkClass(activeCategorySlug === cat.slug)}>
                {cat.name}
              </Link>
            ))}

            <Link href="/bai-viet" className={navLinkClass(pathname.startsWith("/bai-viet"))}>
              Kinh nghiệm
            </Link>

            <Link href="/lien-he" className={navLinkClass(pathname.startsWith("/lien-he"))}>
              Tư vấn
            </Link>
          </nav>

          {/* Right: Search icon + Hotline pill */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm sản phẩm"}
              aria-expanded={searchOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50/60 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 cursor-pointer">
              {searchOpen ? (
                <IconX size={18} stroke={1.75} aria-hidden="true" />
              ) : (
                <IconSearch size={18} stroke={1.75} aria-hidden="true" />
              )}
            </button>

            <a
              href={HOTLINE_TEL}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-400 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-brand-300 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 sm:px-4 sm:text-sm">
              <IconPhone size={15} stroke={1.75} aria-hidden="true" />
              <span>{HOTLINE_DISPLAY}</span>
            </a>
          </div>
        </div>

        {/* Inline search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-brand-100 bg-bg-page px-4 py-3 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
              <div className="relative flex-1">
                <IconSearch
                  size={16}
                  stroke={1.75}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã sofa (PGG-01), sofa góc chữ L, da microfiber..."
                  className="h-10 w-full rounded-[8px] border border-brand-100 bg-bg-page pl-9 pr-3 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-[8px] bg-brand-400 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-300 cursor-pointer">
                Tìm kiếm
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile slide-in drawer (overlay bg-brand-400/20 via Drawer primitive) */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        widthClassName="w-[300px]"
        title={
          <span className="flex items-center gap-2.5">
            <SafeImage
              src={headerLogoSrc}
              alt="Logo Sofa Phạm Gia"
              width={40}
              height={48}
              className="h-10 w-auto max-w-[96px] shrink-0 object-contain"
            />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-base font-bold text-brand-400">Sofa Phạm Gia</span>
              <span className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wider text-brand-200">
                Xưởng Sofa TP.HCM
              </span>
            </span>
          </span>
        }
        footer={
          <div className="space-y-2">
            <a
              href={HOTLINE_TEL}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand-400 text-sm font-semibold text-white transition-colors hover:bg-brand-300">
              <IconPhone size={16} stroke={1.75} />
              <span>Gọi {HOTLINE_DISPLAY}</span>
            </a>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-full items-center justify-center rounded-full border border-brand-300 bg-bg-page text-xs font-medium text-brand-400 transition-colors hover:bg-brand-50">
              Nhắn tư vấn Zalo Mr. Giang
            </a>
          </div>
        }>
        <div className="space-y-5">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <IconSearch
              size={16}
              stroke={1.75}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mẫu sofa..."
              className="h-9 w-full rounded-[8px] border border-brand-100 bg-bg-page pl-9 pr-3 text-sm text-text-default focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
            />
          </form>

          {/* Category links */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Danh mục Sofa</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/san-pham"
                  className={clsx(
                    "block rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/san-pham" && !activeCategorySlug
                      ? "bg-brand-50 text-brand-400"
                      : "text-text-default hover:bg-brand-50/60 hover:text-brand-300"
                  )}>
                  Tất cả sản phẩm
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/san-pham?category=${cat.slug}`}
                    className={clsx(
                      "block rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                      activeCategorySlug === cat.slug
                        ? "bg-brand-50 text-brand-400"
                        : "text-text-default hover:bg-brand-50/60 hover:text-brand-300"
                    )}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Static links */}
          <div className="border-t border-brand-100 pt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Thông tin xưởng</p>
            <ul className="space-y-1">
              {[
                { href: "/gioi-thieu", label: "Giới thiệu xưởng" },
                { href: "/bai-viet", label: "Kinh nghiệm chọn sofa" },
                { href: "/lien-he", label: "Đăng ký tư vấn & Báo giá" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "block rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                      pathname.startsWith(link.href)
                        ? "bg-brand-50 text-brand-400"
                        : "text-text-default hover:bg-brand-50/60 hover:text-brand-300"
                    )}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default function StoreNavbar({ categories }: StoreNavbarProps) {
  return (
    <Suspense fallback={<header className="sticky top-0 z-40 h-16 w-full border-b border-brand-100 bg-bg-page" />}>
      <NavbarInner categories={categories} />
    </Suspense>
  );
}
