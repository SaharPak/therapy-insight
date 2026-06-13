import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVaultKey } from "../context/VaultContext";
import { getInsightForDate, getNotes, saveInsight } from "../db/database";
import type { Insight } from "../types";
import { getProvider } from "../ai";
import type { AILang, NoteContext } from "../ai";
import { useLang } from "../i18n/LanguageContext";
import { friendlyToday, isoDate } from "../lib/date";
import { CameraIcon, SparkIcon, SunIcon } from "../components/icons";

export function Today() {
  const key = useVaultKey();
  const { t, lang } = useLang();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = isoDate();
      const notes = await getNotes(key);
      if (cancelled) return;
      setNoteCount(notes.length);

      // Reuse today's insight if we already built one in this language;
      // otherwise generate it from the user's own notes and persist it.
      let todaysInsight = await getInsightForDate(key, today);
      if (!todaysInsight || todaysInsight.lang !== lang) {
        const context: NoteContext[] = notes.map((n) => ({
          id: n.id,
          text: n.text,
          noteDate: n.noteDate,
        }));
        const result = await getProvider().generateDailyInsight(
          context,
          today,
          lang as AILang,
        );
        todaysInsight = await saveInsight(key, today, {
          strength: result.strength,
          reminder: result.reminder,
          affirmation: result.affirmation,
          sourceNoteIds: result.sourceNoteIds,
          lang,
        });
      }

      if (!cancelled) {
        setInsight(todaysInsight);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [key, lang]);

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
            {friendlyToday()}
          </p>
          <h1 className="mt-0.5 font-serif text-2xl text-sage-700">
            {t("today_title")}
          </h1>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bloom-400/20 text-bloom-500">
          <SunIcon className="h-6 w-6" />
        </span>
      </header>

      {loading ? (
        <div className="card flex items-center gap-3 text-sage-500">
          <SparkIcon className="h-5 w-5 animate-pulse" />
          {t("today_gathering")}
        </div>
      ) : insight ? (
        <>
          <section className="card space-y-2 bg-gradient-to-br from-sage-500 to-sage-600 text-white">
            <div className="flex items-center gap-2 text-sage-100">
              <SparkIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("today_affirmation")}
              </span>
            </div>
            <p className="font-serif text-xl leading-snug" dir="auto">
              {insight.affirmation}
            </p>
          </section>

          <section className="card space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-sage-500">
              {t("today_strength")}
            </h2>
            <p className="text-[15px] leading-relaxed text-sage-700" dir="auto">
              {insight.strength}
            </p>
          </section>

          <section className="card space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-sage-500">
              {t("today_from_words")}
            </h2>
            <p className="text-[15px] leading-relaxed text-sage-700" dir="auto">
              {insight.reminder}
            </p>
            {insight.sourceNoteIds.length > 0 && (
              <Link
                to={`/memories/${insight.sourceNoteIds[0]}`}
                className="inline-block pt-1 text-sm font-medium text-sage-500 underline"
              >
                {t("today_revisit")}
              </Link>
            )}
          </section>

          {noteCount === 0 && (
            <Link
              to="/capture"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-sage-400/40 bg-white/60 px-5 py-4 text-sm font-medium text-sage-600"
            >
              <CameraIcon className="h-4 w-4" />
              {t("today_add_first")}
            </Link>
          )}
        </>
      ) : null}
    </div>
  );
}
