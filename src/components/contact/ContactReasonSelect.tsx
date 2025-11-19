// FILE: src/app/contact/components/ContactReasonSelect.tsx
"use client";

import React from "react";
import RadioGroup from "@/components/ui/Radio";

const options = [
  { value: "general", label: "Tư vấn sản phẩm", description: "Kích thước, chất liệu, màu sắc" },
  { value: "order", label: "Tình trạng đơn hàng", description: "Tra cứu & cập nhật" },
  { value: "warranty", label: "Bảo hành / Sửa chữa", description: "Hỗ trợ kỹ thuật" },
  { value: "refund", label: "Đổi trả / Hoàn tiền", description: "Điều kiện đổi trả" },
  { value: "custom", label: "Khác", description: "Vấn đề khác" },
];

export default function ContactReasonSelect({ value, onChange, name }: any) {
  return (
    <div>
      <label className="text-sm font-medium">Lý do liên hệ</label>
      <RadioGroup name={name} options={options} value={value} onChange={onChange} />
    </div>
  );
}
