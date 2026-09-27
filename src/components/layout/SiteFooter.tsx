import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { homeOf, useAudience } from '../../lib/audience';
import { company, ctaFor, isGroup, navByAudience, type NavLinkItem } from '../../lib/site';
import StoreButtons from '../business/StoreButtons';
import ButtonLink from '../ui/ButtonLink';
import PaintedWordmark from './PaintedWordmark';

// Each audience has its own legal pages.
const legalFor = {
  personal: [
    { label: 'Privacy policy', to: '/privacy' },
    { label: 'Terms of use', to: '/terms' },
  ],
  business: [
    { label: 'Privacy notice', to: '/business/privacy' },
    { label: 'Terms of use', to: '/business/terms' },
  ],
};

// One line on what Credvera is, for each audience.
const tagline = {
  personal: 'Get paid from abroad, pay your bills and save, from one app.',
  business: 'Collect, pay suppliers, invoice and trade across borders, from one account.',
};

export default function SiteFooter() {
  const { audience } = useAudience();
  const nav = navByAudience[audience];
  const cta = ctaFor(audience);
  const groups = [
    ...nav.filter(isGroup).map((group) => ({ title: group.label, items: group.items })),
    {
      title: 'More',
      items: [...nav.filter((entry): entry is NavLinkItem => !isGroup(entry)), ...legalFor[audience]],
    },
  ];

  const socials = Object.entries(company.socials).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link to={homeOf(audience)} aria-label="Credvera home">
              <img src={logo} alt="Credvera" className="h-9 w-auto" />
            </Link>
            <p className="mt-6 text-base leading-relaxed text-white/60">{tagline[audience]}</p>
            <div className="mt-8">
              <ButtonLink to={cta.to}>{cta.label}</ButtonLink>
              {audience === 'business' && <StoreButtons tone="light" className="mt-4" />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[13px] font-semibold text-white/40">{group.title}</h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-[15px] text-white/75 transition-colors hover:text-primary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-8 text-sm text-white/45">
          <p className="max-w-3xl leading-relaxed">{company.licenceStatement}</p>
          {(company.legalName || company.rcNumber || company.address) && (
            <p className="mt-3">
              {[company.legalName, company.rcNumber && `RC ${company.rcNumber}`, company.address].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {company.legalName ?? company.name}. All rights reserved.
            </p>
            {socials.length > 0 && (
              <ul className="flex gap-5">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize transition-colors hover:text-white">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* The big wordmark, painted in by a small painter when it scrolls into view */}
      <PaintedWordmark />
    </footer>
  );
}
