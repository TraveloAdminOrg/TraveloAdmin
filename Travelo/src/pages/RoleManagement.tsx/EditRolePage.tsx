import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import RoleForm from "../../components/RoleManagement/RoleForm";
import { useParams } from "react-router-dom";

const EditRolePage: React.FC = () => {
      const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const roleData = location.state?.role; // the item passed from RoleTable

  console.log("EditRolePage loaded for id:", id);
  console.log("Received state:", location.state);

  if (!roleData) {
    // If user directly opens this page without data
    return (
      <div className="p-6 text-center text-gray-500">
        No role data found. <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleEditSubmit = (updatedData: any) => {
    console.log("Updated Role Data:", updatedData);
    // 👇 Here you can call your API for updating role
    // updateRoleAPI(roleData.id, updatedData);

    navigate("/TailAdmin/RoleManagement"); // redirect back to table or wherever you wa nt
  };

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumb pageTitle="Edit Profile" />
      <RoleForm initialData={roleData} onSubmit={handleEditSubmit} />
    </div>
  );
};

export default EditRolePage;
