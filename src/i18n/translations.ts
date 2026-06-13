export type Lang = "en" | "fa";

/** BCP-47 locale used for date formatting (Persian uses the Jalali calendar). */
export const localeFor: Record<Lang, string> = {
  en: "en-US",
  fa: "fa-IR-u-ca-persian",
};

export const dirFor: Record<Lang, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
};

export const langLabel: Record<Lang, string> = {
  en: "English",
  fa: "فارسی",
};

const en = {
  // Brand
  brand: "Therapy Insight",

  // Bottom navigation
  nav_today: "Today",
  nav_capture: "Capture",
  nav_memories: "Memories",
  nav_settings: "Settings",

  // Loading / generic
  loading: "Loading…",
  opening: "Opening your space…",
  back: "Back",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",

  // Vault gate
  gate_setup_subtitle:
    "Let's protect your notes. Choose a passphrase — it stays on this device and encrypts everything you save.",
  gate_unlock_subtitle: "Welcome back. Enter your passphrase to unlock your notes.",
  gate_passphrase: "Passphrase",
  gate_confirm: "Confirm passphrase",
  gate_passphrase_ph: "Your private passphrase",
  gate_confirm_ph: "Type it again",
  gate_err_short: "Please choose a passphrase of at least 6 characters.",
  gate_err_match: "The two passphrases do not match.",
  gate_err_wrong: "That passphrase didn't work. Please try again.",
  gate_working: "Working…",
  gate_create: "Create my private space",
  gate_unlock: "Unlock",
  gate_no_recovery:
    "There is no password recovery — that's what keeps your notes private. Keep your passphrase somewhere safe.",

  // Today
  today_title: "Your insight for today",
  today_gathering: "Gathering something for you…",
  today_affirmation: "Affirmation",
  today_strength: "A strength to remember",
  today_from_words: "From your own words",
  today_revisit: "Revisit that memory",
  today_add_first: "Add your first note to make this personal",

  // Capture
  capture_title: "Capture a memory",
  capture_subtitle:
    "Photograph a page from your notes, or write a reflection. It's encrypted the moment you save it.",
  capture_take_photo: "Take or choose a photo",
  capture_photo_hint: "Handwritten or printed notes both work",
  capture_write_instead: "Write a reflection instead",
  capture_using: "Using {provider}.",
  capture_offdevice_warn: "You'll be asked before any photo leaves your device.",
  capture_ondevice: "Nothing leaves your device.",
  capture_when: "When was this from?",
  capture_note_text: "Note text",
  capture_reading: "Reading…",
  capture_extracting: "Extracting the words from your photo…",
  capture_text_ph: "What did this session hold? You can edit anything here.",
  capture_save: "Save memory",
  capture_err_image: "Sorry, that image couldn't be loaded. Try another photo.",
  capture_err_empty:
    "Add a little text so this memory has something to hold onto.",
  capture_err_save: "Something went wrong while saving. Please try again.",
  capture_err_ocr: "Text extraction failed. You can type the text instead.",
  capture_consent:
    "Extract text using {provider}? This sends the photo off your device. Choose Cancel to type the text yourself.",

  // Memories
  memories_title: "Memories",
  memories_empty_sub: "Your saved notes will live here.",
  memories_count_one: "{n} memory, newest first.",
  memories_count_other: "{n} memories, newest first.",
  memories_empty_title: "Nothing here yet",
  memories_empty_cta: "Capture your first note",

  // Memory detail
  detail_not_found: "This memory could not be found.",
  detail_delete: "Delete",
  detail_delete_confirm: "Delete this memory? This can't be undone.",
  detail_edit: "Edit text",

  // Crisis footer
  crisis_link: "Need to talk to someone now?",
  crisis_title: "You deserve support",
  crisis_body:
    "Therapy Insight is a personal reflection tool, not a substitute for professional care. If you are in crisis or thinking about harming yourself, please reach out right now.",
  crisis_region_us: "US & Canada",
  crisis_help_us: "Call or text 988 (Suicide & Crisis Lifeline)",
  crisis_region_uk: "UK & ROI",
  crisis_help_uk: "Call 116 123 (Samaritans)",
  crisis_region_ir: "Iran",
  crisis_help_ir: "Call 1480 (Behzisti / Social Emergency)",
  crisis_region_other: "Elsewhere",
  crisis_help_other: "Find a helpline at findahelpline.com",
  crisis_danger: "If you are in immediate danger, call your local emergency number.",
  crisis_close: "Close",

  // Settings
  settings_title: "Settings",
  settings_language: "Language",
  settings_engine: "Insight engine",
  settings_saved: "Saved",
  settings_apikey: "API key",
  settings_apikey_ph: "Stored only on this device",
  settings_apikey_note:
    "Cloud providers aren't wired up yet in this prototype. Demo mode gives you the full experience today.",
  settings_data: "Your data",
  settings_data_note:
    "Everything is encrypted on this device with your passphrase. Export a decrypted backup, or remove it all.",
  settings_export: "Export a backup (JSON)",
  settings_lock: "Lock now",
  settings_delete: "Delete everything",
  settings_wipe_confirm:
    "Delete ALL notes, insights and your passphrase from this device? This cannot be undone.",
  settings_disclaimer:
    "Therapy Insight offers reflections and affirmations drawn from your own notes. It is not a medical device and does not provide diagnosis or treatment. Please keep seeing your therapist.",

  // AI providers
  provider_mock_label: "Demo mode (on-device)",
  provider_mock_note: "Realistic sample output. Nothing leaves your device.",
  provider_openai_label: "OpenAI (cloud)",
  provider_openai_note:
    "Coming soon. Sends note content off-device when enabled.",
  provider_anthropic_label: "Anthropic Claude (cloud)",
  provider_anthropic_note:
    "Coming soon. Sends note content off-device when enabled.",
};

