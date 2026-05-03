import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`relative flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main
          key={location.pathname}
          className="mx-auto w-full max-w-screen-2xl flex-1 animate-fade-up p-3 sm:p-4 md:p-6 lg:px-8"
        >
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-screen-2xl px-4 py-6 text-center text-[11px] text-gray-400 dark:text-gray-600 md:px-6 lg:px-8">
          Travelo Admin · v1.0
        </footer>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
