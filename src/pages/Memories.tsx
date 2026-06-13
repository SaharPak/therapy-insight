import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVaultKey } from "../context/VaultContext";
import { getNotes } from "../db/database";
import type { Note } from "../types";
import { useLang } from "../i18n/LanguageContext";
import { formatMonthYear } from "../lib/date";
import { BookIcon, CameraIcon, PlusIcon } from "../components/icons";

export function Memories() {
  const key = useVaultKey();
  const { t } = useLang();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let urls: string[] = [];
    getNotes(key).then((result) => {
      urls = result.map((n) => n.imageUrl).filter(Boolean) as string[];
      setNotes(result);
    });
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [key]);

  if (notes === null) {
    return <p className="py-10 text-center text-sage-500">{t("loading")}</p>;
  }

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? notes.filter((n) => n.text.toLowerCase().includes(trimmed))
    : notes;

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-sage-700">
          {t("memories_title")}
        </h1>
        <p className="mt-1 text-sm text-sage-600">
          {notes.length === 0
            ? t("memories_empty_sub")
            : t(
                notes.length === 1
                  ? "memories_count_one"
                  : "memories_count_other",
                { n: notes.length },
              )}
        </p>
      </header>

      {notes.length === 0 ? (
        <Link
          to="/capture"
          className="card flex flex-col items-center gap-3 py-10 text-center text-sage-600"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-500">
            <BookIcon className="h-7 w-7" />
          </span>
          <span className="font-medium">{t("memories_empty_title")}</span>
          <span className="inline-flex items-center gap-1 text-sm text-sage-500">
            <PlusIcon className="h-4 w-4" /> {t("memories_empty_cta")}
          </span>
        </Link>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("memories_search_ph")}
            dir="auto"
            className="input"
            aria-label={t("memories_search_ph")}
          />

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-sage-500">
              {t("memories_no_results")}
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((note) => (
            <li key={note.id}>
              <Link
                to={`/memories/${note.id}`}
                className="card flex gap-4 transition active:scale-[0.99]"
              >
                {note.imageUrl ? (
                  <img
                    src={note.imageUrl}
                    alt=""
                    className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-400">
                    <BookIcon className="h-7 w-7" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-sage-500">
                    {note.source === "photo" && (
                      <CameraIcon className="h-3.5 w-3.5" />
                    )}
                    {formatMonthYear(note.noteDate)}
                  </div>
                  <p
                    className="mt-1 line-clamp-3 text-sm leading-relaxed text-sage-700"
                    dir="auto"
                  >
                    {note.text}
                  </p>
                </div>
              </Link>
            </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
