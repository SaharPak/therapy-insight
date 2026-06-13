import { addNote, countNotes } from "../db/database";

type SeedLang = "en" | "fa";

interface SeedNote {
  /** Months ago, to spread memories across time. */
  monthsAgo: number;
  text: Record<SeedLang, string>;
}

const SEED_NOTES: SeedNote[] = [
  {
    monthsAgo: 70,
    text: {
      en: "First session. Mostly just talked. I said out loud that I think I've been anxious for years and called it 'being driven'. Therapist didn't flinch. Homework: notice the moments my chest gets tight and write down what was happening.",
      fa: "اولین جلسه. بیشتر فقط حرف زدیم. بلند گفتم که فکر می‌کنم سال‌هاست مضطربم و اسمش را گذاشته بودم «جاه‌طلب بودن». درمانگر جا نخورد. تمرین: لحظه‌هایی که قفسهٔ سینه‌ام سفت می‌شود را بشناس و بنویس چه اتفاقی می‌افتاد.",
    },
  },
  {
    monthsAgo: 64,
    text: {
      en: "We named the chest tightness 'the alarm' instead of 'danger'. It goes off before meetings and before calling people. Plan: box breathing 4-4-4-4 when the alarm rings, and write what actually happened vs. what I feared.",
      fa: "فشردگی قفسهٔ سینه را به‌جای «خطر»، «هشدار» نامیدیم. پیش از جلسه‌ها و پیش از تماس با آدم‌ها به صدا درمی‌آید. برنامه: تنفس جعبه‌ای ۴-۴-۴-۴ وقتی هشدار به صدا درمی‌آید، و نوشتن آنچه واقعاً رخ داد در برابر آنچه می‌ترسیدم.",
    },
  },
  {
    monthsAgo: 52,
    text: {
      en: "Heavy week. Couldn't get out of bed before noon a couple of days. Therapist said a low day is weather, not a relapse. Tiny goal agreed: open the curtains and step outside for 5 minutes even on bad days.",
      fa: "هفتهٔ سنگینی بود. چند روز تا پیش از ظهر نتوانستم از تخت بیرون بیایم. درمانگر گفت یک روز کم‌انرژی هواست، نه بازگشت بیماری. هدف کوچکی توافق شد: پرده‌ها را باز کن و حتی در روزهای بد ۵ دقیقه بیرون برو.",
    },
  },
  {
    monthsAgo: 41,
    text: {
      en: "Big one about the inner critic. The voice that says 'you're behind everyone' is borrowed from school, it isn't facts. We practiced answering it: 'I am allowed to grow at my own pace.'",
      fa: "جلسهٔ مهمی دربارهٔ منتقد درونی. آن صدایی که می‌گوید «از همه عقب‌تری» از مدرسه به ارث رسیده، واقعیت نیست. تمرین کردیم جوابش را بدهیم: «اجازه دارم با ریتم خودم رشد کنم.»",
    },
  },
  {
    monthsAgo: 30,
    text: {
      en: "Boundaries with family. I said no to a plan I didn't want to go to, and the world didn't end. Therapist: 'Notice that. Disappointing someone is survivable.' Commitment: practice one small no each week.",
      fa: "مرزها با خانواده. به برنامه‌ای که نمی‌خواستم بروم «نه» گفتم و دنیا به آخر نرسید. درمانگر: «این را ببین. ناامید‌کردن کسی قابل‌تحمل است.» تعهد: هر هفته یک «نهِ» کوچک را تمرین کن.",
    },
  },
  {
    monthsAgo: 18,
    text: {
      en: "Future-spiraling came up again. Most of the fear is a story I'm telling, not the present. When I catch it, ground with 5 things I can see. We agreed the morning walk is becoming my anchor.",
      fa: "غرق‌شدن در آینده دوباره پیش آمد. بیشتر ترس داستانی است که خودم می‌گویم، نه اکنون. وقتی متوجهش می‌شوم، با ۵ چیزی که می‌بینم خودم را زمین‌گیر می‌کنم. توافق کردیم پیاده‌روی صبحگاهی دارد لنگرم می‌شود.",
    },
  },
  {
    monthsAgo: 5,
    text: {
      en: "Good month. Sleeping better, walked most days. Looked back at old notes together and I cried a little, in a good way. The person who wrote that first page couldn't have imagined this. Plan: keep the walk, keep showing up.",
      fa: "ماه خوبی بود. بهتر می‌خوابم، بیشتر روزها پیاده‌روی کردم. با هم به یادداشت‌های قدیمی نگاه کردیم و کمی گریه کردم، از سر خوبی. کسی که آن صفحهٔ اول را نوشت نمی‌توانست این را تصور کند. برنامه: پیاده‌روی را ادامه بده، حاضر شدن را ادامه بده.",
    },
  },
];

function currentSeedLang(): SeedLang {
  const stored = localStorage.getItem("therapy-insight:lang");
  return stored === "fa" ? "fa" : "en";
}

function monthsAgoToTs(months: number): number {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setHours(11, 0, 0, 0);
  return d.getTime();
}

/**
 * Render a note as a soft "paper" image so the Memories timeline has visual
 * thumbnails on first run. Returns JPEG bytes, or null if canvas is unavailable.
 */
function renderNoteImage(text: string, rtl: boolean): Promise<ArrayBuffer | null> {
  const width = 640;
  const height = 440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = "#f7f3ea";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#efe7d6";
  ctx.fillRect(0, 0, width, 14);

  ctx.strokeStyle = "rgba(79,124,131,0.18)";
  ctx.lineWidth = 1;
  for (let y = 70; y < height - 20; y += 34) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 40, y);
    ctx.stroke();
  }
  // Margin line: right side for RTL, left side for LTR.
  const marginX = rtl ? width - 72 : 72;
  ctx.strokeStyle = "rgba(217,136,96,0.4)";
  ctx.beginPath();
  ctx.moveTo(marginX, 40);
  ctx.lineTo(marginX, height - 20);
  ctx.stroke();

  ctx.fillStyle = "#3f656b";
  ctx.font = "26px Georgia, serif";
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  const textX = rtl ? width - 86 : 86;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width - 130 && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  let y = 72;
  for (const l of lines.slice(0, 9)) {
    ctx.fillText(l, textX, y);
    y += 34;
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(null);
        blob.arrayBuffer().then(resolve);
      },
      "image/jpeg",
      0.8,
    );
  });
}

/** Populate demo notes on first run so the app feels alive. No-op if data exists. */
export async function seedDemoData(key: CryptoKey): Promise<void> {
  if ((await countNotes()) > 0) return;
  const seedLang = currentSeedLang();
  for (const seed of SEED_NOTES) {
    const text = seed.text[seedLang];
    const imageBytes = await renderNoteImage(text, seedLang === "fa");
    await addNote(key, {
      text,
      noteDate: monthsAgoToTs(seed.monthsAgo),
      source: "photo",
      imageBytes: imageBytes ?? undefined,
    });
  }
}