export type TranslationKey = keyof typeof en;

const fa: Record<TranslationKey, string> = {
  brand: "بینش درمان",

  nav_today: "امروز",
  nav_capture: "ثبت",
  nav_memories: "خاطره‌ها",
  nav_settings: "تنظیمات",

  loading: "در حال بارگذاری…",
  opening: "در حال گشودن فضای تو…",
  back: "بازگشت",
  cancel: "انصراف",
  save: "ذخیره",
  saving: "در حال ذخیره…",

  gate_setup_subtitle:
    "بیا یادداشت‌هایت را محافظت کنیم. یک گذرواژه انتخاب کن — روی همین دستگاه می‌ماند و هر چیزی را که ذخیره می‌کنی رمزگذاری می‌کند.",
  gate_unlock_subtitle: "خوش آمدی. برای باز کردن یادداشت‌هایت گذرواژه‌ات را وارد کن.",
  gate_passphrase: "گذرواژه",
  gate_confirm: "تکرار گذرواژه",
  gate_passphrase_ph: "گذرواژهٔ خصوصی تو",
  gate_confirm_ph: "دوباره بنویس",
  gate_err_short: "لطفاً گذرواژه‌ای دست‌کم با ۶ نویسه انتخاب کن.",
  gate_err_match: "دو گذرواژه با هم یکی نیستند.",
  gate_err_wrong: "این گذرواژه درست نبود. لطفاً دوباره تلاش کن.",
  gate_working: "در حال انجام…",
  gate_create: "فضای خصوصی‌ام را بساز",
  gate_unlock: "باز کردن",
  gate_no_recovery:
    "هیچ راه بازیابی گذرواژه‌ای وجود ندارد — همین چیزی است که یادداشت‌هایت را خصوصی نگه می‌دارد. گذرواژه‌ات را جای امنی نگه دار.",

  today_title: "بینش امروز تو",
  today_gathering: "در حال آماده کردن چیزی برای تو…",
  today_affirmation: "تأکید مثبت",
  today_strength: "یک نقطهٔ قوت برای یادآوری",
  today_from_words: "از واژه‌های خودت",
  today_revisit: "بازدید دوباره از آن خاطره",
  today_add_first: "اولین یادداشتت را اضافه کن تا این بخش شخصی شود",

  capture_title: "ثبت یک خاطره",
  capture_subtitle:
    "از صفحه‌ای از یادداشت‌هایت عکس بگیر، یا یک بازتاب بنویس. همان لحظه که ذخیره کنی رمزگذاری می‌شود.",
  capture_take_photo: "عکس بگیر یا انتخاب کن",
  capture_photo_hint: "یادداشت‌های دست‌نویس و چاپی هر دو کار می‌کنند",
  capture_write_instead: "به‌جایش یک بازتاب بنویس",
  capture_using: "در حال استفاده از {provider}.",
  capture_offdevice_warn: "پیش از آنکه هر عکسی از دستگاهت خارج شود، از تو پرسیده می‌شود.",
  capture_ondevice: "هیچ چیزی از دستگاهت خارج نمی‌شود.",
  capture_when: "این از چه زمانی است؟",
  capture_note_text: "متن یادداشت",
  capture_reading: "در حال خواندن…",
  capture_extracting: "در حال استخراج واژه‌ها از عکس تو…",
  capture_text_ph: "این جلسه چه چیزی در خود داشت؟ هر چیزی را اینجا می‌توانی ویرایش کنی.",
  capture_save: "ذخیرهٔ خاطره",
  capture_err_image: "متأسفم، آن تصویر بارگذاری نشد. عکس دیگری را امتحان کن.",
  capture_err_empty: "کمی متن اضافه کن تا این خاطره چیزی برای نگه‌داشتن داشته باشد.",
  capture_err_save: "هنگام ذخیره مشکلی پیش آمد. لطفاً دوباره تلاش کن.",
  capture_err_ocr: "استخراج متن ناموفق بود. می‌توانی متن را خودت بنویسی.",
  capture_consent:
    "متن با {provider} استخراج شود؟ این کار عکس را از دستگاهت خارج می‌کند. برای نوشتن دستی متن، انصراف را بزن.",

  memories_title: "خاطره‌ها",
  memories_empty_sub: "یادداشت‌های ذخیره‌شده‌ات اینجا خواهند بود.",
  memories_count_one: "{n} خاطره، تازه‌ترین‌ها اول.",
  memories_count_other: "{n} خاطره، تازه‌ترین‌ها اول.",
  memories_empty_title: "هنوز چیزی اینجا نیست",
  memories_empty_cta: "اولین یادداشتت را ثبت کن",

  detail_not_found: "این خاطره پیدا نشد.",
  detail_delete: "حذف",
  detail_delete_confirm: "این خاطره حذف شود؟ این کار قابل بازگشت نیست.",
  detail_edit: "ویرایش متن",

  crisis_link: "همین حالا نیاز داری با کسی حرف بزنی؟",
  crisis_title: "تو شایستهٔ حمایتی",
  crisis_body:
    "بینش درمان یک ابزار بازتاب شخصی است، نه جایگزینی برای مراقبت حرفه‌ای. اگر در بحران هستی یا به آسیب‌رساندن به خودت فکر می‌کنی، لطفاً همین حالا کمک بخواه.",
  crisis_region_us: "آمریکا و کانادا",
  crisis_help_us: "تماس یا پیامک به ۹۸۸ (خط بحران و خودکشی)",
  crisis_region_uk: "بریتانیا و ایرلند",
  crisis_help_uk: "تماس با ۱۱۶۱۲۳ (Samaritans)",
  crisis_region_ir: "ایران",
  crisis_help_ir: "تماس با ۱۴۸۰ (اورژانس اجتماعی بهزیستی)",
  crisis_region_other: "جاهای دیگر",
  crisis_help_other: "یک خط یاری در findahelpline.com پیدا کن",
  crisis_danger: "اگر در خطر فوری هستی، با شمارهٔ اورژانس محلی‌ات تماس بگیر.",
  crisis_close: "بستن",

  settings_title: "تنظیمات",
  settings_language: "زبان",
  settings_engine: "موتور بینش",
  settings_saved: "ذخیره شد",
  settings_apikey: "کلید API",
  settings_apikey_ph: "فقط روی همین دستگاه ذخیره می‌شود",
  settings_apikey_note:
    "ارائه‌دهنده‌های ابری هنوز در این نمونهٔ اولیه متصل نشده‌اند. حالت نمایشی همین امروز تجربهٔ کامل را به تو می‌دهد.",
  settings_data: "داده‌های تو",
  settings_data_note:
    "همه‌چیز روی همین دستگاه با گذرواژه‌ات رمزگذاری شده است. یک نسخهٔ پشتیبان رمزگشایی‌شده بگیر، یا همه را پاک کن.",
  settings_export: "گرفتن نسخهٔ پشتیبان (JSON)",
  settings_lock: "همین حالا قفل کن",
  settings_delete: "حذف همه‌چیز",
  settings_wipe_confirm:
    "همهٔ یادداشت‌ها، بینش‌ها و گذرواژه‌ات از این دستگاه حذف شوند؟ این کار قابل بازگشت نیست.",
  settings_disclaimer:
    "بینش درمان بازتاب‌ها و تأکیدهای مثبتی برگرفته از یادداشت‌های خودت ارائه می‌دهد. این یک دستگاه پزشکی نیست و تشخیص یا درمان ارائه نمی‌دهد. لطفاً همچنان به درمانگرت مراجعه کن.",

  provider_mock_label: "حالت نمایشی (روی دستگاه)",
  provider_mock_note: "خروجی نمونهٔ واقع‌گرایانه. هیچ چیزی از دستگاهت خارج نمی‌شود.",
  provider_openai_label: "OpenAI (ابری)",
  provider_openai_note: "به‌زودی. در صورت فعال‌شدن، محتوای یادداشت را از دستگاه خارج می‌کند.",
  provider_anthropic_label: "Anthropic Claude (ابری)",
  provider_anthropic_note:
    "به‌زودی. در صورت فعال‌شدن، محتوای یادداشت را از دستگاه خارج می‌کند.",
};

export const translations: Record<Lang, Record<TranslationKey, string>> = {
  en,
  fa,
};
