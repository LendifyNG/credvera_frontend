import { House, Repeat, School } from 'lucide-react';
import familyHome from '../assets/photos/family-home.webp';
import familyOutdoors from '../assets/photos/family-outdoors.webp';
import ProductTemplate from '../components/sections/ProductTemplate';
import { marketStats } from '../lib/site';

// TODO(credvera): confirm features and the countries customers can pay from.
export default function PayHomePage() {
  return (
    <ProductTemplate
      eyebrow="Pay Home"
      title="Take care of home, from anywhere."
      intro="For Nigerians abroad: pay school fees, rent and bills in Nigeria directly — so every naira goes exactly where you intended."
      featuresHeading="Send support, not just money."
      features={[
        {
          icon: School,
          title: 'Pay school fees at home',
          body: 'Pay children’s or siblings’ school fees straight to the school in Nigeria.',
        },
        {
          icon: House,
          title: 'Cover rent and bills',
          body: 'Pay landlords, utilities and other bills directly, with a record every time.',
        },
        {
          icon: Repeat,
          title: 'Set up recurring payments',
          body: 'Schedule regular support so the essentials at home are always covered.',
        },
      ]}
      featureImage={{ src: familyOutdoors, alt: 'A smiling family playing together outdoors' }}
      statsHeading="Nigerians abroad keep home running."
      stats={[marketStats.remittances, marketStats.migrants]}
      story={{
        heading: 'Every naira, exactly where you meant it.',
        body: 'Pay the school, the landlord or the hospital directly instead of sending cash — and see exactly where your money went.',
        image: { src: familyHome, alt: 'A family sitting together on a sofa at home' },
      }}
      ctaTitle="Look after home, wherever you are."
      secondaryCta={{ label: 'Talk to us', to: '/contact' }}
    />
  );
}
