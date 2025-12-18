import { Link } from "react-router-dom";
import { AcademicCapIcon } from "@heroicons/react/16/solid";
import AccountMenu from "./AccountMenu";

function Navigation() {

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Blurring shade background layer with fade */}
      <div 
        className="absolute inset-0 backdrop-blur-xl pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: '-webkit-linear-gradient(to bottom, black, transparent)',
          MozMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />
      {/* Content layer */}
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-7 text-white/90 drop-shadow-lg" />
          <span className="text-xl font-bold text-white/95 tracking-tight drop-shadow-md">
            Semni
          </span>
        </div>

        <div className="absolute top-4 right-6 flex items-center gap-3">
          <Link to="/privacy-policy" className="text-sm font-medium text-white/75 hover:underline hover:text-white/95">
            Politica de confidențialitate
          </Link>

          <div>
            {/* Account menu */}
            <AccountMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
