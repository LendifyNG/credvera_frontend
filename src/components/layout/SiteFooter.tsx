import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { company, isGroup, links, nav, type NavLinkItem } from '../../lib/site';
import ButtonLink from '../ui/ButtonLink';

const legal = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of use', to: '/terms' },
];

export default function SiteFooter() {
  const groups = [
    ...nav.filter(isGroup).map((group) => ({ title: group.label, items: group.items })),
    {
      title: 'More',
      items: [...nav.filter((entry): entry is NavLinkItem => !isGroup(entry)), ...legal],
    },
  ];

  const socials = Object.entries(company.socials).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link to="/" aria-label="Credvera home">
              <img src={logo} alt="Credvera" className="h-9 w-auto" />
            </Link>
            <p className="mt-6 text-base leading-relaxed text-white/60">
              Business, cross-border and school payments — built for Nigerians at home and abroad.
            </p>
            <div className="mt-8">
              <ButtonLink to={links.openAccount}>Open an account</ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">{group.title}</h3>
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

      <p
        aria-hidden
        className="pointer-events-none select-none px-4 text-center text-[22vw] font-bold leading-[0.8] tracking-tighter text-white/[0.04]"
      >
        credvera
      </p>
    </footer>
  );
}
