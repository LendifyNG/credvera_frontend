import handshake from '../../assets/photos/business-handshake.webp';
import { links } from '../../lib/site';
import ButtonLink from '../ui/ButtonLink';
import ParallaxImage from '../ui/ParallaxImage';
import Reveal, { RevealText } from '../ui/Reveal';

type CtaBandProps = {
  title?: string;
  body?: string;
};

/** Closing call to action shared by the main pages. */
export default function CtaBand({
  title = 'Run your business money from one app.',
  body = 'Download Credvera and get your business set up for payments at home and across borders.',
}: CtaBandProps) {
  return (
    <section className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-background text-white lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-8 py-16 sm:px-14 lg:py-24">
          <RevealText text={title} className="max-w-md text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl" />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">{body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
              <ButtonLink to={links.contactSales} variant="outline-light">
                Talk to us
              </ButtonLink>
            </div>
          </Reveal>
        </div>
        <ParallaxImage src={handshake} alt="Business partners shaking hands in a bright office" className="min-h-80 lg:min-h-full" />
      </div>
    </section>
  );
}
