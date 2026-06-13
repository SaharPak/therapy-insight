import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Lang,
  type TranslationKey,
  dirFor,
  localeFor,
  translations,
} from "./translations";
import { setDateLocale } from "../lib/date";

type TParams = Record<string, string | number>;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key, with optional {placeholder} substitution. */
  t: (key: TranslationKey, params?: TParams) => string;
  /** BCP-47 locale string for the active language (date formatting). */
  locale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "therapy-insight:lang";

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fa") return stored;
  const nav = navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("fa") ? "fa" : "en";
}

function applyDocumentLang(lang: Lang) {
  const el = document.documentElement;
  el.lang = lang;
  el.dir = dirFor[lang];
  setDateLocale(localeFor[lang]);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const initial = detectInitialLang();
    // Apply synchronously so first render (and date helpers) use it.
    applyDocumentLang(initial);
    return initial;
  });

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    applyDocumentLang(next);
    setLangState(next);
  }, []);

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey, params?: TParams) => {
      let str = translations[lang][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t, locale: localeFor[lang] }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
