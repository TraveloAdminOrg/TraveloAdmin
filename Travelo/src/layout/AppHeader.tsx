import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Search } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import UserDropdown from "../components/header/UserDropdown";

interface NavTarget {
  path: string;
  label: string;
  keywords?: string[];
}

const NAV_TARGETS: NavTarget[] = [
  { path: "/", label: "Dashboard", keywords: ["home", "overview"] },
  { path: "/live-dispatch", label: "Live Dispatch", keywords: ["map", "ops"] },
  { path: "/rides", label: "Rides", keywords: ["trips"] },
  { path: "/driver-tables", label: "Drivers" },
  { path: "/driver-approvals", label: "Driver Approvals", keywords: ["approve"] },
  { path: "/basic-tables", label: "Users", keywords: ["riders"] },
  { path: "/transaction-history", label: "Payments & Transactions", keywords: ["money", "refund"] },
  { path: "/reviews", label: "Reviews & Ratings" },
  { path: "/notifications", label: "Notifications", keywords: ["push"] },
  { path: "/adverts", label: "Adverts", keywords: ["ads"] },
  { path: "/reports", label: "Reports", keywords: ["analytics"] },
  { path: "/fare-management", label: "Fare Management", keywords: ["pricing"] },
  { path: "/commission", label: "Commission", keywords: ["fees", "platform"] },
  { path: "/ride-types", label: "Ride Types", keywords: ["vehicles"] },
  { path: "/content-management", label: "Content Management" },
  { path: "/help-support", label: "Help & Support" },
  // { path: "/role-management", label: "Role Management" }, // hidden
];

function pathTitle(path: string): string {
  if (path === "/") return "Dashboard";
  const found = NAV_TARGETS.find((t) => t.path === path);
  if (found) return found.label;
  // Fallback: derive from path segment
  return path
    .replace(/^\//, "")
    .split("/")[0]
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // Cmd/Ctrl + K opens command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close palette on outside click
  useEffect(() => {
    if (!paletteOpen) return;
    const onClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    setTimeout(() => paletteInputRef.current?.focus(), 50);
    return () => document.removeEventListener("mousedown", onClick);
  }, [paletteOpen]);

  const filteredTargets = query
    ? NAV_TARGETS.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.label.toLowerCase().includes(q) ||
          t.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : NAV_TARGETS.slice(0, 8);

  const goTo = (path: string) => {
    setPaletteOpen(false);
    setQuery("");
    navigate(path);
  };

  const currentTitle = pathTitle(location.pathname);

  return (
    <>
      <header className="glass sticky top-0 z-40 w-full border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-4 lg:px-6">
          {/* Sidebar toggle */}
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Mobile logo (sidebar hidden) */}
          <Link to="/" className="lg:hidden">
            <img
              className="h-7 dark:hidden"
              src="images/logo/logo.png"
              alt="Travelo"
            />
            <img
              className="hidden h-7 dark:block"
              src="./images/logo/logo.png"
              alt="Travelo"
            />
          </Link>

          {/* Page title (lg+) */}
          <div className="hidden flex-1 lg:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Admin Panel
            </p>
            <h1 className="-mt-0.5 truncate text-base font-semibold text-gray-800 dark:text-white/90">
              {currentTitle}
            </h1>
          </div>

          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white/60 px-3 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:border-gray-700 sm:inline-flex md:w-72"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Quick search…</span>
            <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 md:inline">
              ⌘K
            </kbd>
          </button>

          {/* Mobile search icon only */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 sm:hidden"
          >
            <Search size={18} />
          </button>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggleButton />
            <div className="hidden h-8 w-px bg-gray-200 dark:bg-gray-800 sm:block" />
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Command palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-gray-900/50 px-4 pt-[15vh] backdrop-blur-sm animate-fade-in">
          <div
            ref={paletteRef}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
              <Search size={16} className="text-gray-400" />
              <input
                ref={paletteInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page or feature…"
                className="h-12 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white/90"
              />
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                ESC
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filteredTargets.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  No matches for "{query}"
                </div>
              ) : (
                <ul>
                  {filteredTargets.map((t) => (
                    <li key={t.path}>
                      <button
                        type="button"
                        onClick={() => goTo(t.path)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <span>{t.label}</span>
                        <span className="font-mono text-[11px] text-gray-400">
                          {t.path}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AppHeader;
