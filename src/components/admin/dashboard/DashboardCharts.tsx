"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatVnd, formatVndCompact } from "@/lib/format";

export interface DailyRevenuePoint {
  dateKey: string;
  label: string;
  revenue: number;
  orderCount: number;
}

export interface CategoryOrderPoint {
  category: string;
  orders: number;
}

interface DashboardChartsProps {
  revenueSeries: DailyRevenuePoint[];
  categorySeries: CategoryOrderPoint[];
}

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DailyRevenuePoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-xs">
      <p className="font-semibold text-brand-400">{point.dateKey}</p>
      <p className="mt-1 text-text-default">
        Doanh thu: <span className="font-semibold text-brand-300">{formatVnd(point.revenue)}</span>
      </p>
      <p className="text-text-muted">Số đơn: {point.orderCount}</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryOrderPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-xs">
      <p className="font-semibold text-brand-400">{point.category}</p>
      <p className="mt-1 text-text-default">
        Số đơn: <span className="font-semibold text-brand-300">{point.orders}</span>
      </p>
    </div>
  );
}

export default function DashboardCharts({ revenueSeries, categorySeries }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* 30-day revenue line chart */}
      <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 xl:col-span-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-brand-400">Doanh thu 30 ngày gần nhất</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Tổng giá trị đơn hàng hợp lệ theo ngày (không tính đơn hủy)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-brand-300" aria-hidden="true" />
            Doanh thu (VND)
          </span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--color-brand-100)"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-brand-100)" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatVndCompact}
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-brand-300)"
                strokeWidth={2.25}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--color-brand-400)",
                  stroke: "var(--color-bg-page)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Orders by Category bar chart */}
      <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 xl:col-span-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-brand-400">Đơn hàng theo danh mục</h2>
            <p className="mt-0.5 text-xs text-text-muted">Phân bổ số lượng đơn theo dòng sofa</p>
          </div>
        </div>

        {categorySeries.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center rounded-[8px] border border-dashed border-brand-100 bg-bg-muted text-xs text-text-muted">
            Chưa có dữ liệu đơn hàng theo danh mục
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--color-brand-100)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-brand-100)" }}
                  interval={0}
                  tickFormatter={(val: string) => (val.length > 12 ? `${val.slice(0, 12)}…` : val)}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                />
                <Tooltip content={<CategoryTooltip />} cursor={{ fill: "var(--color-brand-50)", opacity: 0.45 }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {categorySeries.map((entry, idx) => (
                    <Cell
                      key={entry.category}
                      fill={idx % 2 === 0 ? "var(--color-brand-400)" : "var(--color-brand-200)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
