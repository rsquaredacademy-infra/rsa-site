type SiteKitWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  parseConsentCookie?: (cookies: string) => 'granted' | 'denied' | null;
  shouldShowBanner?: (timeZone: string, choice: string | null) => boolean;
};

/** Use site-kit's consent policy and the same gtag entry point as sign_up. */
export function trackEvent(name: string, parameters: Record<string, string>): void {
  const kit = window as SiteKitWindow;
  // Fail closed while site-kit is unavailable; never queue a pre-consent play.
  if (!kit.gtag || !kit.parseConsentCookie || !kit.shouldShowBanner) return;
  const choice = kit.parseConsentCookie(document.cookie);
  let timeZone = '';
  try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* Site-kit prompts for an unknown zone. */ }
  if (choice === 'denied' || kit.shouldShowBanner(timeZone, choice)) return;
  kit.gtag('event', name, parameters);
}
