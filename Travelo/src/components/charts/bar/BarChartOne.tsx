import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import React from "react";

export default function BarChartOne() {

  const [filterType, setFilterType] = React.useState("monthly");
  // Example datasets
  const datasets = {
    weekly: [45, 78, 56, 89, 67, 45, 90],
    monthly: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
    yearly: [3200, 2800, 3500, 4100, 3900],
  };
  const categories = {
    weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monthly: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    yearly: ["2020", "2021", "2022", "2023", "2024"],
  };

  const totalPayment = datasets[filterType as keyof typeof datasets].reduce((a, b) => a + b, 0); // 🔹 Added line

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories:categories[filterType as keyof typeof categories],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const series = [
    {
      name: "payments received",
      data: datasets[filterType as keyof typeof datasets],
    },
  ];
  return (
    // <div className="max-w-full overflow-x-auto custom-scrollbar">
    //   <div id="chartOne" className="min-w-[1000px]">
    //     <Chart options={options} series={series} type="bar" height={200} />
    //   </div>
    // </div>

    <div className="max-w-full overflow-x-auto custom-scrollbar">
      {/* 🔹 Filter Buttons */}
      <div className="flex justify-between items-center mb-5">
        {/* <h2 className="text-lg font-semibold text-white">Payment Chart</h2> */}
        {/* 🔹 Total Payment Display */}
      <p className="text-gray-400 mb-2 text-xl font-medium">
        Total Payment ({filterType}) : <span className="text-black font-bold">${totalPayment}</span>
      </p>
        <div className="flex items-center space-x-3">
          {["weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Chart */}
      <div id="chartOne" className="min-w-[1000px]">
        <Chart options={options} series={series} type="bar" height={200} />
      </div>
    </div>
  );
}
