import path from "node:path";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import { PDF_COLORS } from "@/lib/pdf-theme";
import { formatDateVi, formatVnd } from "@/lib/format";
import { formatDimensionsMeters } from "@/lib/dimensions";
import { WORKSHOP_STATUS_LABELS, isWorkshopStatus } from "@/lib/workshop-types";
import type { SerializedAdminOrder } from "@/components/admin/orders/types";

let fontsRegistered = false;

function ensurePdfFontsRegistered() {
  if (fontsRegistered) return;
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "MontserratPdf",
    fonts: [
      { src: path.join(fontsDir, "Montserrat-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "Montserrat-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "Montserrat-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "Montserrat-Bold.ttf"), fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "MontserratPdf",
    fontSize: 9.5,
    color: PDF_COLORS.textDefault,
    backgroundColor: PDF_COLORS.bgPage,
    paddingTop: 34,
    paddingBottom: 36,
    paddingHorizontal: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.brand100,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: PDF_COLORS.brand400,
  },
  brandSub: {
    fontSize: 8.5,
    color: PDF_COLORS.textMuted,
    marginTop: 2,
  },
  invoiceMetaBox: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.brand400,
  },
  metaText: {
    fontSize: 8.5,
    color: PDF_COLORS.textMuted,
    marginTop: 2,
  },
  metaStrong: {
    fontSize: 9.5,
    fontWeight: 600,
    color: PDF_COLORS.brand300,
    marginTop: 3,
  },
  gridTwoCol: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: PDF_COLORS.bgMuted,
    borderWidth: 1,
    borderColor: PDF_COLORS.brand100,
    borderRadius: 6,
    padding: 10,
  },
  cardHeading: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.brand300,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  cardLine: {
    fontSize: 9,
    color: PDF_COLORS.textDefault,
    marginBottom: 2.5,
  },
  cardMuted: {
    fontSize: 8.5,
    color: PDF_COLORS.textMuted,
    marginBottom: 2,
  },
  tableWrap: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: PDF_COLORS.brand100,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.brand50,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.brand100,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.brand50,
  },
  colIndex: { width: "7%", fontSize: 8.5 },
  colName: { width: "45%", fontSize: 8.5 },
  colQty: { width: "10%", textAlign: "center", fontSize: 8.5 },
  colPrice: { width: "19%", textAlign: "right", fontSize: 8.5 },
  colTotal: { width: "19%", textAlign: "right", fontSize: 8.5 },
  thText: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.brand400,
  },
  summaryWrap: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  depositBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: PDF_COLORS.brand100,
    borderRadius: 6,
  },
  totalsBox: {
    width: "44%",
    padding: 10,
    backgroundColor: PDF_COLORS.bgMuted,
    borderWidth: 1,
    borderColor: PDF_COLORS.brand100,
    borderRadius: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.brand100,
    marginVertical: 5,
  },
  totalLabelBold: {
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.brand400,
  },
  totalValueBold: {
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.brand400,
  },
  remainingValue: {
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.brand300,
  },
  footer: {
    marginTop: 26,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.brand100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBox: {
    width: "44%",
    alignItems: "center",
  },
  signTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.brand400,
  },
  signSub: {
    fontSize: 8,
    color: PDF_COLORS.textMuted,
    marginTop: 2,
  },
  warrantyFooter: {
    marginTop: 28,
    fontSize: 8,
    color: PDF_COLORS.textMuted,
    textAlign: "center",
  },
});

