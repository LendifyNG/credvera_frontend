import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, FileUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  errorMessage,
  useStartBusiness,
  useSubmitBusiness,
  useUpdateBusiness,
  useUploadBusinessDocument,
  useVerifyPerson,
  type BusinessDocumentType,
  type BusinessDto,
  type BusinessPersonDto,
  type UpdateBusinessInput,
} from '../../api';
import { ease, field, label, primary, Problem, secondary, Step, toE164 } from './parts';

/** The same bands the API accepts, in words. */
const TURNOVER: [string, string][] = [
  ['under_10m', 'Under ₦10 million'],
  ['10m_50m', '₦10m to ₦50m'],
  ['50m_100m', '₦50m to ₦100m'],
  ['100m_500m', '₦100m to ₦500m'],
  ['over_500m', 'Over ₦500 million'],
];
const STAFF: string[] = ['1', '2-10', '11-50', '51-200', '201+'];

const DOCUMENTS: { type: BusinessDocumentType; label: string; required: boolean }[] = [
  { type: 'certificate_of_incorporation', label: 'Certificate of incorporation', required: true },
  { type: 'status_report', label: 'CAC status report, from the last 3 months', required: true },
  { type: 'memart', label: 'Memorandum and articles of association', required: false },
];

const DETAIL_FIELDS = ['industry', 'purpose', 'annualTurnover', 'sourceOfFunds', 'contactEmail', 'contactPhone'] as const;

/**
 * The business application, step by step. Everything is saved as it goes, so
 * the applicant can leave and come back to the same place.
 */
export default function Application({ business, onStarted }: { business: BusinessDto | null; onStarted: (id: string) => void }) {
  const peopleDone = !!business && business.people.filter((p) => p.requiresVerification).every((p) => p.status === 'verified');
  const detailsDone = !!business && DETAIL_FIELDS.every((key) => !!business[key]);
  const docsDone = !!business && DOCUMENTS.filter((d) => d.required).every((d) => business.documents.some((x) => x.type === d.type));

  return (
    <div className="mt-14">
      {business?.status === 'more_info' && business.decisionNote && (
        <div className="mb-8 flex gap-3 rounded-xl border border-[#ecdcae] bg-[#fbf5e6] px-5 py-4 text-[15px]">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#8a5a00]" />
          <p>
            <span className="font-semibold">Our team asked for something:</span> {business.decisionNote}
            <span className="block text-graphite/60">Make the change below, then send the application again.</span>
          </p>
        </div>
      )}

      <Step n={1} title="Your company" done={!!business} active={!business}>
        {business ? <CompanyCard business={business} /> : <Lookup onStarted={onStarted} />}
      </Step>

      <Step n={2} title="Directors and owners" done={peopleDone} active={!!business && !peopleDone}>
        {business && <People business={business} />}
      </Step>

      <Step n={3} title="About the business" done={detailsDone} active={peopleDone && !detailsDone}>
        {business && <Details business={business} />}
      </Step>

      <Step n={4} title="Your documents" done={docsDone} active={peopleDone && detailsDone && !docsDone}>
        {business && <Documents business={business} />}
      </Step>

      {business && <Submit business={business} />}
    </div>
  );
}

function Lookup({ onStarted }: { onStarted: (id: string) => void }) {
  const start = useStartBusiness();
  const [rc, setRc] = useState('');
  const ready = rc.length >= 4;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) start.mutate(rc, { onSuccess: (started) => onStarted(started.id) });
      }}
    >
      <label className="block">
        <span className={label}>CAC registration number</span>
        <div className="flex items-end gap-4">
          <span className="pb-2.5 text-[17px] font-medium text-graphite/45">RC</span>
          <input autoFocus value={rc} onChange={(e) => setRc(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" placeholder="1234567" className={field} />
          <button type="submit" disabled={!ready || start.isPending} className={secondary}>
            {start.isPending && <Loader2 className="size-4 animate-spin" />} Look it up
          </button>
        </div>
      </label>
      <Problem>{start.error && errorMessage(start.error)}</Problem>
    </form>
  );
}

