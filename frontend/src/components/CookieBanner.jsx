import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { loadFirebaseAnalytics, removeFirebaseAnalytics } from '../utils/analytics';

export default function CookieBanner() {
  const location = useLocation();
  const { _consent, hasConsent, acceptCookies: baseAcceptCookies, declineCookies: baseDeclineCookies, isLoading } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);

  const handleAccept = async () => {
    baseAcceptCookies();
    // Load Firebase Analytics when consent is given
    await loadFirebaseAnalytics();
  };

  const handleDecline = () => {
    baseDeclineCookies();
    // Remove Firebase Analytics if consent is declined
    removeFirebaseAnalytics();
  };

  useEffect(() => {
    // Only show banner if consent hasn't been given yet
    if (!isLoading && !hasConsent) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasConsent]);

  // Don't show banner on privacy policy page
  if (location.pathname === '/privacy-policy') {
    return null;
  }

  if (isLoading || hasConsent) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍪</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white/95 mb-1">
                    Folosim cookie-uri pentru a îmbunătăți experiența ta
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Folosim cookie-uri pentru analiză (Firebase Analytics) pentru a înțelege cum folosești aplicația. 
                    Poți accepta sau refuza cookie-urile de analiză.{' '}
                    <Link 
                      to="/privacy-policy" 
                      className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                    >
                      Află mai multe
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-xs font-medium text-white/80 hover:text-white/95 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors duration-200"
              >
                Refuză
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200"
              >
                Acceptă
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

