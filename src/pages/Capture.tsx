import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVaultKey } from "../context/VaultContext";
import { addNote } from "../db/database";
import { getProvider, loadAIConfig } from "../ai";
import type { AILang } from "../ai";
import { useLang } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
import { compressImage, fileToDataUrl } from "../lib/image";
import { fromDateInputValue, toDateInputValue } from "../lib/date";
import { CameraIcon, PlusIcon, SparkIcon } from "../components/icons";

type Step = "choose" | "review";

export function Capture() {
  const key = useVaultKey();
  const { t, lang } = useLang();
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
  const providerLabel = t(`provider_${provider.id}_label` as TranslationKey);

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
      setError(t("capture_err_image"));
    }
  }

  async function runOcr(file: File) {
    if (provider.sendsDataOffDevice) {
      // Cloud providers require explicit consent before sending the image.
      const consent = window.confirm(
        t("capture_consent", { provider: providerLabel }),
      );
      if (!consent) return;
    }
    setOcrBusy(true);
    try {
      const extracted = await provider.ocr(file, lang as AILang);
      setText((current) => current || extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("capture_err_ocr"));
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
      setError(t("capture_err_empty"));
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
      setError(t("capture_err_save"));
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
        <h1 className="font-serif text-2xl text-sage-700">
          {t("capture_title")}
        </h1>
        <p className="mt-1 text-sm text-sage-600">{t("capture_subtitle")}</p>
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
            <span className="font-medium">{t("capture_take_photo")}</span>
            <span className="text-xs text-sage-500/80">
              {t("capture_photo_hint")}
            </span>
          </button>

          <button onClick={startManual} className="btn-ghost w-full">
            <PlusIcon className="h-4 w-4" />
            {t("capture_write_instead")}
          </button>

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <p className="rounded-2xl bg-sage-100/60 p-3 text-xs text-sage-600">
            {t("capture_using", { provider: providerLabel })}{" "}
            {provider.sendsDataOffDevice
              ? t("capture_offdevice_warn")
              : t("capture_ondevice")}
          </p>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-5">
          {previewUrl && (
            <img
              src={previewUrl}
              alt=""
              className="max-h-72 w-full rounded-3xl object-cover shadow-card"
            />
          )}

          <label className="block">
            <span className="text-xs font-medium text-sage-600">
              {t("capture_when")}
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
              <span>{t("capture_note_text")}</span>
              {ocrBusy && (
                <span className="flex items-center gap-1 text-sage-500">
                  <SparkIcon className="h-3.5 w-3.5 animate-pulse" />
                  {t("capture_reading")}
                </span>
              )}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              dir="auto"
              className="input mt-1 resize-none leading-relaxed"
              placeholder={
                ocrBusy ? t("capture_extracting") : t("capture_text_ph")
              }
            />
          </label>

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-ghost flex-1">
              {t("back")}
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
              disabled={saving || ocrBusy}
            >
              {saving ? t("saving") : t("capture_save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
