import { FileText, Globe2, Ship } from 'lucide-react';
import port from '../assets/photos/container-port-aerial.webp';
import ship from '../assets/photos/cargo-ship.webp';
import ProductTemplate from '../components/sections/ProductTemplate';
import { marketStats } from '../lib/site';

// TODO(credvera): confirm features, supported countries and currencies.
export default function SupplierPaymentsPage() {
  return (
    <ProductTemplate
      eyebrow="Supplier payments"
      title="Pay suppliers in China and across Africa."
      intro="Settle supplier invoices abroad from the same app you use for everyday business payments."
      featuresHeading="Built for importers and traders."
      features={[
        {
          icon: Ship,
          title: 'Pay suppliers in China',
          body: 'Send payments to the suppliers in China your business imports from.',
        },
        {
          icon: Globe2,
          title: 'Pay across Africa',
          body: 'Pay suppliers and partners in other African countries without the long detour.',
        },
        {
          icon: FileText,
          title: 'Keep your trade records together',
          body: 'Attach invoices to payments so every order and payment is easy to track.',
        },
      ]}
      featureImage={{ src: port, alt: 'Aerial view of shipping containers stacked at a port' }}
      imageRight
      statsHeading="Trade is growing — paying for it is still hard."
      stats={[marketStats.chinaImports, marketStats.intraAfricaRouting]}
      story={{
        heading: 'From the port to your shelves.',
        body: 'Whether you import full containers or restock a market stall, Credvera helps you pay the suppliers your business depends on.',
        image: { src: ship, alt: 'A container ship loaded with cargo at sea' },
      }}
      ctaTitle="Pay your suppliers with confidence."
    />
  );
}
