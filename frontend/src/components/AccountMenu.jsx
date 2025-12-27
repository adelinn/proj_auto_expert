import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, startTransition } from "react";
import { UserIcon, DocumentTextIcon, RectangleStackIcon } from "@heroicons/react/16/solid";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from '../hooks/useAuth';
import { removeToken } from '../utils/token';
import ChooseCategoryModal from './ChooseCategoryModal';
import { CATEGORIES } from "../contexts/categoryModalContext";

export default function AccountMenu() {
  const { userData, isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(() => localStorage.getItem('userCategory'));

  // Extract user from decoded token data
  const user = userData?.user || null;

  // Listen for category changes in localStorage
  useEffect(() => {
    // Listen for storage events (when category changes in other tabs/components)
    function handleStorageChange(e) {
      if (e.key === 'userCategory') {
        startTransition(() => {
          setCurrentCategory(e.newValue);
        });
      }
    }

    // Listen for custom event (when category changes in same tab)
    function handleCategoryChange() {
      startTransition(() => {
        setCurrentCategory(localStorage.getItem('userCategory'));
      });
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categoryChanged', handleCategoryChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoryChanged', handleCategoryChange);
    };
  }, []);

  // Update category when modal closes (in case it was changed)
  useEffect(() => {
    if (!isCategoryModalOpen) {
      // Small delay to ensure localStorage is updated
      const timer = setTimeout(() => {
        startTransition(() => {
          setCurrentCategory(localStorage.getItem('userCategory'));
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCategoryModalOpen]);

  const logout = () => {
    removeToken();
    // Refresh auth state to clear userData
    refreshAuth();
    navigate("/login");
  };

  // Build category labels map
  const categoryLabels = {};
  CATEGORIES.forEach(cat => categoryLabels[cat.key] = cat.title);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="inline-flex items-center gap-2 rounded-md bg-white/5 backdrop-blur-md px-3 py-2 text-sm font-medium text-white/90 shadow-sm border border-white/10 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-white/20">
          <UserIcon className="size-4 text-white/80" />
          <span className="max-md:hidden">My account</span>
        </MenuButton>

        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-black/10 backdrop-blur-xl text-sm/6 text-white border border-white/5 shadow-lg p-2 focus:outline-none z-50">
          {/* Not logged: show Login first */}
          {!isAuthenticated && (
            <MenuItem>
              <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-sm data-active:bg-white/6 rounded-md">
                <UserIcon className="size-4 text-white/80" />
                Login
              </Link>
            </MenuItem>
          )}

          {/* Logged: show user name (non-clickable) */}
          {isAuthenticated && user && (
            <div className="px-3 py-2 text-sm text-white/90">
              <div className="font-semibold">{user.name}</div>
            </div>
          )}

          <div className="border-t border-white/3 my-1" />

          {isAuthenticated && (
            <MenuItem>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm data-active:bg-white/6 rounded-md"
              >
                <RectangleStackIcon className="size-4 text-white/80" />
                <div className="flex-1">
                  <div>Categorie</div>
                  {currentCategory && (
                    <div className="text-xs text-white/60">
                      {categoryLabels[currentCategory] || currentCategory}
                    </div>
                  )}
                </div>
              </button>
            </MenuItem>
          )}

          <MenuItem>
            <Link to="/privacy-policy" className="flex items-center gap-2 px-3 py-2 text-sm data-active:bg-white/6 rounded-md">
              <DocumentTextIcon className="size-4 text-white/80" />
              Politica de confidențialitate
            </Link>
          </MenuItem>

          {isAuthenticated && (
            <MenuItem>
              <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm data-active:bg-white/6 rounded-md">
                <ArrowRightStartOnRectangleIcon className="size-4 text-white/80" />
                Logout
              </button>
            </MenuItem>
          )}
        </MenuItems>
      </Menu>

      <ChooseCategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
}
