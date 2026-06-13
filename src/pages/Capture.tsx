import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVaultKey } from "../context/VaultContext";
import { addNote } from "../db/database";
import { getProvider, loadAIConfig } from "../ai";
import { compressImage, fileToDataUrl } from "../lib/image";
import { fromDateInputValue, toDateInputValue } from "../lib/date";
import { CameraIcon, PlusIcon, SparkIcon } from "../components/icons";

type Step = "choose" | "review";

export function Capture() {
  const key = useVaultKey();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("choose");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBytes, setImageBytes] = useState<ArrayBuffer | null>(null);
  const [text, setText] = useState("");
  const [noteDate, setNoteDate] = useState(toDateInputValue(Date.now()));
  const [ocrBusy, setOcrBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = loadAIConfig();
  const provider = getProvider(config);

  async function handleFile(file: File) {
    setError(null);
    try {
      const [dataUrl, bytes] = await Promise.all([
        fileToDataUrl(file),
        compressImage(file),
      ]);
      setPreviewUrl(dataUrl);
      setImageBytes(bytes);
      setStep("review");
      void runOcr(file);
    } catch {
      setError("Sorry, that image couldn't be loaded. Try another photo.");
    }
  }

  async function runOcr(file: File) {
    if (provider.sendsDataOffDevice) {
      // Cloud providers require explicit consent before sending the image.
      const consent = window.confirm(
        `Extract text using ${provider.label}? This sends the photo off your device. Choose Cancel to type the text yourself.`,
      );
      if (!consent) return;
    }
    setOcrBusy(true);
    try {
      const extracted = await provider.ocr(file);
      setText((current) => current || extracted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Text extraction failed. You can type the text instead.",
      );
    } finally {
      setOcrBusy(false);
    }
  }

  function startManual() {
    setPreviewUrl(null);
    setImageBytes(null);
    setText("");
    setStep("review");
  }

  async function handleSave() {
    if (!text.trim()) {
      setError("Add a little text so this memory has something to hold onto.");
      return;
    }
    setSaving(true);
    try {
      await addNote(key, {
        text: text.trim(),
        noteDate: fromDateInputValue(noteDate),
        source: imageBytes ? "photo" : "manual",
        imageBytes: imageBytes ?? undefined,
      });
      navigate("/memories");
    } catch {
      setError("Something went wrong while saving. Please try again.");
      setSaving(false);
    }
  }

  function reset() {
    setStep("choose");
    setPreviewUrl(null);
    setImageBytes(null);
    setText("");
    setError(null);
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-sage-700">Capture a memory</h1>
        <p className="mt-1 text-sm text-sage-600">
          Photograph a page from your notes, or write a reflection. It's
          encrypted the moment you save it.
        </p>
      </header>

      {step === "choose" && (
        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="card flex w-full flex-col items-center gap-3 border border-dashed border-sage-400/40 py-10 text-sage-600 transition active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-500 text-white shadow-soft">
              <CameraIcon className="h-7 w-7" />
            </span>
            <span className="font-medium">Take or choose a photo</span>
            <span className="text-xs text-sage-500/80">
              Handwritten or printed notes both work
            </span>
          </button>

          <button onClick={startManual} className="btn-ghost w-full">
            <PlusIcon className="h-4 w-4" />
            Write a reflection instead
          </button>

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <p className="rounded-2xl bg-sage-100/60 p-3 text-xs text-sage-600">
            Using {provider.label}.{" "}
            {provider.sendsDataOffDevice
              ? "You'll be asked before any photo leaves your device."
              : "Nothing leaves your device."}
          </p>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-5">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Note preview"
              className="max-h-72 w-full rounded-3xl object-cover shadow-card"
            />
          )}

          <label className="block">
            <span className="text-xs font-medium text-sage-600">
              When was this from?
            </span>
            <input
              type="date"
              value={noteDate}
              max={toDateInputValue(Date.now())}
              onChange={(e) => setNoteDate(e.target.value)}
              className="input mt-1"
            />
          </label>

          <label className="block">
            <span className="flex items-center justify-between text-xs font-medium text-sage-600">
              <span>Note text</span>
              {ocrBusy && (
                <span className="flex items-center gap-1 text-sage-500">
                  <SparkIcon className="h-3.5 w-3.5 animate-pulse" />
                  Reading…
                </span>
              )}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="input mt-1 resize-none leading-relaxed"
              placeholder={
                ocrBusy
                  ? "Extracting the words from your photo\u2026"
                  : "What did this session hold? You can edit anything here."
              }
            />
          </label>

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-ghost flex-1">
              Back
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
              disabled={saving || ocrBusy}
            >
              {saving ? "Saving\u2026" : "Save memory"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
