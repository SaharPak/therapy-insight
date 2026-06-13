import type {
  AILang,
  AIProvider,
  CommitmentResult,
  DailyInsightResult,
  NoteContext,
  ThemeResult,
} from "./AIProvider";
import { formatMonthYear } from "../lib/date";

/**
 * A fully offline provider that produces realistic, grounded-feeling output so
 * the entire experience works without any API key. Daily output is
 * deterministic per date, so the "insight of the day" stays stable if revisited.
 */

/** Small deterministic string hash -> 32-bit int. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

const DEMO_NOTES: Record<AILang, string[]> = {
  en: [
    "Session 4. Talked about how the chest tightness shows up before meetings. We named it 'the alarm' instead of 'danger'. Homework: box breathing 4-4-4-4 when the alarm rings, and write down one thing that actually happened vs. what I feared.",
    "Today felt heavy. Couldn't get out of bed until noon. Therapist reminded me that a low day is not a relapse, it's weather. Agreed to a tiny goal: open the curtains and step outside for 5 minutes, even on bad days.",
    "Breakthrough about the inner critic. The voice that says 'you're behind everyone' is borrowed from school. It is not facts. We practiced answering it with: 'I am allowed to grow at my own pace.'",
    "Anxiety about the future came up again. We mapped it: most of the fear is about a story I'm telling, not the present moment. Commitment: when I catch future-spiraling, ground with 5 things I can see.",
    "Talked about boundaries with family. I said no to a plan I didn't want, and the world didn't end. Therapist: 'Notice that. Disappointing someone is survivable.'",
    "Good week. Slept better, walked three times. We discussed how movement quiets the noise. Plan: keep the morning walk, it's becoming an anchor.",
  ],
  fa: [
    "جلسهٔ چهارم. دربارهٔ فشردگی قفسهٔ سینه پیش از جلسه‌ها حرف زدیم. اسمش را گذاشتیم «هشدار» نه «خطر». تمرین: تنفس جعبه‌ای ۴-۴-۴-۴ وقتی هشدار به صدا درمی‌آید، و نوشتن یک چیزی که واقعاً اتفاق افتاد در برابر چیزی که از آن می‌ترسیدم.",
    "امروز سنگین بود. تا ظهر نتوانستم از تخت بیرون بیایم. درمانگر یادآوری کرد که یک روز کم‌انرژی، بازگشت بیماری نیست، هواست. روی یک هدف کوچک توافق کردیم: پرده‌ها را باز کن و ۵ دقیقه بیرون برو، حتی در روزهای بد.",
    "یک گشایش دربارهٔ منتقد درونی. آن صدایی که می‌گوید «از همه عقب‌تری» از مدرسه به ارث رسیده. واقعیت نیست. تمرین کردیم که جوابش را بدهیم: «اجازه دارم با ریتم خودم رشد کنم.»",
    "اضطراب دربارهٔ آینده دوباره سر باز کرد. نقشه‌اش کردیم: بیشتر ترس دربارهٔ داستانی است که خودم می‌گویم، نه لحظهٔ اکنون. تعهد: وقتی در آینده غرق می‌شوم، با ۵ چیزی که می‌بینم خودم را زمین‌گیر کنم.",
    "دربارهٔ مرزها با خانواده حرف زدیم. به برنامه‌ای که نمی‌خواستم «نه» گفتم و دنیا به آخر نرسید. درمانگر: «این را ببین. ناامید‌کردن کسی قابل‌تحمل است.»",
    "هفتهٔ خوبی بود. بهتر خوابیدم، سه بار پیاده‌روی کردم. دربارهٔ اینکه حرکت چطور سروصدا را آرام می‌کند حرف زدیم. برنامه: پیاده‌روی صبحگاهی را ادامه بده، دارد لنگرم می‌شود.",
  ],
};

const STRENGTHS: Record<AILang, string[]> = {
  en: [
    "You keep showing up for yourself, even when it's hard.",
    "You can name your feelings now \u2014 that's a skill you built.",
    "You are someone who asks for help instead of disappearing.",
    "You notice the inner critic instead of believing it.",
    "You have survived 100% of your hardest days so far.",
    "You choose small, steady steps over all-or-nothing.",
  ],
  fa: [
    "حتی وقتی سخت است، باز هم برای خودت حاضر می‌شوی.",
    "حالا می‌توانی احساس‌هایت را نام ببری — این مهارتی است که خودت ساختی.",
    "تو کسی هستی که به‌جای ناپدید‌شدن، کمک می‌خواهد.",
    "منتقد درونی‌ات را می‌بینی، بی‌آنکه حرفش را باور کنی.",
    "تا امروز از سخت‌ترین روزهای زندگی‌ات جان سالم به در برده‌ای.",
    "قدم‌های کوچک و پیوسته را به همه‌چیز‌یا‌هیچ ترجیح می‌دهی.",
  ],
};

const AFFIRMATIONS: Record<AILang, string[]> = {
  en: [
    "I am allowed to grow at my own pace.",
    "A low day is weather, not who I am.",
    "I can feel anxious and still do the next small thing.",
    "Disappointing someone is survivable; honoring myself matters.",
    "My calm is something I practice, not something I lack.",
    "I am not behind. I am exactly where my path is.",
    "I can hold both fear and courage at the same time.",
  ],
  fa: [
    "اجازه دارم با ریتم خودم رشد کنم.",
    "یک روز کم‌انرژی هواست، نه هویت من.",
    "می‌توانم مضطرب باشم و باز هم قدم کوچک بعدی را بردارم.",
    "ناامید‌کردن دیگران قابل‌تحمل است؛ احترام به خودم مهم‌تر است.",
    "آرامش چیزی است که تمرین می‌کنم، نه چیزی که کم دارم.",
    "من عقب نیستم. دقیقاً همان‌جایی هستم که مسیر من است.",
    "می‌توانم هم‌زمان ترس و شجاعت را در خود نگه دارم.",
  ],
};

const EMPTY_REMINDER: Record<AILang, string> = {
  en: "Capture a note from your past sessions and your reminders will start to draw from your own words.",
  fa: "یک یادداشت از جلسات گذشته‌ات ثبت کن تا یادآوری‌ها از واژه‌های خودت سرچشمه بگیرند.",
};

function buildReminder(lang: AILang, when: string, text: string): string {
  if (lang === "fa") {
    return `در ${when} نوشته بودی: «${snippet(text)}» ببین این نسخه از تو چقدر تو را تا اینجا آورده است.`;
  }
  return `Back in ${when} you wrote: \u201c${snippet(text)}\u201d Notice how far that version of you has carried you.`;
}

function snippet(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}\u2026` : clean;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockProvider implements AIProvider {
  readonly id = "mock" as const;
  readonly label = "Demo mode (on-device)";
  readonly sendsDataOffDevice = false;

  async ocr(_image: Blob, lang: AILang = "en"): Promise<string> {
    await delay(900);
    const rng = makeRng(hashString(`${_image.size}:${Date.now()}`));
    return pick(DEMO_NOTES[lang], rng);
  }

  async generateDailyInsight(
    notes: NoteContext[],
    date: string,
    lang: AILang = "en",
  ): Promise<DailyInsightResult> {
    await delay(400);
    const rng = makeRng(hashString(`${date}:${lang}`));
    const strength = pick(STRENGTHS[lang], rng);
    const affirmation = pick(AFFIRMATIONS[lang], rng);

    let reminder = EMPTY_REMINDER[lang];
    const sourceNoteIds: string[] = [];

    if (notes.length > 0) {
      const note = pick(notes, rng);
      sourceNoteIds.push(note.id);
      reminder = buildReminder(lang, formatMonthYear(note.noteDate), note.text);
    }

    return { strength, reminder, affirmation, sourceNoteIds };
  }

  async extractThemes(notes: NoteContext[]): Promise<ThemeResult[]> {
    await delay(300);
    const keywords: Record<string, string[]> = {
      Anxiety: ["anxiety", "anxious", "panic", "alarm", "chest", "fear"],
      "Low mood": ["heavy", "bed", "low", "relapse", "tired", "sad"],
      "Inner critic": ["critic", "behind", "not enough", "voice"],
      Boundaries: ["boundary", "boundaries", "no", "family", "say no"],
      "Coping skills": ["breathing", "walk", "ground", "movement", "sleep"],
    };
    const results: ThemeResult[] = [];
    for (const [label, words] of Object.entries(keywords)) {
      const matches = notes.filter((n) =>
        words.some((w) => n.text.toLowerCase().includes(w)),
      );
      if (matches.length > 0) {
        results.push({ label, noteIds: matches.map((m) => m.id) });
      }
    }
    return results;
  }

  async extractCommitments(notes: NoteContext[]): Promise<CommitmentResult[]> {
    await delay(300);
    const triggers = [
      "homework:",
      "commitment:",
      "agreed to",
      "plan:",
      "goal:",
    ];
    const results: CommitmentResult[] = [];
    for (const note of notes) {
      const lower = note.text.toLowerCase();
      for (const trigger of triggers) {
        const idx = lower.indexOf(trigger);
        if (idx !== -1) {
          const after = note.text.slice(idx + trigger.length).trim();
          const sentence = after.split(/[.\n]/)[0]?.trim();
          if (sentence) {
            results.push({ text: sentence, noteIds: [note.id] });
          }
        }
      }
    }
    return results;
  }
}