function CompanyCard({ business }: { business: BusinessDto }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="rounded-xl bg-white p-5 ring-1 ring-graphite/10">
      <p className="text-lg font-semibold">{business.name}</p>
      <p className="text-[14px] text-graphite/60">
        RC {business.rcNumber}
        {business.companyType ? ` · ${business.companyType}` : ''}
      </p>
      {business.registeredAddress && <p className="mt-2 text-[14px] text-graphite/60">{business.registeredAddress}</p>}
      <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#1f6b33]">
        <Check className="size-4" /> Found on the CAC register
        {business.registeredOn ? ` · Incorporated ${new Date(business.registeredOn).getFullYear()}` : ''}
      </p>
    </motion.div>
  );
}

function People({ business }: { business: BusinessDto }) {
  return (
    <>
      <p className="mb-5 text-[15px] text-graphite/60">We found these people on your company record. We check the BVN of every director, and of anyone who owns 25% or more.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {business.people.map((p) => (
          <Person key={p.id} business={business} person={p} />
        ))}
      </div>
    </>
  );
}

function Person({ business, person }: { business: BusinessDto; person: BusinessPersonDto }) {
  const verify = useVerifyPerson();
  const [bvn, setBvn] = useState('');
  const role = [person.isDirector ? 'Director' : 'Shareholder', person.sharePercent !== null ? `${person.sharePercent}%` : null].filter(Boolean).join(' · ');
  const verified = person.status === 'verified';

  return (
    <div className={`rounded-xl bg-white p-5 ring-1 transition-colors ${verified ? 'ring-[#1f6b33]/40' : person.status === 'failed' ? 'ring-[#b42318]/30' : 'ring-graphite/10'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{person.name}</p>
          <p className="text-[13px] text-graphite/55">{role}</p>
        </div>
        {verified && (
          <span className="grid size-6 place-items-center rounded-full bg-primary text-graphite">
            <Check className="size-3.5" />
          </span>
        )}
      </div>

      {!person.requiresVerification ? (
        <p className="mt-4 text-[13px] text-graphite/50">No BVN needed: under 25% and not a director.</p>
      ) : verified ? (
        <p className="mt-4 text-[13px] text-graphite/55">
          BVN {person.bvn} · checked
          {person.nameMatch === false && <span className="mt-1 block text-[#8a5a00]">The BVN is in a different name. Our team will look at it; nothing for you to do.</span>}
        </p>
      ) : (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (bvn.length === 11) verify.mutate({ id: business.id, personId: person.id, bvn }, { onSuccess: () => setBvn('') });
          }}
        >
          <div className="flex items-end gap-3">
            <input
              value={bvn}
              onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="numeric"
              placeholder="BVN, 11 digits"
              aria-label={`${person.name}'s BVN`}
              className="w-full border-b border-graphite/15 bg-transparent py-2 font-ledger text-[15px] tracking-wide outline-none focus:border-graphite"
            />
            <button type="submit" disabled={bvn.length !== 11 || verify.isPending} className="h-9 shrink-0 rounded-md bg-graphite px-3 text-[13px] font-semibold text-white disabled:bg-graphite/20 disabled:text-graphite/45">
              {verify.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Check'}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-[#b42318]">{verify.error ? errorMessage(verify.error) : person.status === 'failed' ? person.failureReason : ''}</p>
        </form>
      )}
    </div>
  );
}

