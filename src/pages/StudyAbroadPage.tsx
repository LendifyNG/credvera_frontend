import { CalendarClock, GraduationCap, PiggyBank } from 'lucide-react';
import caps from '../assets/photos/graduation-caps.webp';
import graduates from '../assets/photos/study-graduates.webp';
import ProductTemplate from '../components/sections/ProductTemplate';
import { marketStats } from '../lib/site';

// TODO(credvera): confirm features, supported countries and currencies.
export default function StudyAbroadPage() {
  return (
    <ProductTemplate
      eyebrow="Study abroad"
      title="From school fees to proof of funds, sorted."
      intro="Pay international school fees, save towards visa proof of funds and send your student’s monthly allowance — all from one app."
      featuresHeading="Everything a family needs to send a student abroad."
      features={[
        {
          icon: GraduationCap,
          title: 'Pay school fees directly',
          body: 'Pay tuition and deposits straight to universities and schools abroad, with a record of every payment.',
        },
        {
          icon: PiggyBank,
          title: 'Save with a Study Vault',
          body: 'Put money aside over time towards tuition and the proof of funds your student’s visa requires.',
        },
        {
          icon: CalendarClock,
          title: 'Send a monthly allowance',
          body: 'Schedule living-cost transfers so your student is covered every month.',
        },
      ]}
      featureImage={{ src: graduates, alt: 'Two smiling graduates in academic gowns on campus' }}
      statsHeading="Studying abroad is a big — and growing — commitment."
      stats={[marketStats.educationSpend, marketStats.ukFunds, marketStats.canadaFunds]}
      story={{
        heading: 'Built around the whole journey, not just the invoice.',
        body: 'From the first deposit to graduation day, Credvera keeps every payment for your student’s education in one place.',
        image: { src: caps, alt: 'Graduates throwing their caps in front of a university building' },
      }}
      ctaTitle="Give your student a head start."
    />
  );
}
