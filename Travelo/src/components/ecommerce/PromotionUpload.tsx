// import Chart from "react-apexcharts";
// import { ApexOptions } from "apexcharts";
// import ChartTab from "../common/ChartTab";

// export default function StatisticsChart() {
//   const options: ApexOptions = {
//     legend: {
//       show: false, // Hide legend
//       position: "top",
//       horizontalAlign: "left",
//     },
//     colors: ["#465FFF", "#9CB9FF"], // Define line colors
//     chart: {
//       fontFamily: "Outfit, sans-serif",
//       height: 310,
//       type: "line", // Set the chart type to 'line'
//       toolbar: {
//         show: false, // Hide chart toolbar
//       },
//     },
//     stroke: {
//       curve: "straight", // Define the line style (straight, smooth, or step)
//       width: [2, 2], // Line width for each dataset
//     },

//     fill: {
//       type: "gradient",
//       gradient: {
//         opacityFrom: 0.55,
//         opacityTo: 0,
//       },
//     },
//     markers: {
//       size: 0, // Size of the marker points
//       strokeColors: "#fff", // Marker border color
//       strokeWidth: 2,
//       hover: {
//         size: 6, // Marker size on hover
//       },
//     },
//     grid: {
//       xaxis: {
//         lines: {
//           show: false, // Hide grid lines on x-axis
//         },
//       },
//       yaxis: {
//         lines: {
//           show: true, // Show grid lines on y-axis
//         },
//       },
//     },
//     dataLabels: {
//       enabled: false, // Disable data labels
//     },
//     tooltip: {
//       enabled: true, // Enable tooltip
//       x: {
//         format: "dd MMM yyyy", // Format for x-axis tooltip
//       },
//     },
//     xaxis: {
//       type: "category", // Category-based x-axis
//       categories: [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ],
//       axisBorder: {
//         show: false, // Hide x-axis border
//       },
//       axisTicks: {
//         show: false, // Hide x-axis ticks
//       },
//       tooltip: {
//         enabled: false, // Disable tooltip for x-axis points
//       },
//     },
//     yaxis: {
//       labels: {
//         style: {
//           fontSize: "12px", // Adjust font size for y-axis labels
//           colors: ["#6B7280"], // Color of the labels
//         },
//       },
//       title: {
//         text: "", // Remove y-axis title
//         style: {
//           fontSize: "0px",
//         },
//       },
//     },
//   };

//   const series = [
//     {
//       name: "Sales",
//       data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
//     },
//     {
//       name: "Revenue",
//       data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
//     },
//   ];
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
//       <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
//         <div className="w-full">
//           <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//             Statistics
//           </h3>
//           <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
//             Target you’ve set for each month
//           </p>
//         </div>
//         <div className="flex items-start w-full gap-3 sm:justify-end">
//           <ChartTab />
//         </div>
//       </div>

//       <div className="max-w-full overflow-x-auto custom-scrollbar">
//         <div className="min-w-[1000px] xl:min-w-full">
//           <Chart options={options} series={series} type="area" height={310} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Upload } from "lucide-react";

export default function PromotionUpload() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Promotion
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Upload your promotional image here
          </p>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition">
        {selectedImage ? (
          <div className="w-full flex flex-col items-center">
            <img
              src={selectedImage}
              alt="Uploaded promotion"
              className="w-full max-w-md rounded-xl object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label
            htmlFor="upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="w-10 h-10 text-gray-500 mb-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Click to upload or drag an image here
            </span>
            <input
              id="upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
