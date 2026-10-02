import { Loader2, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import { activeBusiness, errorMessage, useAcceptInvitation, useInvitation, useProfile, useSignedIn } from '../api';
import { ROLES } from './Team';

const primary = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-graphite px-5 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-40';
const secondary = 'inline-flex h-11 items-center justify-center rounded-lg border border-graphite/15 bg-white px-5 text-[15px] font-semibold hover:border-graphite/35';

/**
 * Where an emailed team invitation lands. It says who invited you, to what
 * and as what; signed in with the invited email, one tap joins.
 */
export default function JoinTeam() {
  const { token = '' } = useParams();
  const signedIn = useSignedIn();
  const profile = useProfile();
  const invitation = useInvitation(token);
  const accept = useAcceptInvitation();
  const navigate = useNavigate();
  const here = `/business/app/join/${token}`;
  const i = invitation.data;

  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f4ef] px-4 py-10">
      <div className="w-full max-w-md">
        <img src={logoDark} alt="Credvera" className="mx-auto h-6 w-auto" />
        <section className="mt-8 rounded-2xl border border-graphite/10 bg-white p-7 text-center">
          {invitation.isLoading ? (
            <Loader2 className="mx-auto my-8 size-5 animate-spin text-graphite/40" aria-label="Loading" />
          ) : invitation.error || !i ? (
            <>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em]">This invitation can’t be used</h1>
              <p className="mt-2 text-[14.5px] text-graphite/60">{invitation.error ? errorMessage(invitation.error) : 'Ask whoever invited you for a new one.'}</p>
            </>
          ) : (
            <>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#efeee7]">
                <Users className="size-5 text-graphite/60" />
              </span>
              <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Join {i.businessName}</h1>
              <p className="mt-2 text-[14.5px] text-graphite/65">
                {i.invitedBy ?? 'Someone at the business'} invited you as <span className="font-semibold text-graphite">{ROLES[i.role].name.toLowerCase()}</span>: {ROLES[i.role].about.charAt(0).toLowerCase() + ROLES[i.role].about.slice(1)}
              </p>
              <p className="mt-3 text-[13.5px] text-graphite/50">The invitation is for {i.email}.</p>

              {signedIn ? (
                <>
                  {profile.data && <p className="mt-5 text-[13.5px] text-graphite/60">You’re signed in as {profile.data.email}.</p>}
                  {accept.error && <p className="mt-3 text-[13.5px] text-[#a3261b]">{errorMessage(accept.error)}</p>}
                  <button
                    type="button"
                    disabled={accept.isPending}
                    onClick={() =>
                      accept.mutate(token, {
                        onSuccess: (joined) => {
                          activeBusiness.set(joined.businessId);
                          navigate('/business/app', { replace: true });
                        },
                      })
                    }
                    className={`${primary} mt-4 w-full`}
                  >
                    {accept.isPending && <Loader2 className="size-4 animate-spin" />} Join {i.businessName}
                  </button>
                </>
              ) : (
                <div className="mt-6 space-y-3">
                  <Link to={`/business/app/sign-in?next=${encodeURIComponent(here)}`} className={`${primary} w-full`}>
                    Sign in to accept
                  </Link>
                  <p className="text-[13.5px] text-graphite/55">No Credvera account yet? Create one with {i.email}, then open this link again.</p>
                  <Link to="/business/app/open" className={`${secondary} w-full`}>
                    Create an account
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
        <p className="mt-5 text-center text-[12.5px] text-graphite/45">If you don’t know this business or weren’t expecting this, don’t accept it.</p>
      </div>
    </div>
  );
}
