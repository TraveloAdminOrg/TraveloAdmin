import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Wallet,
  Percent,
  Car,
  Users,
  User as UserIcon,
  Map as MapIcon,
  Star,
  Bell,
  Megaphone,
  ShieldCheck,
  Route as RouteIcon,
  BarChart3,
  LayoutDashboard,
  FileText,
  Globe,
  HelpCircle,
  // UserCog, // used by the hidden Role Management nav entry below
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useReportOverviewQuery } from "../hooks/queries/useReports";
import { useActiveDispatchRidesQuery } from "../hooks/queries/useDispatch";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

type Tone = "brand" | "warning" | "success" | "neutral";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badgeKey?: "pendingApprovals" | "activeRides";
  badgeTone?: Tone;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
      {
        name: "Live Dispatch",
        icon: <MapIcon size={20} />,
        path: "/live-dispatch",
        badgeKey: "activeRides",
        badgeTone: "success",
      },
      { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Rides", icon: <RouteIcon size={20} />, path: "/rides" },
      {
        name: "Driver Approvals",
        icon: <ShieldCheck size={20} />,
        path: "/driver-approvals",
        badgeKey: "pendingApprovals",
        badgeTone: "warning",
      },
    ],
  },
  {
    title: "People",
    items: [
      { name: "Drivers", icon: <Users size={20} />, path: "/driver-tables" },
      { name: "Users", icon: <UserIcon size={20} />, path: "/basic-tables" },
    ],
  },
  {
    title: "Revenue",
    items: [
      {
        name: "Payments & Transactions",
        icon: <Wallet size={20} />,
        path: "/transaction-history",
      },
      {
        name: "Fare Management",
        icon: <Wallet size={20} />,
        path: "/fare-management",
      },
      {
        name: "Commission",
        icon: <Percent size={20} />,
        path: "/commission",
      },
      { name: "Ride Types", icon: <Car size={20} />, path: "/ride-types" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { name: "Reviews & Ratings", icon: <Star size={20} />, path: "/reviews" },
      { name: "Notifications", icon: <Bell size={20} />, path: "/notifications" },
      { name: "Adverts", icon: <Megaphone size={20} />, path: "/adverts" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { name: "Regions", icon: <Globe size={20} />, path: "/regions" },
      {
        name: "Content Management",
        icon: <FileText size={20} />,
        path: "/content-management",
      },
      {
        name: "Help and Support",
        icon: <HelpCircle size={20} />,
        path: "/help-support",
      },
      // Hidden — Role Management is intentionally suppressed from the nav.
      // Restore by uncommenting this block (icon import stays so the entry
      // can be re-enabled without touching imports).
      // {
      //   name: "Role Management",
      //   icon: <UserCog size={20} />,
      //   path: "/role-management",
      // },
    ],
  },
];

const TONE_BADGE: Record<Tone, string> = {
  brand:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  warning:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
  success:
    "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
  neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { admin } = useAuth();

  const overviewQ = useReportOverviewQuery({});
  const activeRidesQ = useActiveDispatchRidesQuery();

  const collapsed = !isExpanded && !isHovered && !isMobileOpen;

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return location.pathname === "/";
      return (
        location.pathname === path || location.pathname.startsWith(path + "/")
      );
    },
    [location.pathname],
  );

  const badges: Record<NonNullable<NavItem["badgeKey"]>, number> = {
    pendingApprovals: overviewQ.data?.pendingApprovals ?? 0,
    activeRides: activeRidesQ.data?.length ?? 0,
  };

  const adminName = (admin?.email ?? "").split("@")[0] || "Admin";
  const adminType = admin?.type;

  // Keep submenu state machinery so we don't break the original API surface,
  // but the new design uses a flat-grouped layout.
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    void subMenuRefs.current;
  }, [location]);

  // Track if the user is hovering a row (for tooltip behavior when collapsed)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col bg-white px-4 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0
        border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredItem(null);
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center py-6 ${
          collapsed ? "justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <>
              <img
                className="dark:hidden"
                src="images/logo/logo-sidebar.png"
                alt="Travelo"
                width={140}
                height={36}
              />
              <img
                className="hidden dark:block"
                src="./images/logo/logo-sidebar.png"
                alt="Travelo"
                width={140}
                height={36}
              />
            </>
          ) : (
            <img
              src="./images/logo/logo-responsive2.png"
              alt="Travelo"
              width={40}
              height={40}
            />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="no-scrollbar flex-1 overflow-y-auto pb-4">
        <ul className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <li key={group.title}>
              {!collapsed ? (
                <h3 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  {group.title}
                </h3>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-gray-200 dark:bg-gray-800" />
              )}
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const badge =
                    item.badgeKey && badges[item.badgeKey] > 0
                      ? badges[item.badgeKey]
                      : 0;
                  return (
                    <li
                      key={item.path}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Active accent bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                      )}

                      <Link
                        to={item.path}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-brand-50 to-transparent text-brand-600 dark:from-brand-500/15 dark:text-brand-400"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                            active
                              ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                              : "bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {badge > 0 && (
                              <span
                                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                                  TONE_BADGE[item.badgeTone ?? "brand"]
                                }`}
                              >
                                {badge > 99 ? "99+" : badge}
                              </span>
                            )}
                            {active && (
                              <ChevronRight
                                size={14}
                                className="text-brand-500"
                              />
                            )}
                          </>
                        )}

                        {/* Badge dot when collapsed */}
                        {collapsed && badge > 0 && (
                          <span
                            className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${
                              item.badgeTone === "warning"
                                ? "bg-warning-500"
                                : item.badgeTone === "success"
                                  ? "bg-success-500"
                                  : "bg-brand-500"
                            } ring-2 ring-white dark:ring-gray-900`}
                          />
                        )}
                      </Link>

                      {/* Tooltip when collapsed */}
                      {collapsed && hoveredItem === item.path && (
                        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-700">
                          {item.name}
                          {badge > 0 && (
                            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                              {badge}
                            </span>
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* User mini-card */}
      {admin && (
        <div className="border-t border-gray-100 py-4 dark:border-gray-800">
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="relative">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white dark:ring-gray-900">
                  <img
                    src={admin.image || FALLBACK_AVATAR}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        FALLBACK_AVATAR;
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold capitalize text-gray-800 dark:text-white/90">
                  {adminName}
                </p>
                {adminType && (
                  <p className="truncate text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {adminType.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-900">
              <img
                src={admin.image || FALLBACK_AVATAR}
                alt=""
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
                }}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
