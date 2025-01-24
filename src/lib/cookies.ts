export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const getCookieConsent = (): CookieConsent | null => {
  const consent = localStorage.getItem("cookieConsent");
  return consent ? JSON.parse(consent) : null;
};

export const hasCookieConsent = (type: keyof CookieConsent): boolean => {
  const consent = getCookieConsent();
  return consent ? consent[type] : false;
};