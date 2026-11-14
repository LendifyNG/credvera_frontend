import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Minus, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { MAX_NOTES, MAX_SPRAY, MIN_SPRAY, SPRAY_NOTES, type SprayNoteValue } from '../../lib/celebrations';
import { MethodPicker, naira, Pill } from '../pay/PayFlow';
import SprayNote from './SprayNote';

export type SprayDraft = { kind: 'spray'; note: SprayNoteValue; notes: number; amount: number; name: string; method: 'transfer' | 'card' };

const BUNDLES = [5_000, 10_000, 20_000, 50_000, 100_000];
const ease = [0.16, 1, 0.3, 1] as const;

/** The most notes allowed for a note value: the wad cap, or the amount cap. */
const maxNotes = (note: SprayNoteValue) => Math.min(MAX_NOTES, Math.floor(MAX_SPRAY / note));
const minNotes = (note: SprayNoteValue) => Math.ceil(MIN_SPRAY / note);

/**
 * Buying spray money: pick the note, then how thick the wad is. The wad on
 * screen grows as the amount does, so the guest sees what they'll be holding.
 */
export default function SprayForm({ mark, onNext, busy, error }: { mark: string; onNext: (d: SprayDraft) => void; busy: boolean; error: string | null }) {
  const [note, setNote] = useState<SprayNoteValue>(500);
  const [notes, setNotes] = useState(20);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'transfer' | 'card'>('transfer');
  const amount = notes * note;
  const ready = notes >= minNotes(note) && notes <= maxNotes(note) && name.trim().length > 1;

  const pick = (n: SprayNoteValue) => {
    // Keep roughly the same money when switching notes.
    setNote(n);
    setNotes((c) => Math.max(minNotes(n), Math.min(maxNotes(n), Math.round((c * note) / n))));
  };
  const step = (by: number) => setNotes((c) => Math.max(minNotes(note), Math.min(maxNotes(note), c + by)));
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (ready) onNext({ kind: 'spray', note, notes, amount, name: name.trim(), method });
  };

  // The wad thickens with the count (on a log scale, so ten notes and a hundred both look right).
  const layers = Math.max(1, Math.min(12, Math.round(Math.log2(notes + 1) * 1.6)));

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <p className="text-[13px] font-semibold text-ink/50">Your notes</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {SPRAY_NOTES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              aria-pressed={note === n}
              className={`group relative rounded-2xl p-2.5 pb-3 transition-all ${note === n ? 'bg-background shadow-[0_18px_40px_-20px_rgba(21,23,26,0.7)]' : 'bg-white ring-1 ring-ink/10 hover:ring-ink/30'}`}
            >
              <motion.div animate={{ rotate: note === n ? -4 : 0, y: note === n ? -6 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }}>
                <SprayNote value={n} mark={mark} className="w-full" shadow={note === n} />
              </motion.div>
              <span className={`mt-2 block text-[14px] font-semibold ${note === n ? 'text-white' : 'text-ink'}`}>{naira(n)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-ink/50">How much you’ll spray</p>
        <div className="relative mt-3 overflow-hidden rounded-[28px] bg-background px-6 pb-6 pt-7 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-end justify-between gap-4">
            <div className="min-w-0">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={amount}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="font-ledger text-[clamp(2.3rem,9vw,3.1rem)] font-semibold leading-none tracking-[-0.04em]"
                >
                  {naira(amount)}
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-[14px] text-white/55">
                {notes.toLocaleString('en-NG')} notes of {naira(note)}
              </p>
            </div>
            {/* The wad, thicker as it grows */}
            <div className="relative h-[74px] w-[124px] shrink-0" aria-hidden>
              {Array.from({ length: layers }, (_, i) => (
                <motion.div
                  key={`${note}-${i}`}
                  initial={{ opacity: 0, y: -i * 3 - 12 }}
                  animate={{ opacity: 1, y: -i * 3.2, rotate: (i % 2 ? 1 : -1) * (1.5 + (i % 3) * 1.4) }}
                  transition={{ delay: i * 0.025, type: 'spring', stiffness: 380, damping: 24 }}
                  className="absolute inset-x-0 bottom-0"
                  style={{ zIndex: i }}
                >
                  <SprayNote value={note} mark={mark} className="w-full" shadow={i === layers - 1} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-3">
            <button type="button" onClick={() => step(-Math.max(1, Math.round(notes * 0.1)))} aria-label="Fewer notes" className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 active:scale-95">
              <Minus className="size-4" />
            </button>
            <input
              type="range"
              min={minNotes(note)}
              max={Math.min(maxNotes(note), 400)}
              value={Math.min(notes, 400)}
              onChange={(e) => setNotes(Number(e.target.value))}
              aria-label="Number of notes"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#dcf17e]"
            />
            <button type="button" onClick={() => step(Math.max(1, Math.round(notes * 0.1)))} aria-label="More notes" className="grid size-11 place-items-center rounded-full bg-primary text-ink transition-transform active:scale-95">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="relative mt-4 flex flex-wrap gap-2">
            {BUNDLES.filter((b) => b / note <= maxNotes(note)).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setNotes(b / note)}
                className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${amount === b ? 'bg-primary text-ink' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {naira(b)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="spray-name" className="text-[13px] font-semibold text-ink/50">
          Your name, on the big screen
        </label>
        <input
          id="spray-name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="So everyone sees who’s spraying"
          autoComplete="name"
          className="mt-1.5 h-13 w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] text-ink ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <MethodPicker method={method} onChange={setMethod} />

      {error && <p className="text-[14px] font-medium text-[#b42318]">{error}</p>}
      <Pill type="submit" disabled={!ready || busy}>
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Getting it ready…
          </span>
        ) : (
          `Get ${naira(amount)} spray money`
        )}
      </Pill>
    </form>
  );
}
