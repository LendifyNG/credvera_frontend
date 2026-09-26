import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, Repeat } from 'lucide-react';
import Reveal from '../ui/Reveal';
import Headline from './Headline';
import LoopVideo from './LoopVideo';

const ease = [0.16, 1, 0.3, 1] as const;

// Notifications as the app sends them, using the app's own example payments.
const notes = [
  { icon: ArrowDownLeft, title: '$850.00 received', body: 'From Upwork Global Inc. · US dollar account', time: 'now' },
  { icon: ArrowDownLeft, title: '£320.00 received', body: 'From Brightline Studio Ltd · Pound account', time: '2m' },
  { icon: Repeat, title: 'Converted to naira', body: '₦1,304,750.00 at ₦1,535.00 to the dollar', time: '5m' },
];

/** A clip of someone at work at home bleeds off the page and fades into it; app notifications slide in over the seam. */
export default function EarnAnywhere() {
  const reduce = useReducedMotion();
  const clip = { name: 'abroad-laptop', label: 'A young woman with an afro working on her laptop at home' };
  const fade =
    'linear-gradient(to left, #000 55%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 82%, transparent 100%)';

  return (
    <section className="relative isolate overflow-hidden py-20 lg:min-h-[92vh] lg:py-0">
      {/* Video: full height on the right, no frame, melting into the paper. */}
      <LoopVideo
        name={clip.name}
        label={clip.label}
        className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[52%] object-cover object-[center_30%] lg:block"
        style={{ maskImage: fade, maskComposite: 'intersect', WebkitMaskImage: fade, WebkitMaskComposite: 'source-in' }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:min-h-[92vh] lg:grid-cols-2 lg:px-8">
        <div>
          <Headline
            text={'Earn from\n==anywhere==.\nLive *where you are*.'}
            className="text-[clamp(2.5rem,5.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.035em]"
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/65">
              Freelance for clients in New York, get paid by a platform in London, and spend it at home in Lagos. Your
              income isn’t limited by where your bank is.
            </p>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink/70 backdrop-blur">
              <span className="size-1.5 rounded-full bg-background" />
              Opens when you add your NIN and a selfie · about a minute
            </p>
          </Reveal>
        </div>

        {/* Phones: the video sits here, faded at its edges. */}
        <div className="relative lg:h-full">
          <LoopVideo
            name={clip.name}
            label={clip.label}
            className="mx-auto block aspect-[9/14] w-full max-w-sm object-cover lg:hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 75%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 75%, transparent)',
            }}
          />
          {/* The notifications, stacked over the seam */}
          <ul className="relative -mt-24 space-y-3 lg:absolute lg:bottom-[14%] lg:left-[-6%] lg:mt-0 lg:w-[22rem]">
            {notes.map((n, i) => (
              <motion.li
                key={n.title}
                initial={reduce ? false : { opacity: 0, x: -24, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.8, ease, delay: 0.3 + i * 0.35 }}
                className="flex items-start gap-3 rounded-2xl bg-white/75 p-4 shadow-[0_18px_40px_-20px_rgba(1,21,4,0.35)] ring-1 ring-white/60 backdrop-blur-xl"
                style={{ marginLeft: `${i * 18}px` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <n.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold tracking-tight">{n.title}</span>
                    <span className="text-xs text-ink/40">{n.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-ink/55">{n.body}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
