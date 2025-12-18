import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function AccountMenu() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch (err) {
        setUser(null);
      }
    };

    load();
    const onStorage = (e) => {
      if (e.key === "user") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex items-center gap-2 rounded-md bg-white/5 backdrop-blur-md px-3 py-2 text-sm font-medium text-white/90 shadow-sm border border-white/10 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-white/20">
        <UserIcon className="size-4 text-white/80" />
        <span>My account</span>
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white/5 border border-white/5 shadow-lg p-2 focus:outline-none z-50">
        {/* Not logged: show Login first */}
        {!user && (
          <MenuItem>
            {({ active }) => (
              <Link to="/login" className={`flex items-center gap-2 px-3 py-2 text-sm ${active ? "bg-white/6" : ""} rounded-md`}>
                <UserIcon className="size-4 text-white/80" />
                Login
              </Link>
            )}
          </MenuItem>
        )}

        {/* Logged: show user name (non-clickable) */}
        {user && (
          <div className="px-3 py-2 text-sm text-white/90">
            <div className="font-semibold">{user.name}</div>
          </div>
        )}

        <div className="border-t border-white/3 my-1" />

        <MenuItem>
          {({ active }) => (
            <Link to="/privacy-policy" className={`flex items-center gap-2 px-3 py-2 text-sm ${active ? "bg-white/6" : ""} rounded-md`}>
              <DocumentTextIcon className="size-4 text-white/80" />
              Politica de confidențialitate
            </Link>
          )}
        </MenuItem>

        {user && (
          <MenuItem>
            {({ active }) => (
              <button onClick={logout} className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm ${active ? "bg-white/6" : ""} rounded-md`}>
                <ArrowRightOnRectangleIcon className="size-4 text-white/80" />
                Logout
              </button>
            )}
          </MenuItem>
        )}
      </MenuItems>
    </Menu>
  );
}
