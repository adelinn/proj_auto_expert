import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  MenuButton as MenuButton_,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  AcademicCapIcon,
  ChevronDownIcon,
  PencilIcon,
} from "@heroicons/react/16/solid";

function MenuButton() {
  const location = useLocation();

  const links = [
    { path: "/", label: "Home", icon: PencilIcon },
    { path: "/products", label: "Products" },
    { path: "/about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassy title bar */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="size-7 text-white/90 drop-shadow-lg" />
            <span className="text-xl font-bold text-white/95 tracking-tight drop-shadow-md">
              Semni
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="absolute top-4 right-6">
        <Menu>
          <MenuButton_ className="inline-flex items-center gap-2 rounded-md bg-beige-800/10 backdrop-blur-md px-4 py-2 text-sm font-semibold text-beige-100/90 shadow-lg shadow-black/10 border border-white/20 hover:bg-beige-100/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200">
            Menu
            <ChevronDownIcon className="size-4 text-white/70" />
          </MenuButton_>

          <MenuItems
            transition
            anchor="bottom end"
            className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
          >
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <MenuItem key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${
                      location.pathname === link.path ? "active" : ""
                    } group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10`}
                  >
                    {Icon && <Icon className="size-4 fill-white/30" />}
                    {link.label}
                  </Link>
                </MenuItem>
              );
            })}
          </MenuItems>
        </Menu>
      </div>
    </nav>
  );
}

export default MenuButton;
