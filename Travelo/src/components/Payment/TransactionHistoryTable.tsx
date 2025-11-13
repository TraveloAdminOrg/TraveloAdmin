import  { useState } from "react";
import DatePicker from "react-datepicker";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";

// import Badge from "../ui/badge/Badge";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
  };
  region: string;
  city: string;
  amount: number;
  date: string;
}

// Define the table data using the interface

// Simplified table data
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "./images/user/user-17.jpg",
      name: "Lindsey Curtis",
    },
    region: "North America",
    city: "New York",
    amount: 2500,
    date: "2025-10-25 14:30",
  },
  {
    id: 2,
    user: {
      image: "./images/user/user-18.jpg",
      name: "Kaiya George",
    },
    region: "Europe",
    city: "Berlin",
    amount: 1800,
    date: "2025-10-24 09:15",
  },
  {
    id: 3,
    user: {
      image: "./images/user/user-19.jpg",
      name: "Zain Geidt",
    },
    region: "Asia",
    city: "Tokyo",
    amount: 1800,
    date: "2025-10-24 09:15",
  },
  {
    id: 4,
    user: {
      image: "./images/user/user-20.jpg",
      name: "Abram Schleifer",
    },
    region: "South America",
    city: "Sao Paulo",
    amount: 1800,
    date: "2025-10-24 09:15",
  },
  {
    id: 5,
    user: {
      image: "./images/user/user-21.jpg",
      name: "Carla George",
    },
    region: "Africa",
    city: "Cairo",
    amount: 1800,
    date: "2025-10-24 09:15",
  },
];

export default function TransactionHistoryTable() {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);




  const filteredData = tableData.filter((order) => {
  const orderDate = new Date(order.date);
  const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

  const startDateOnly = startDate
    ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    : null;
  const endDateOnly = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    : null;

  const isAfterStart = !startDateOnly || orderDateOnly >= startDateOnly;
  const isBeforeEnd = !endDateOnly || orderDateOnly <= endDateOnly;

  return (
    (selectedRegion === "All" || order.region === selectedRegion) &&
    (selectedCity === "All" || order.city === selectedCity) &&
    isAfterStart &&
    isBeforeEnd
  );
});




  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="flex gap-4 p-4">
        {/* Region Filter */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All Regions</option>
          {[...new Set(tableData.map((d) => d.region))].map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All Cities</option>
          {[...new Set(tableData.map((d) => d.city))].map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Start Date */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 fw-semibold">Custom Date:</span>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Select start date"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* End Date */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">-</span>
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate ?? undefined}
          placeholderText="Select end date"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        />
       </div>
        
        
        </div>
        


          <Table>
            

            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Region
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  City
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date/Time
                </TableCell>
                
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredData.map((order) => (
                <TableRow key={order.id}>
                  {/* Name + Image  */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.user.name}
                        </span>
                        
                      </div>
                    </div>
                  </TableCell>

                  {/* Region */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.region}
                  </TableCell>

                  {/* City */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.city}
                  </TableCell>

                
                  {/* Amount */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                ${order.amount.toLocaleString()}
                </TableCell>

                {/* Date / Time */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {order.date}
                </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
