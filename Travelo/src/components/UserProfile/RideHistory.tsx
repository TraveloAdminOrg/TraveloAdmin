
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";
import { useState } from "react";
import { Eye } from "lucide-react"; // ✅ added

interface Ride {
  id: number;
  name: string;
  pickup: string;
  destination: string;
  addStop?: string;
  payment: number;
  rating: number;
}

// Example Data
const tableData: Ride[] = [
  {
    id: 101,
    name: "Lindsey Curtis",
    pickup: "Times Square, NY",
    destination: "Central Park, NY",
    addStop: "5th Avenue, NY",
    payment: 25,
    rating: 1.8,
  },
  {
    id: 102,
    name: "Kaiya George",
    pickup: "Alexanderplatz, Berlin",
    destination: "Brandenburg Gate, Berlin",
    addStop: "",
    payment: 18,
    rating: 3.6,
  },
  {
    id: 103,
    name: "Zain Geidt",
    pickup: "Shibuya Crossing, Tokyo",
    destination: "Tokyo Tower, Tokyo",
    addStop: "Roppongi Hills",
    payment: 20,
    rating: 4.9,
  },
];

export default function RideHistory() {
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Ride ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Username
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Pickup
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Destination
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Add Stop
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Payment
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                  Rating / Reviews
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((ride) => (
                <TableRow key={ride.id}>
                  {/* Ride ID */}
                  <TableCell className="px-5 py-3 text-gray-700 text-start">
                    {ride.id}
                  </TableCell>

                  {/* Username */}
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {ride.name}
                    </span>
                  </TableCell>

                  {/* Pickup */}
                  <TableCell className="px-5 py-3 text-gray-800">{ride.pickup}</TableCell>

                  {/* Destination */}
                  <TableCell className="px-5 py-3 text-gray-800">{ride.destination}</TableCell>

                  {/* Add Stop */}
                  <TableCell className="px-5 py-3 text-gray-800">
                    {ride.addStop ? ride.addStop : "—"}
                  </TableCell>

                  {/* ✅ Payment with eye icon */}
                  <TableCell className="px-5 py-3 text-gray-800">
                    <div className="flex items-center gap-2">
                      <span>${ride.payment}</span>
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setIsModalOpen(true);
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </TableCell>

                  {/* Rating / Reviews */}
                  <TableCell className="px-5 py-3 text-gray-800">
                    <div className="flex items-center gap-2">
                        <span>⭐ {ride.rating.toFixed(1)}</span>
                        <button
                        onClick={() => {
                            setSelectedRide(ride);
                            setIsReviewModalOpen(true);
                        }}
                        className="text-gray-600 hover:text-blue-600"
                        >
                        <Eye size={18} />
                        </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* ✅ Modal */}
          {isModalOpen && selectedRide && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white rounded-xl p-6 w-[380px] shadow-xl relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                {/* Modal Title */}
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Payment Breakdown
                </h2>

                {/* Breakdown Details */}
                <div className="space-y-2 text-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span>Fare Charges:</span>
                    <span>$15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning Service:</span>
                    <span>$3.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add Stop Charges:</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waiting Time Charges:</span>
                    <span>$2.00</span>
                  </div>

                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${selectedRide.payment}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isReviewModalOpen && selectedRide && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-xl p-6 w-[380px] shadow-xl relative">
      {/* Close Button */}
      <button
        onClick={() => setIsReviewModalOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      {/* Modal Title */}
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        User Review
      </h2>

      {/* Example Review Content */}
      <p className="text-gray-700 text-sm mb-4">
        "Smooth ride and friendly driver. Would definitely book again!"
      </p>

      {/* Show Rating */}
      <div className="flex gap-1">
        {Array.from({ length: Math.round(selectedRide.rating) }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">⭐</span>
        ))}
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
