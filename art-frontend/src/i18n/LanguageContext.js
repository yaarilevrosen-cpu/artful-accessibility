import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./translations/en";
import he from "./translations/he";

const dictionaries = { en, he };
const STORAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
const RTL_LANGUAGES = new Set(["he"]);

// Dev-only completeness check: the two dictionaries must define exactly the
// same keys. A silent gap here is exactly the "half-migrated mess" the
// language toggle must not become, so make it loud instead of blank.
if (process.env.NODE_ENV === "development") {
  const enKeys = new Set(Object.keys(en));
  const heKeys = new Set(Object.keys(he));
  const missingInHe = [...enKeys].filter((k) => !heKeys.has(k));
  const missingInEn = [...heKeys].filter((k) => !enKeys.has(k));
  if (missingInHe.length) {
    console.error("[i18n] Missing Hebrew translations for keys:", missingInHe);
  }
  if (missingInEn.length) {
    console.error("[i18n] Missing English translations for keys:", missingInEn);
  }
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.keys(vars).reduce(
    (acc, name) => acc.replaceAll(`{${name}}`, vars[name]),
    str
  );
}

function translate(language, key, vars) {
  const dict = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return interpolate(dict[key], vars);
  }
  if (process.env.NODE_ENV === "development") {
    console.error(`[i18n] Missing translation key "${key}" for language "${language}"`);
    return `⚠missing:${key}⚠`;
  }
  // Production: fall back to English, then the bare key, rather than blank.
  return interpolate(dictionaries.en[key] || key, vars);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return stored === "en" || stored === "he" ? stored : DEFAULT_LANGUAGE;
  });

  const dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "he" : "en");
  }, [language, setLanguage]);

  const t = useCallback((key, vars) => translate(language, key, vars), [language]);

  const value = { language, setLanguage, toggleLanguage, dir, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}
