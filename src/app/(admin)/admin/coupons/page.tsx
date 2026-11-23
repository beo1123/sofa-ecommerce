import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminCouponService } from "@/services/admin/coupon.service";
import CouponsClient from "@/components/admin/coupons/CouponsClient";

export const dynamic = "force-dynamic";

const couponService = new AdminCouponService(prisma);

export default async function AdminCouponsPage() {
  const coupons = await couponService.listCoupons();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Khuyến mãi & Mã giảm giá</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Tạo, kích hoạt và theo dõi lượt sử dụng các mã ưu đãi đặt đóng sofa.
        </p>
      </div>

      <CouponsClient initialCoupons={coupons} />
    </div>
  );
}
