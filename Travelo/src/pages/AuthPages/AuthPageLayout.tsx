import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 bg-gradient-to-tl from-[#95070600] via-[#95070605] to-[#95070650] dark:bg-gray-900">
      {/* <img
              className="absolute inset-0 z-0 w-full h-full object-contain opacity-50"
              src="images/auth-banner/banner.png"
              alt="Sign In"
            /> */}
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0 ">
        
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 dark:bg-white/5 lg:grid mt-20"
       >
        
          <div className="relative flex items-center justify-center z-1 h-1/2">
            
            
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
                <img
                  width={231}
                  height={48}
                  src="images/logo/logo.png"
                  alt="Logo"
                />
              
            </div>
          </div>
          <div className="relative flex items-center justify-center z-1 h-1/1">
            <img
              className="w-full h-full object-contain lg:object-cover opacity-90"
              src="images/auth-banner/banner.png"
              alt="Sign In"
              style={{
                maxWidth: "500px",
                maxHeight: "90vh",
                objectPosition: "center",
              }}
            />
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
