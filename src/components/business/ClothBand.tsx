import { useId } from 'react';

// Credvera's own colours: deep green ground, a green strand and a light strand.
const GROUND = '#063c1a';
const EDGE = '#011504';
const GREEN = '#7fde80';
const LIGHT = '#f0f2ef';

// One 36 × 48 repeat: two strands twist around each other, crossing twice.
// Each half is drawn separately so a strand passes over at one crossing and
// under at the next, like a twisted cord.
const aTop = 'M9 0 C9 12 27 12 27 24';
const aBottom = 'M27 24 C27 36 9 36 9 48';
const bTop = 'M27 0 C27 12 9 12 9 24';
const bBottom = 'M9 24 C9 36 27 36 27 48';

function Strand({ d, colour }: { d: string; colour: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={EDGE} strokeWidth="8" />
      <path d={d} fill="none" stroke={colour} strokeWidth="5" />
    </>
  );
}

/**
 * A twisted cord of two strands, like a band on woven cloth, drawn in code.
 * Runs top to bottom, or left to right on phones.
 */
export default function ClothBand({ vertical = true, className = '' }: { vertical?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg aria-hidden className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Drawn upright; turned a quarter for the flat strip */}
        <pattern id={id} width="36" height="48" patternUnits="userSpaceOnUse" patternTransform={vertical ? undefined : 'rotate(90)'}>
          <rect width="36" height="48" fill={GROUND} />
          <rect x="1" width="1" height="48" fill={GREEN} opacity="0.35" />
          <rect x="34" width="1" height="48" fill={GREEN} opacity="0.35" />
          <Strand d={bTop} colour={LIGHT} />
          <Strand d={aTop} colour={GREEN} />
          <Strand d={aBottom} colour={GREEN} />
          <Strand d={bBottom} colour={LIGHT} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
