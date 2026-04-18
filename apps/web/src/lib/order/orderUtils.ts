export function getOrderStatusVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "PAID":
    case "COD_COMPLETED":
    case "FULFILLED":
      return "success";

    case "PENDING_PAYMENT":
    case "COD_PENDING":
      return "warning";

    case "FAILED_PAYMENT":
    case "CANCELLED":
    case "REFUNDED":
      return "danger";

    default:
      return "default";
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case "CREATED":
      return "Đã tạo";
    case "PENDING_PAYMENT":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED_PAYMENT":
      return "Thanh toán thất bại";
    case "COD_PENDING":
      return "Chờ giao COD";
    case "COD_COMPLETED":
      return "Đã giao COD";
    case "FULFILLED":
      return "Hoàn tất";
    case "CANCELLED":
      return "Đã hủy";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
}