function Details({ business }: { business: BusinessDto }) {
  const update = useUpdateBusiness();
  const initial = {
    industry: business.industry ?? '',
    purpose: business.purpose ?? '',
    annualTurnover: business.annualTurnover ?? '',
    sourceOfFunds: business.sourceOfFunds ?? '',
    contactEmail: business.contactEmail ?? '',
    contactPhone: business.contactPhone ?? '',
    staffSize: business.staffSize ?? '',
    website: business.website ?? '',
  };
  const [form, setForm] = useState(initial);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });

  // Only what changed is sent, and blank optional fields are left alone.
  const changes = Object.fromEntries(
    Object.entries(form)
      .map(([k, v]) => [k, k === 'contactPhone' ? toE164(v) : v.trim()])
      .filter(([k, v]) => v && v !== initial[k as keyof typeof initial]),
  ) as UpdateBusinessInput;
  const dirty = Object.keys(changes).length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty) update.mutate({ id: business.id, input: changes });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>What the business does</span>
          <input value={form.industry} onChange={set('industry')} placeholder="Creative and design services" className={field} />
        </label>
        <label className="block">
          <span className={label}>What you’ll use the account for</span>
          <input value={form.purpose} onChange={set('purpose')} placeholder="Getting paid by clients, paying suppliers" className={field} />
        </label>
        <label className="block">
          <span className={label}>Turnover each year</span>
          <select value={form.annualTurnover} onChange={set('annualTurnover')} className={field}>
            <option value="">Choose one</option>
            {TURNOVER.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Where the money comes from</span>
          <input value={form.sourceOfFunds} onChange={set('sourceOfFunds')} placeholder="Client fees" className={field} />
        </label>
        <label className="block">
          <span className={label}>Contact email</span>
          <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={field} />
        </label>
        <label className="block">
          <span className={label}>Contact phone</span>
          <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} className={field} />
        </label>
        <label className="block">
          <span className={label}>People who work there (optional)</span>
          <select value={form.staffSize} onChange={set('staffSize')} className={field}>
            <option value="">Choose one</option>
            {STAFF.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Website (optional)</span>
          <input value={form.website} onChange={set('website')} placeholder="yourbusiness.ng" className={field} />
        </label>
      </div>
      <Problem>{update.error && errorMessage(update.error)}</Problem>
      <button type="submit" disabled={!dirty || update.isPending} className={`${secondary} mt-6`}>
        {update.isPending && <Loader2 className="size-4 animate-spin" />} {update.isSuccess && !dirty ? 'Saved' : 'Save'}
      </button>
    </form>
  );
}

function Documents({ business }: { business: BusinessDto }) {
  const upload = useUploadBusinessDocument();
  const [uploading, setUploading] = useState<BusinessDocumentType | null>(null);

  return (
    <>
      <ul className="space-y-2">
        {DOCUMENTS.map((d) => {
          const current = business.documents.find((x) => x.type === d.type);
          const busy = uploading === d.type && upload.isPending;
          return (
            <li key={d.type}>
              <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 ring-1 transition-colors ${current ? 'ring-[#1f6b33]/40' : 'ring-graphite/10 hover:ring-graphite/30'}`}>
                <span>
                  <span className="block font-medium">
                    {d.label}
                    {!d.required && <span className="font-normal text-graphite/45"> · optional</span>}
                  </span>
                  <span className="block text-[13px] text-graphite/50">{current ? `${current.fileName} · choose again to replace` : 'PDF, JPEG or PNG, up to 10MB'}</span>
                </span>
                {busy ? <Loader2 className="size-5 animate-spin text-graphite/45" /> : current ? <Check className="size-5 text-[#1f6b33]" /> : <FileUp className="size-5 text-graphite/45" />}
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  className="sr-only"
                  disabled={upload.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    setUploading(d.type);
                    upload.mutate({ id: business.id, type: d.type, file });
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>
      <Problem>{upload.error && errorMessage(upload.error)}</Problem>
    </>
  );
}

function Submit({ business }: { business: BusinessDto }) {
  const submit = useSubmitBusiness();

  return (
    <div className="border-t border-graphite/15 pt-8">
      <AnimatePresence>
        {business.missing.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 text-[14px] text-graphite/60">
            <p className="font-medium text-graphite">Still to do</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {business.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" disabled={business.missing.length > 0 || submit.isPending} onClick={() => submit.mutate(business.id)} className={primary}>
        {submit.isPending && <Loader2 className="size-4 animate-spin" />}
        {business.status === 'more_info' ? 'Send it again' : 'Send my application'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
      <Problem>{submit.error && errorMessage(submit.error)}</Problem>
    </div>
  );
}
