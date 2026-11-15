import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Loader2, Receipt as ReceiptIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { errorMessage, isApiError } from '../api/errors';
import FabricTag from '../components/asoebi/FabricTag';
import OrderForm from '../components/asoebi/OrderForm';
import Receipt from '../components/asoebi/Receipt';
import Swatch from '../components/asoebi/Swatch';
import PageHeader from '../components/editorial/PageHeader';
import { Card, Confirming, Expired, naira, Transfer } from '../components/pay/PayFlow';
import {
  asoEbiApi,
  deadlineDate,
  forgetOrder,
  keepOrder,
  keptOrders,
  linesOf,
  orderLabel,
  type AsoEbiPage as Collection,
  type OrderDraft,
  type OrderState,
} from '../lib/asoEbi';

const ease = [0.16, 1, 0.3, 1] as const;

type Step = 'form' | 'transfer' | 'card' | 'paid' | 'expired';
type Loaded = Collection | 'missing' | 'error' | undefined;

/** Still worth coming back to: a transfer number that hasn't run out, or a card checkout. */
const resumable = (o: OrderState) =>
  o.status === 'pending' && (o.account ? !o.account.expiresAt || Date.parse(o.account.expiresAt) > Date.now() : !!o.checkoutUrl);

/** The swatch pattern for an order: its first fabric's place on the page. */
function patternFor(c: Collection, o: OrderState) {
  const first = linesOf(o)[0];
  return Math.max(0, first ? c.options.findIndex((x) => x.id === first.id) : 0);
}

/** An order this phone started and didn't finish paying. */
function Waiting({ c, order, onOpen }: { c: Collection; order: OrderState; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex w-full items-center gap-4 rounded-[24px] bg-background p-3 pr-5 text-left text-white transition-transform active:scale-[0.99]"
    >
      <Swatch pattern={patternFor(c, order)} tone="lime" moving className="size-14 shrink-0 rounded-[16px]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">Finish paying {naira(Number(order.amount))}</span>
        <span className="mt-0.5 block truncate text-[13.5px] text-white/55">
          {orderLabel(order)}, held for you. Tap to pay.
        </span>
      </span>
      <ArrowUpRight className="size-5 shrink-0 text-primary" />
    </motion.button>
  );
}

