import { addNote, countNotes } from "../db/database";

interface SeedNote {
  text: string;
  /** Months ago, to spread memories across time. */
  monthsAgo: number;
}

const SEED_NOTES: SeedNote[] = [
  {
    monthsAgo: 70,
    text: "First session. Mostly just talked. I said out loud that I think I've been anxious for years and called it 'being driven'. Therapist didn't flinch. Homework: notice the moments my chest gets tight and write down what was happening.",
  },
  {
    monthsAgo: 64,
    text: "We named the chest tightness 'the alarm' instead of 'danger'. It goes off before meetings and before calling people. Plan: box breathing 4-4-4-4 when the alarm rings, and write what actually happened vs. what I feared.",
  },
  {
    monthsAgo: 52,
    text: "Heavy week. Couldn't get out of bed before noon a couple of days. Therapist said a low day is weather, not a relapse. Tiny goal agreed: open the curtains and step outside for 5 minutes even on bad days.",
  },
  {
    monthsAgo: 41,
    text: "Big one about the inner critic. The voice that says 'you're behind everyone' is borrowed from school, it isn't facts. We practiced answering it: 'I am allowed to grow at my own pace.'",
  },
  {
    monthsAgo: 30,
    text: "Boundaries with family. I said no to a plan I didn't want to go to, and the world didn't end. Therapist: 'Notice that. Disappointing someone is survivable.' Commitment: practice one small no each week.",
  },
  {
    monthsAgo: 18,
    text: "Future-spiraling came up again. Most of the fear is a story I'm telling, not the present. When I catch it, ground with 5 things I can see. We agreed the morning walk is becoming my anchor.",
  },
  {
    monthsAgo: 5,
    text: "Good month. Sleeping better, walked most days. Looked back at old notes together and I cried a little, in a good way. The person who wrote that first page couldn't have imagined this. Plan: keep the walk, keep showing up.",
  },
];

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
function renderNoteImage(text: string): Promise<ArrayBuffer | null> {
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
  ctx.strokeStyle = "rgba(217,136,96,0.4)";
  ctx.beginPath();
  ctx.moveTo(72, 40);
  ctx.lineTo(72, height - 20);
  ctx.stroke();

  ctx.fillStyle = "#3f656b";
  ctx.font = "26px Georgia, serif";
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
    ctx.fillText(l, 86, y);
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
  for (const seed of SEED_NOTES) {
    const imageBytes = await renderNoteImage(seed.text);
    await addNote(key, {
      text: seed.text,
      noteDate: monthsAgoToTs(seed.monthsAgo),
      source: "photo",
      imageBytes: imageBytes ?? undefined,
    });
  }
}
