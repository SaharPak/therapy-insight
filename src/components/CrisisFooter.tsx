import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { HeartIcon } from "./icons";

/**
 * A persistent, unobtrusive link to crisis resources. This app offers
 * affirmations and reminders, never clinical advice; if someone is in distress
 * they should be able to reach real help in one tap.
 */
export function CrisisFooter() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 py-3 text-xs text-sage-500/80 transition hover:text-sage-600"
      >
        <HeartIcon className="h-3.5 w-3.5" />
        {t("crisis_link")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-sage-700/30 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-sage-700">
              {t("crisis_title")}
            </h2>
            <p className="mt-2 text-sm text-sage-600">{t("crisis_body")}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  {t("crisis_region_us")}
                </span>
                <br />
                {t("crisis_help_us")}
              </li>
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  {t("crisis_region_uk")}
                </span>
                <br />
                {t("crisis_help_uk")}
              </li>
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  {t("crisis_region_ir")}
                </span>
                <br />
                {t("crisis_help_ir")}
              </li>
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  {t("crisis_region_other")}
                </span>
                <br />
                <a
                  className="text-sage-500 underline"
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("crisis_help_other")}
                </a>
              </li>
              <li className="rounded-2xl bg-bloom-400/15 p-3 text-sage-700">
                {t("crisis_danger")}
              </li>
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              {t("crisis_close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
