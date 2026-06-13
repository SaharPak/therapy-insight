import type {
  AIProvider,
  CommitmentResult,
  DailyInsightResult,
  NoteContext,
  ThemeResult,
} from "./AIProvider";

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

const DEMO_NOTES = [
  "Session 4. Talked about how the chest tightness shows up before meetings. We named it 'the alarm' instead of 'danger'. Homework: box breathing 4-4-4-4 when the alarm rings, and write down one thing that actually happened vs. what I feared.",
  "Today felt heavy. Couldn't get out of bed until noon. Therapist reminded me that a low day is not a relapse, it's weather. Agreed to a tiny goal: open the curtains and step outside for 5 minutes, even on bad days.",
  "Breakthrough about the inner critic. The voice that says 'you're behind everyone' is borrowed from school. It is not facts. We practiced answering it with: 'I am allowed to grow at my own pace.'",
  "Anxiety about the future came up again. We mapped it: most of the fear is about a story I'm telling, not the present moment. Commitment: when I catch future-spiraling, ground with 5 things I can see.",
  "Talked about boundaries with family. I said no to a plan I didn't want, and the world didn't end. Therapist: 'Notice that. Disappointing someone is survivable.'",
  "Good week. Slept better, walked three times. We discussed how movement quiets the noise. Plan: keep the morning walk, it's becoming an anchor.",
];

const STRENGTHS = [
  "You keep showing up for yourself, even when it's hard.",
  "You can name your feelings now \u2014 that's a skill you built.",
  "You are someone who asks for help instead of disappearing.",
  "You notice the inner critic instead of believing it.",
  "You have survived 100% of your hardest days so far.",
  "You choose small, steady steps over all-or-nothing.",
];

const AFFIRMATIONS = [
  "I am allowed to grow at my own pace.",
  "A low day is weather, not who I am.",
  "I can feel anxious and still do the next small thing.",
  "Disappointing someone is survivable; honoring myself matters.",
  "My calm is something I practice, not something I lack.",
  "I am not behind. I am exactly where my path is.",
  "I can hold both fear and courage at the same time.",
];

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

  async ocr(_image: Blob): Promise<string> {
    await delay(900);
    const rng = makeRng(hashString(`${_image.size}:${Date.now()}`));
    return pick(DEMO_NOTES, rng);
  }

  async generateDailyInsight(
    notes: NoteContext[],
    date: string,
  ): Promise<DailyInsightResult> {
    await delay(400);
    const rng = makeRng(hashString(date));
    const strength = pick(STRENGTHS, rng);
    const affirmation = pick(AFFIRMATIONS, rng);

    let reminder =
      "Capture a note from your past sessions and your reminders will start to draw from your own words.";
    const sourceNoteIds: string[] = [];

    if (notes.length > 0) {
      const note = pick(notes, rng);
      sourceNoteIds.push(note.id);
      const when = new Date(note.noteDate).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
      reminder = `Back in ${when} you wrote: \u201c${snippet(note.text)}\u201d Notice how far that version of you has carried you.`;
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
