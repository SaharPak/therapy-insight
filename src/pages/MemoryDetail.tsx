import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVaultKey } from "../context/VaultContext";
import { deleteNote, getNote, updateNoteText } from "../db/database";
import type { Note } from "../types";
import { formatDate } from "../lib/date";
import { ChevronLeftIcon, TrashIcon } from "../components/icons";

export function MemoryDetail() {
  const key = useVaultKey();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let url: string | undefined;
    getNote(key, id).then((result) => {
      url = result?.imageUrl;
      setNote(result ?? null);
      setDraft(result?.text ?? "");
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [key, id]);

  async function handleSaveEdit() {
    if (!id) return;
    setSaving(true);
    await updateNoteText(key, id, draft.trim());
    setNote((n) => (n ? { ...n, text: draft.trim() } : n));
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this memory? This can't be undone.")) return;
    await deleteNote(id);
    navigate("/memories");
  }

  if (note === undefined) {
    return <p className="py-10 text-center text-sage-500">Loading…</p>;
  }

  if (note === null) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/memories")}
          className="flex items-center gap-1 text-sm text-sage-500"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back
        </button>
        <p className="text-sage-600">This memory could not be found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/memories")}
          className="flex items-center gap-1 text-sm text-sage-500"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Memories
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-sm text-bloom-500"
        >
          <TrashIcon className="h-4 w-4" /> Delete
        </button>
      </div>

      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt="Note"
          className="w-full rounded-3xl object-contain shadow-card"
        />
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
        {formatDate(note.noteDate)}
      </p>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            className="input resize-none leading-relaxed"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDraft(note.text);
                setEditing(false);
              }}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn-primary flex-1"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card whitespace-pre-wrap text-[15px] leading-relaxed text-sage-700">
            {note.text}
          </div>
          <button onClick={() => setEditing(true)} className="btn-ghost w-full">
            Edit text
          </button>
        </>
      )}
    </div>
  );
}
