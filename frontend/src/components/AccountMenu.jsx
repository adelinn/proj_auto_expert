import { Menu } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, ArrowRightOnRectangleIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
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
      <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-white/5 backdrop-blur-md px-3 py-2 text-sm font-medium text-white/90 shadow-sm border border-white/10 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-white/20">
        <UserIcon className="size-4 text-white/80" />
        <span className="hidden sm:inline">{user?.name ? user.name : "Guest"}</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white/5 border border-white/5 shadow-lg p-2 focus:outline-none z-50">
        <div className="px-3 py-2 text-sm text-white/90">
          <div className="font-semibold">{user?.name ? user.name : "Guest"}</div>
          <div className="text-xs text-white/70">{user?.email || ""}</div>
        </div>

        <div className="border-t border-white/3 my-1" />

        <Menu.Item>
          {({ active }) => (
            <Link to="/privacy-policy" className={`flex items-center gap-2 px-3 py-2 text-sm ${active ? "bg-white/6" : ""} rounded-md`}>
              <DocumentTextIcon className="size-4 text-white/80" />
              Politica de confidențialitate
            </Link>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button onClick={logout} className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm ${active ? "bg-white/6" : ""} rounded-md`}>
              <ArrowRightOnRectangleIcon className="size-4 text-white/80" />
              Logout
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
