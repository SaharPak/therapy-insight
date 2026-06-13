import { useState } from "react";
import { HeartIcon } from "./icons";

/**
 * A persistent, unobtrusive link to crisis resources. This app offers
 * affirmations and reminders, never clinical advice; if someone is in distress
 * they should be able to reach real help in one tap.
 */
export function CrisisFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 py-3 text-xs text-sage-500/80 transition hover:text-sage-600"
      >
        <HeartIcon className="h-3.5 w-3.5" />
        Need to talk to someone now?
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
              You deserve support
            </h2>
            <p className="mt-2 text-sm text-sage-600">
              Therapy Insight is a personal reflection tool, not a substitute
              for professional care. If you are in crisis or thinking about
              harming yourself, please reach out right now.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  US &amp; Canada
                </span>
                <br />
                Call or text <strong>988</strong> (Suicide &amp; Crisis
                Lifeline)
              </li>
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">UK &amp; ROI</span>
                <br />
                Call <strong>116 123</strong> (Samaritans)
              </li>
              <li className="rounded-2xl bg-sand-100 p-3">
                <span className="font-medium text-sage-700">
                  Elsewhere
                </span>
                <br />
                Find a helpline at{" "}
                <a
                  className="text-sage-500 underline"
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  findahelpline.com
                </a>
              </li>
              <li className="rounded-2xl bg-bloom-400/15 p-3 text-sage-700">
                If you are in immediate danger, call your local emergency
                number.
              </li>
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
