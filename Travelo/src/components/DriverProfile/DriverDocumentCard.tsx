// import { useModal } from "../../hooks/useModal";
// import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
// import Input from "../form/input/InputField";
// import Label from "../form/Label";

// export default function UserAddressCard() {
//   const { isOpen, openModal, closeModal } = useModal();
//   const handleSave = () => {
//     // Handle save logic here
//     console.log("Saving changes...");
//     closeModal();
//   };
//   return (
//     <>
//       <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
//         <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
//           <div>
//             <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
//               Address
//             </h4>

//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
//               <div>
//                 <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                   Country
//                 </p>
//                 <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                   United States.
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                   City/State
//                 </p>
//                 <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                   Phoenix, Arizona, United States.
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                   Postal Code
//                 </p>
//                 <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                   ERT 2489
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                   TAX ID
//                 </p>
//                 <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                   AS4568384
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={openModal}
//             className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
//           >
//             <svg
//               className="fill-current"
//               width="18"
//               height="18"
//               viewBox="0 0 18 18"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 fillRule="evenodd"
//                 clipRule="evenodd"
//                 d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
//                 fill=""
//               />
//             </svg>
//             Edit
//           </button>
//         </div>
//       </div>
//       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//         <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
//           <div className="px-2 pr-14">
//             <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
//               Edit Address
//             </h4>
//             <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
//               Update your details to keep your profile up-to-date.
//             </p>
//           </div>
//           <form className="flex flex-col">
//             <div className="px-2 overflow-y-auto custom-scrollbar">
//               <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
//                 <div>
//                   <Label>Country</Label>
//                   <Input type="text" value="United States" />
//                 </div>

//                 <div>
//                   <Label>City/State</Label>
//                   <Input type="text" value="Arizona, United States." />
//                 </div>

//                 <div>
//                   <Label>Postal Code</Label>
//                   <Input type="text" value="ERT 2489" />
//                 </div>

//                 <div>
//                   <Label>TAX ID</Label>
//                   <Input type="text" value="AS4568384" />
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
//               <Button size="sm" variant="outline" onClick={closeModal}>
//                 Close
//               </Button>
//               <Button size="sm" onClick={handleSave}>
//                 Save Changes
//               </Button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//     </>
//   );
// }


import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface DocumentItem {
  id: number;
  name: string;
  fileUrl: string;
}

export default function DriverDocumentsCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  // Example static data — will be replaced later with API data
  const documents: DocumentItem[] = [
    { id: 1, name: "Driving License", fileUrl: "/docs/driving-license.pdf" },
    { id: 2, name: "Private Hire Driver License", fileUrl: "/docs/driver-license.pdf" },
    { id: 3, name: "Logbook V5", fileUrl: "/docs/logbook-v5.pdf" },
    { id: 4, name: "Private Hire Vehicle License", fileUrl: "/docs/vehicle-license.pdf" },
    { id: 5, name: "Insurance", fileUrl: "/docs/insurance.pdf" },
    { id: 6, name: "MOT", fileUrl: "/docs/mot.pdf" },
    { id: 7, name: "Hire Agreement (If Applicable)", fileUrl: "/docs/hire-agreement.pdf" },
  ];

  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) setSelectedDocs([]);
    else setSelectedDocs(documents.map((doc) => doc.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    console.log("Downloading docs:", selectedDocs);
    // Later you'll implement actual download logic
    setIsSelecting(false);
  };

  return (
    <>
      {/* Card Header */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Document Uploads
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage driver uploaded documents.
            </p>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            View Documents
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] mt-5">
        <div className="relative w-full p-4 overflow-y-auto bg-white  no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="flex items-center justify-between mb-6 ">
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Driver Documents
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View, verify, or download driver’s uploaded documents.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsSelecting(!isSelecting)}>
              {isSelecting ? "Cancel" : "Download"}
            </Button>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  {isSelecting && (
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                    />
                  )}
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white">
                    {doc.name}
                  </h5>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(doc.fileUrl, "_blank")}
                >
                  View
                </Button>
              </div>
            ))}
          </div>

          {isSelecting && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDocs.length === documents.length}
                  onChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Select All
                </span>
              </div>
              <Button size="sm" onClick={handleDownload}>
                Download Selected
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
