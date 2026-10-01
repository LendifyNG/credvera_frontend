import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage, useBusinesses, useSignedIn, type BusinessDto } from '../api';
import logoDark from '../assets/logo-dark.png';
import Application from './open/Application';
import ApplicationStatus from './open/ApplicationStatus';
import CreateLogin from './open/CreateLogin';
import { Loading } from './ui';

/**
 * The application to carry on with: one still being filled in or answered,
 * else the latest one with the team. Rejected ones only if nothing else.
 */
function current(businesses: BusinessDto[]): BusinessDto | null {
  return businesses.find((b) => b.editable) ?? businesses.find((b) => b.status !== 'rejected') ?? businesses[0] ?? null;
}

/**
 * Opening a business account, end to end on one page: a login for the person
 * applying (if they don't have one), then the company from CAC, its directors
 * and owners checked by BVN, what it does, its documents, and review.
 */
export default function OpenAccount() {
  const signedIn = useSignedIn();
  const businesses = useBusinesses();
  // From the dashboard's business switcher: a new company, not the one on file.
  const [params] = useSearchParams();
  const [startingAnother, setStartingAnother] = useState(params.has('another'));
  // The company looked up while starting another, once there is one.
  const [anotherId, setAnotherId] = useState<string | null>(null);

  const all = businesses.data ?? [];
  const business = startingAnother ? (all.find((b) => b.id === anotherId) ?? null) : current(all);
  const startAnother = () => {
    setAnotherId(null);
    setStartingAnother(true);
  };

  let body: React.ReactNode;
  if (!signedIn) body = <CreateLogin />;
  else if (businesses.isLoading) body = <Loading />;
  else if (businesses.error) body = <p className="mt-14 text-[15px] text-[#b42318]">{errorMessage(businesses.error)}</p>;
  else if (!business || business.editable) body = <Application business={business} onStarted={setAnotherId} />;
  else body = <ApplicationStatus business={business} onStartAnother={startAnother} />;

  return (
    <div className="min-h-screen bg-ledger text-graphite">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link to="/business">
          <img src={logoDark} alt="Credvera" className="h-7 w-auto" />
        </Link>
        {!signedIn && (
          <Link to="/business/app/sign-in" className="text-[14px] font-semibold text-graphite/60 hover:text-graphite">
            Sign in instead
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <p className="text-[13px] font-medium text-graphite/50">Open a business account</p>
        <h1 className="mt-4 text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          Tell us who you are.
          <br />
          <span className="text-graphite/45">We’ll fill in the rest.</span>
        </h1>
        {body}
      </main>
    </div>
  );
}
