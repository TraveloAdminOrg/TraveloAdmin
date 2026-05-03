import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { RidesPoint } from "../../types/report";

export default function RidesBarChart({ points }: { points: RidesPoint[] }) {
  const categories = points.map((p) => p.date.slice(5));
  const completed = points.map((p) => p.completed ?? 0);
  const cancelled = points.map((p) => p.cancelled ?? 0);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: true,
      height: 260,
      toolbar: { show: false },
    },
    colors: ["#22c55e", "#ef4444"],
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 3,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: { strokeWidth: 0 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
    },
    yaxis: { labels: { style: { fontSize: "11px", colors: "#9ca3af" } } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${v} rides` } },
  };

  return (
    <div className="-ml-2 -mr-2">
      <Chart
        options={options}
        series={[
          { name: "Completed", data: completed },
          { name: "Cancelled", data: cancelled },
        ]}
        type="bar"
        height={260}
      />
    </div>
  );
}
