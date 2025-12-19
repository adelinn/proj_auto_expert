import { useState, useEffect, startTransition } from 'react';
import { getCookieConsent, setCookieConsent } from '../utils/cookieConsent';

/**
 * Hook to manage cookie consent state
 * @returns {object} - { consent, hasConsent, acceptCookies, declineCookies }
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get consent status from localStorage
    const storedConsent = getCookieConsent();
    // Use startTransition to schedule state updates
    startTransition(() => {
      setConsent(storedConsent);
      setIsLoading(false);
    });
  }, []);

  const acceptCookies = () => {
    setCookieConsent('accepted');
    setConsent('accepted');
  };

  const declineCookies = () => {
    setCookieConsent('declined');
    setConsent('declined');
  };

  return {
    consent,
    hasConsent: consent !== null,
    isAccepted: consent === 'accepted',
    isLoading,
    acceptCookies,
    declineCookies
  };
}

