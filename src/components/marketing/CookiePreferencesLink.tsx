"use client";

import { reopenCookiePreferences } from "./CookieBanner";

export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={reopenCookiePreferences}
      className="focus-ring underline hover:text-paper-100/60"
    >
      Manage cookie preferences
    </button>
  );
}
