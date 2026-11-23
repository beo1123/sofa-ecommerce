export type AdminNavIconKey =
  | "dashboard"
  | "orders"
  | "products"
  | "articles"
  | "inquiries"
  | "returns"
  | "shipments"
  | "customers"
  | "coupons"
  | "settings";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  iconKey: AdminNavIconKey;
  matchPrefixes?: string[];
  showPendingBadge?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Tổng quan",
    description: "Thống kê đơn xưởng, sản xuất và doanh thu",
    iconKey: "dashboard",
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    description: "Quản lý đơn xưởng, tiền cọc và tiến độ sản xuất",
    iconKey: "orders",
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    description: "Danh mục sofa, biến thể, kích thước và đánh giá",
    iconKey: "products",
    matchPrefixes: ["/admin/categories"],
  },
  {
    href: "/admin/articles",
    label: "Bài đăng",
    description: "Bài viết blog, SEO và liên kết sản phẩm",
    iconKey: "articles",
    matchPrefixes: ["/admin/article-categories"],
  },
  {
    href: "/admin/inquiries",
    label: "Tư vấn & Leads",
    description: "Khách hỏi giá từ website, Zalo và showroom",
    iconKey: "inquiries",
    showPendingBadge: true,
  },
  {
    href: "/admin/returns",
    label: "Bảo hành & Đổi trả",
    description: "Yêu cầu bảo hành, đổi trả và hoàn tiền",
    iconKey: "returns",
  },
  {
    href: "/admin/shipments",
    label: "Vận chuyển",
    description: "Lịch giao hàng, tài xế và điều phối xe cẩu",
    iconKey: "shipments",
  },
  {
    href: "/admin/customers",
    label: "Khách hàng",
    description: "Hồ sơ khách hàng, địa chỉ và lịch sử đơn",
    iconKey: "customers",
  },
  {
    href: "/admin/coupons",
    label: "Khuyến mãi",
    description: "Mã giảm giá và chương trình ưu đãi",
    iconKey: "coupons",
  },
  {
    href: "/admin/settings",
    label: "Cài đặt & Log",
    description: "Nhật ký thao tác và thiết lập quản trị",
    iconKey: "settings",
  },
];

export function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.href === "/admin") {
    return pathname === "/admin";
  }
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }
  if (item.matchPrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  return false;
}

export function getActiveAdminNavItem(pathname: string): AdminNavItem {
  const matched = ADMIN_NAV_ITEMS.find((item) => isAdminNavItemActive(item, pathname));
  return matched ?? ADMIN_NAV_ITEMS[0];
}