export function OrderInvoicePdf({ order }: { order: SerializedAdminOrder }) {
  ensurePdfFontsRegistered();

  const remaining = Math.max(0, order.total - order.depositPaid);
  const statusLabel = isWorkshopStatus(order.workshopStatus)
    ? WORKSHOP_STATUS_LABELS[order.workshopStatus]
    : order.workshopStatus;

  const customDimensions = order.isCustomSize
    ? (formatDimensionsMeters(order.customWidthCm, order.customDepthCm, order.customHeightCm) ?? "Đặt theo yêu cầu")
    : "Tiêu chuẩn theo mẫu";

  return (
    <Document title={`Hóa đơn ${order.orderNumber} - Sofa Phạm Gia`} author="Sofa Phạm Gia">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SOFA PHẠM GIA</Text>
            <Text style={styles.brandSub}>Xưởng sản xuất Sofa theo yêu cầu · TP. Hồ Chí Minh</Text>
            <Text style={styles.brandSub}>Website: sofaphamgia.com · Hotline/Zalo: 0932 111 620</Text>
          </View>
          <View style={styles.invoiceMetaBox}>
            <Text style={styles.invoiceTitle}>PHIẾU ĐƠN HÀNG / HÓA ĐƠN</Text>
            <Text style={styles.metaStrong}>Mã đơn: {order.orderNumber}</Text>
            <Text style={styles.metaText}>Ngày lập: {formatDateVi(order.createdAt)}</Text>
            <Text style={styles.metaText}>Tiến độ xưởng: {statusLabel}</Text>
          </View>
        </View>

        {/* Customer & Workshop Spec Cards */}
        <View style={styles.gridTwoCol}>
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Thông tin khách hàng</Text>
            <Text style={styles.cardLine}>{order.recipientName}</Text>
            <Text style={styles.cardMuted}>SĐT: {order.phone}</Text>
            {order.email ? <Text style={styles.cardMuted}>Email: {order.email}</Text> : null}
            <Text style={styles.cardMuted}>
              Địa chỉ: {order.line1}, {order.city}, {order.province}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Thông số đặt đóng & Giao nhận</Text>
            <Text style={styles.cardLine}>Kích thước: {customDimensions}</Text>
            <Text style={styles.cardMuted}>Chất liệu: {order.materialChoice || "Theo cấu hình sản phẩm"}</Text>
            <Text style={styles.cardMuted}>Màu sắc: {order.colorChoice || "Theo mẫu chọn"}</Text>
            <Text style={styles.cardMuted}>
              Ngày giao dự kiến: {formatDateVi(order.deliverDate ?? order.shipment?.scheduledDate)}
            </Text>
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colIndex, styles.thText]}>#</Text>
            <Text style={[styles.colName, styles.thText]}>Sản phẩm</Text>
            <Text style={[styles.colQty, styles.thText]}>SL</Text>
            <Text style={[styles.colPrice, styles.thText]}>Đơn giá</Text>
            <Text style={[styles.colTotal, styles.thText]}>Thành tiền</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colIndex}>{index + 1}</Text>
              <View style={styles.colName}>
                <Text>{item.name}</Text>
                {item.workshopCode || item.variantName ? (
                  <Text style={styles.cardMuted}>
                    {[item.workshopCode, item.variantName].filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatVnd(item.price)}</Text>
              <Text style={styles.colTotal}>{formatVnd(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Deposit logs + Totals */}
        <View style={styles.summaryWrap}>
          <View style={styles.depositBox}>
            <Text style={styles.cardHeading}>Lịch sử thanh toán / Cọc</Text>
            {order.depositLogs.length === 0 ? (
              <Text style={styles.cardMuted}>Chưa có giao dịch cọc nào được ghi nhận.</Text>
            ) : (
              order.depositLogs.map((log) => (
                <Text key={log.id} style={styles.cardMuted}>
                  • {formatDateVi(log.createdAt)}: {formatVnd(log.amount)}
                  {log.method ? ` (${log.method})` : ""}
                  {log.note ? ` — ${log.note}` : ""}
                </Text>
              ))
            )}
            <Text style={[styles.cardMuted, { marginTop: 6 }]}>Hình thức thanh toán: {order.paymentMethod}</Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.cardMuted}>Tạm tính</Text>
              <Text>{formatVnd(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.cardMuted}>Vận chuyển</Text>
              <Text>{formatVnd(order.shipping)}</Text>
            </View>
            {order.tax > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.cardMuted}>Thuế / Phụ phí</Text>
                <Text>{formatVnd(order.tax)}</Text>
              </View>
            ) : null}
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Tổng cộng</Text>
              <Text style={styles.totalValueBold}>{formatVnd(order.total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.cardMuted}>Đã cọc</Text>
              <Text>{formatVnd(order.depositPaid)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Còn phải thu</Text>
              <Text style={styles.remainingValue}>{formatVnd(remaining)}</Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Khách hàng xác nhận</Text>
            <Text style={styles.signSub}>(Ký và ghi rõ họ tên)</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Đại diện Xưởng Sofa Phạm Gia</Text>
            <Text style={styles.signSub}>(Ký và xác nhận giao nhận)</Text>
          </View>
        </View>

        <Text style={styles.warrantyFooter}>
          Cảm ơn quý khách đã tin tưởng Sofa Phạm Gia — Bảo hành khung gỗ, đệm mút và bề mặt theo phiếu bảo hành xưởng.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderOrderInvoicePdf(order: SerializedAdminOrder): Promise<Buffer> {
  return renderToBuffer(<OrderInvoicePdf order={order} />);
}