/** Orders this phone has paid for here, each with its receipt. */
function Paid({ c, orders, onOpen }: { c: Collection; orders: OrderState[]; onOpen: (o: OrderState) => void }) {
  return (
    <div className="mb-8 rounded-[24px] bg-white p-2 ring-1 ring-ink/10">
      <p className="px-3 pb-1 pt-2 text-[13px] font-semibold text-ink/50">{orders.length > 1 ? 'Your orders' : 'Your order'}</p>
      {orders.map((o) => {
        return (
          <button
            key={o.reference}
            type="button"
            onClick={() => onOpen(o)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.04]"
          >
            <ReceiptIcon className="size-4 shrink-0 text-ink/45" />
            <span className="min-w-0 flex-1 truncate text-[14.5px] text-ink">
              {orderLabel(o, 'aso-ebi')} <span className="text-ink/35">·</span> <span className="font-ledger font-semibold">{naira(Number(o.amount))}</span>
            </span>
            <span className="shrink-0 text-[13px] font-semibold text-ink/55">Paid · receipt</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * credvera.co/a/:slug — an aso-ebi collection's page. Guests pick a fabric
 * option and how many, leave their name, phone and sizes for the organiser,
 * and pay with a one-time account number by bank transfer or by card. An
 * order counts only once the API has Monnify's confirmation. Card checkout
 * sends the guest back here with ?order=<reference>; orders started on this
 * phone are kept (by reference only) so a closed tab can pick up again.
 */
export default function AsoEbiPage() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const returning = params.get('order');
  const [c, setCollection] = useState<Loaded>(undefined);
  const [step, setStep] = useState<Step>('form');
  const [order, setOrder] = useState<OrderState | null>(null);
  const [buyer, setBuyer] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<OrderState | null>(null);
  const [paid, setPaid] = useState<OrderState[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<OrderState | null>(null);

  const load = useCallback(
    () =>
      asoEbiApi
        .find(slug)
        .then(setCollection)
        .catch((err) => setCollection(isApiError(err) && err.status === 404 ? 'missing' : 'error')),
    [slug],
  );
  // What's left changes as others order: fetched again quietly, keeping the page on a hiccup.
  const refresh = () => asoEbiApi.find(slug).then(setCollection).catch(() => {});

  useEffect(() => {
    load();
  }, [load]);

  // Orders started on this phone: one to finish paying, and receipts.
  const loadedSlug = c && typeof c === 'object' ? c.slug : null;
  useEffect(() => {
    if (!loadedSlug || returning) return;
    let gone = false;
    (async () => {
      const open: OrderState[] = [];
      const done: OrderState[] = [];
      for (const reference of keptOrders(loadedSlug).slice(0, 6)) {
        try {
          const o = await asoEbiApi.status(reference);
          if (o.collection.slug !== loadedSlug) continue;
          if (o.status === 'paid') done.push(o);
          else if (resumable(o)) open.push(o);
          else forgetOrder(loadedSlug, reference);
        } catch (err) {
          if (isApiError(err) && err.status === 404) forgetOrder(loadedSlug, reference);
        }
      }
      if (!gone) {
        setWaiting(open[0] ?? null);
        setPaid(done);
      }
    })();
    return () => {
      gone = true;
    };
  }, [loadedSlug, returning]);

  // Asks where an order stands, keeping the answer for the receipt.
  const ask = useCallback(async (reference: string) => {
    const o = await asoEbiApi.status(reference);
    latest.current = o;
    return o;
  }, []);

  if (c === undefined) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-ink/40" />
      </div>
    );
  }

  if (c === 'missing') {
    return (
      <PageHeader
        label="Aso-ebi"
        title={'We can’t find\n*this aso-ebi*.'}
        lede="Check the link with whoever sent it to you. Aso-ebi links look like credvera.co/a/their-names."
      />
    );
  }

  if (c === 'error') {
    return (
      <PageHeader label="Aso-ebi" title={'We couldn’t load\n*this page*.'} lede="Check your connection and try again.">
        <button
          type="button"
          onClick={() => {
            setCollection(undefined);
            load();
          }}
          className="mt-6 text-[15px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-4"
        >
          Try again
        </button>
      </PageHeader>
    );
  }

  const start = async (d: OrderDraft) => {
    setBusy(true);
    setError(null);
    try {
      const o = await asoEbiApi.order(c.slug, d);
      keepOrder(c.slug, o.reference);
      setBuyer(d.name.split(/\s+/)[0] ?? null);
      setOrder(o);
      setWaiting(null);
      if (d.method === 'transfer' && o.account) setStep('transfer');
      else if (d.method === 'card' && o.checkoutUrl) setStep('card');
      else setError('We couldn’t start this payment. Please try again.');
    } catch (err) {
      setError(errorMessage(err));
      // Sold out, closed or on hold since the page loaded: show what's true now.
      if (isApiError(err) && [400, 403, 409].includes(err.status)) refresh();
    } finally {
      setBusy(false);
    }
  };

  const again = () => {
    setOrder(null);
    setError(null);
    setStep('form');
    if (returning) setParams({}, { replace: true });
  };

  const done = (status: 'paid' | 'expired') => {
    const reference = returning ?? order?.reference ?? null;
    const answer = latest.current && latest.current.reference === reference ? latest.current : order;
    if (status === 'paid' && answer) {
      setOrder({ ...answer, status: 'paid' });
      setPaid((list) => [answer, ...list.filter((o) => o.reference !== answer.reference)]);
      setStep('paid');
      refresh();
    } else {
      if (reference) forgetOrder(c.slug, reference);
      setStep('expired');
    }
    if (returning) setParams({}, { replace: true });
  };

  // Back from the transfer or card step: the order stays held, so offer it again.
  const back = () => {
    if (order && resumable(order)) setWaiting(order);
    again();
  };

  const open = c.state === 'open';
  const confirming = !!returning && step === 'form';
  const inFlow = confirming || step !== 'form';

  const header =
    c.state === 'on_hold' ? (
      <PageHeader label="Aso-ebi" title={'Not available\n*right now*.'} lede="This collection isn’t available right now. Please check back later, or ask whoever sent you the link." />
    ) : open ? (
      <PageHeader
        label="Aso-ebi"
        title={'Get your\n*aso-ebi*.'}
        lede={`Choose your fabric and pay by bank transfer or card. ${c.organiser} sees your order as soon as it’s paid.`}
      />
    ) : (
      <PageHeader
        label="Aso-ebi"
        title={'Orders have\n*closed*.'}
        lede={
          c.state === 'past_deadline'
            ? `Orders closed on ${deadlineDate(c.deadline)}. If you still need fabric, ask ${c.organiser} directly.`
            : `${c.organiser} has closed orders for this aso-ebi. If you still need fabric, ask them.`
        }
      />
    );

  const flow = (
    <div className="max-w-lg">
      {(step === 'transfer' || step === 'card') && (
        <button type="button" onClick={back} className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft className="size-4" /> Back
        </button>
      )}
      {!inFlow && waiting && open && (
        <Waiting
          c={c}
          order={waiting}
          onOpen={() => {
            setOrder(waiting);
            setBuyer(null);
            setStep(waiting.account ? 'transfer' : 'card');
            setWaiting(null);
          }}
        />
      )}
      {!inFlow && paid.length > 0 && (
        <Paid
          c={c}
          orders={paid}
          onOpen={(o) => {
            setOrder(o);
            setBuyer(null);
            setStep('paid');
          }}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={confirming ? 'confirming' : step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease }}
        >
          {confirming ? (
            <Confirming reference={returning!} ask={ask} onDone={done} />
          ) : step === 'transfer' && order?.account ? (
            <Transfer amount={Number(order.amount)} what="order" state={order} ask={ask} onDone={done} />
          ) : step === 'card' && order ? (
            <Card amount={Number(order.amount)} state={order} />
          ) : step === 'expired' ? (
            <Expired what="order" onAgain={again} />
          ) : step === 'paid' && order ? (
            <Receipt c={c} order={order} pattern={patternFor(c, order)} buyer={buyer} onAgain={again} />
          ) : open ? (
            <OrderForm c={c} onNext={start} busy={busy} error={error} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (c.state === 'on_hold') {
    return (
      <>
        {header}
        {inFlow && (
          <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
            <div className="border-t border-ink/15 pt-12">{flow}</div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      {header}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="grid gap-12 border-t border-ink/15 pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FabricTag c={c} open={open} />
          </div>
          {(open || inFlow || paid.length > 0) && flow}
        </div>
      </section>
    </>
  );
}
