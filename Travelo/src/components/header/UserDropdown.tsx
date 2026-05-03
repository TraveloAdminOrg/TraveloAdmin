import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";

const FALLBACK_AVATAR = "./images/user/owner.jpg";

function displayName(email?: string) {
  if (!email) return "Admin";
  // Use the part before "@" and prettify, e.g. "super.admin" -> "Super Admin".
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await logout();
      toast.success("Signed out");
      closeDropdown();
      navigate("/signin", { replace: true });
    } catch {
      // logout() already swallows errors and clears local state — fall through.
      navigate("/signin", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const name = displayName(admin?.email);
  const avatar = admin?.image || FALLBACK_AVATAR;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img
            src={avatar}
            alt={name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{name}</span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {admin?.email ?? "—"}
          </span>
          {admin?.type && (
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {admin.type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />

        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </Dropdown>
    </div>
  );
}
