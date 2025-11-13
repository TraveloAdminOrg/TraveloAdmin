import  { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
  };
  region: string;
  city: string;
  status: string;
}


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
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "./images/user/user-18.jpg",
      name: "Kaiya George",
    },
    region: "Europe",
    city: "Berlin",
    status: "Non-Active ",
  },
  {
    id: 3,
    user: {
      image: "./images/user/user-19.jpg",
      name: "Zain Geidt",
    },
    region: "Asia",
    city: "Tokyo",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "./images/user/user-20.jpg",
      name: "Abram Schleifer",
    },
    region: "South America",
    city: "Sao Paulo",
    status: "Non-Active",
  },
  {
    id: 5,
    user: {
      image: "./images/user/user-21.jpg",
      name: "Carla George",
    },
    region: "Africa",
    city: "Cairo",
    status: "Active",
  },
];

export default function DriverTable() {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const navigate = useNavigate();


  const filteredData = tableData.filter((order) => {
  return (
    (selectedRegion === "All" || order.region === selectedRegion) &&
    (selectedCity === "All" || order.city === selectedCity) &&
    (selectedStatus === "All" || order.status === selectedStatus)
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

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All Status</option>
          {[...new Set(tableData.map((d) => d.status))].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredData.map((order) => (
                <TableRow 
                key={order.id}
                onClick={() => {
                console.log("Navigating to:", `/TailAdmin/DriverProfile/${order.id}`);

                navigate(`/TailAdmin/DriverProfile/${order.id}`,{state: {driver: order}});
                }}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
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

                  {/* Status */}
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Active"
                          ? "success"
                          : order.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
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
