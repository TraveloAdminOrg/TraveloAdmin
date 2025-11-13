import React from "react";


// import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
// import RoleTable from "../../components/RoleManagement/RoleTable";
import RoleForm from "../../components/RoleManagement/RoleForm";



const CreateRolePage: React.FC = () => {
    

  
  return (
    
    <div className="p-6 space-y-6">
        <PageBreadcrumb pageTitle="Create Profile" />
      <RoleForm onSubmit={(data) => console.log("New Role Created:", data)} />


    
      {/* <div className="space-y-6">
        <ComponentCard title="Sub-Admin and Console Profiles">
          <RoleTable />
        </ComponentCard>
      </div> */}
      </div>
  );
};
export default CreateRolePage;