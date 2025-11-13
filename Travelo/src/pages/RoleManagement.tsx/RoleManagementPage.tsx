
import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import RoleTable from "../../components/RoleManagement/RoleTable";



const RoleManagementPage: React.FC = () => {

    const navigate = useNavigate();

    const handleAdd = () => {
      navigate("/TailAdmin/create-role-page");
      console.log("Navigate to Create Role Page");
    };

  return (
    
    <div className="p-6 space-y-6">
        <PageBreadcrumb pageTitle="Role Management Tab" />
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Create Sub-Admin and Console
          </h2>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 text-white rounded-md hover:bg-brand-600 transition"
            variant="primary"
          >
            <Plus size={18} /> Create New Role
          </Button>
        </div>
     </div>

    
      <div className="space-y-6">
        <ComponentCard title="Sub-Admin and Console Profiles">
          <RoleTable />
        </ComponentCard>
      </div>
      </div>
  );
};
export default RoleManagementPage;