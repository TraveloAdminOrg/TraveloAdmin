import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { formatCurrency } from "../../lib/format";
import type { RevenuePoint } from "../../types/report";

export default function RevenueAreaChart({
  points,
  currency = "USD",
}: {
  points: RevenuePoint[];
  currency?: string;
}) {
  const categories = points.map((p) => p.date.slice(5)); // MM-DD
  const data = points.map((p) => Number(p.amount?.toFixed?.(2) ?? p.amount));

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#950706"],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0.05 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: "#9ca3af" },
        formatter: (v: number) => formatCurrency(v, currency).replace(/\..*/, ""),
      },
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (v: number) => formatCurrency(v, currency) },
    },
  };

  return (
    <div className="-ml-2 -mr-2">
      <Chart
        options={options}
        series={[{ name: "Revenue", data }]}
        type="area"
        height={280}
      />
    </div>
  );
}
