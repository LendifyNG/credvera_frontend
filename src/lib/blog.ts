import { INTERNATIONAL } from './launch';
import { photos, type Photo } from './photos';

// The blog. Short, practical guides that describe only what the app does
// today. TODO(credvera): have the team review or rewrite each post, and add
// author names, before launch.

export type Block = { h?: string; p?: string; list?: string[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  /** Which blog it belongs to: the personal blog (/blog) or business notes (/business/blog). */
  audience: 'personal' | 'business';
  category: 'Personal' | 'Business' | 'Guides';
  /** Business notes: what it's about, shown on the index. */
  topic?: 'Getting paid' | 'Controls' | 'FX' | 'Payouts' | 'Suppliers';
  date: string; // ISO
  minutes: number;
  /** Personal posts usually have a photo (those without get a plain tile); business notes are set as memos, without one. */
  cover?: Photo;
  /** Business notes: the page to read next. */
  related?: { label: string; to: string };
  body: Block[];
};

// Every post, international ones included. At launch (lib/launch.ts) each
// international post's slot holds a naira one instead: see atLaunch below.
const withAbroad: Post[] = [
  {
    slug: 'get-paid-from-abroad',
    audience: 'personal',
    title: 'How to get paid from abroad into your own dollar account',
    dek: 'Open a US dollar, pound or euro account in the app and share its details with the people who pay you.',
    category: 'Personal',
    date: '2026-09-22',
    minutes: 4,
    cover: photos.blogBridge,
    body: [
      { p: 'If you work for clients, employers or platforms outside Nigeria, you can receive their payments into an account in your own name, in their currency.' },
      { h: 'Before you start' },
      { p: 'Receiving money from abroad opens at Tier 2. In the app, add your NIN alongside your BVN and take a selfie. It usually takes about a minute.' },
      { h: 'Open the currency you need' },
      { list: ['Go to Wallets and choose Add a currency.', 'Pick US dollar, British pound or euro.', 'The account opens straight away, at a zero balance.'] },
      { h: 'Share your details' },
      { p: 'Open the currency and tap Details to see the account details to give your client. Clients who pay through PayPal can use your PayPal link instead.' },
      { h: 'When the money arrives' },
      { p: 'It lands in that currency. Keep it there, or convert it to naira when you choose. Before you convert, the app shows our rate beside the market rate, and holds the rate while you confirm.' },
    ],
  },
  {
    slug: 'what-your-landlord-sees',
    audience: 'personal',
    title: 'What your landlord sees on an Earnings Passport',
    dek: 'A verified page about your income from abroad, without your balance or bank statements.',
    category: 'Personal',
    date: '2026-09-18',
    minutes: 3,
    cover: photos.blogSkyline,
    body: [
      { p: 'An Earnings Passport is a link you share with a landlord, embassy or lender. It shows facts about the income you receive from abroad, checked from the payments that actually arrived in your Credvera accounts.' },
      { h: 'What they see' },
      { list: ['Your name, and that your identity was checked with your BVN', 'Your monthly income from abroad, as a range', 'How many months you were paid, and since when', 'Who paid you, only if you turn that on'] },
      { h: 'What they never see' },
      { list: ['Your balance', 'Exact amounts', 'Any other payments you make or receive'] },
      { h: 'You stay in control' },
      { p: 'You choose the months it covers and how long the link works: 7, 30 or 90 days. You can see how often it has been opened, and cancel it at any time. Once cancelled, the link stops working.' },
    ],
  },
  {
    slug: 'split-bills-without-the-reminder',
    audience: 'personal',
    title: 'Splitting a bill without the awkward reminder',
    dek: 'Share a bill with friends and see who has paid, who paid part, and who still owes.',
    category: 'Guides',
    date: '2026-09-12',
    minutes: 2,
    cover: photos.blogKaftan,
    body: [
      { p: 'Dinner, a shared subscription, a trip: someone pays first and then has to chase everyone else. Split bills keeps track for you.' },
      { h: 'Start a split' },
      { list: ['Choose Split bill from Payments, or open a payment you already made and tap Split this payment.', 'Add the people sharing it, and each person’s share.', 'Send them the request.'] },
      { h: 'Follow it' },
      { p: 'Each split shows who has paid in full, who has paid part, and who hasn’t paid yet. Your own Home screen shows how much you’re still owed in total.' },
    ],
  },
  {
    slug: 'spot-a-fake-transfer-alert',
    audience: 'personal',
    title: 'How to spot a fake transfer alert before you hand over the goods',
    dek: 'An alert text or a payment screenshot can be faked in seconds. Your balance can’t.',
    category: 'Guides',
    date: '2026-11-01',
    minutes: 3,
    body: [
      { p: 'It usually happens at a busy moment. A customer shows you a transfer on their phone, or an alert arrives by text, and they ask to leave with the goods. The money never lands.' },
      { h: 'Signs to watch for' },
      {
        list: [
          'They show you a screenshot, or their own phone, instead of waiting for your alert.',
          'The text comes from an ordinary phone number, or the wording and spacing look different from your usual alerts.',
          'The balance in the message doesn’t match what you know you had.',
          'They’re in a hurry, or keep talking while you check.',
          'Someone says they sent too much by mistake and asks you to send the difference back.',
        ],
      },
      { h: 'The only check that counts' },
      { p: 'Open your banking app and look at your balance and your latest transactions. If the money isn’t there, it hasn’t arrived, whatever the message or the screenshot says.' },
      { h: 'On Credvera' },
      { p: 'Money you receive shows in Transactions with who sent it and how much. If you sell with invoices, an invoice marks itself paid when the money lands, so you don’t have to match alerts to customers.' },
      { h: 'If someone has already left' },
      { p: 'Report it at your nearest police station with whatever you have: the customer’s number, their account details, and the fake alert or screenshot.' },
    ],
  },
  {
    slug: 'convert-dollars-to-naira',
    audience: 'personal',
    title: 'Converting dollars to naira: how to see what you really get',
    dek: 'Before you convert, put the rate you’re offered beside the market rate. The gap between them is what the conversion costs.',
    category: 'Guides',
    date: '2026-10-31',
    minutes: 3,
    body: [
      { p: 'When you change money, the cost is usually hidden in the rate. Two offers can both say “no fee” and still leave you with very different amounts of naira.' },
      { h: 'Three numbers to look at' },
      { list: ['The market rate: what a dollar is worth right now.', 'The rate you’re offered.', 'How much naira you end up with.'] },
      { p: 'The difference between the first two is what you’re paying. The third is the only number that lands in your account.' },
      { h: 'Converting in the app' },
      {
        list: [
          'Open Wallets and tap Convert.',
          'Choose the currency you’re converting from, such as US dollars, and naira as the one to get.',
          'Enter how much to convert, or how much naira you want to end up with.',
          'Before you confirm, you see your rate, the market rate, our margin and the total taken from your wallet.',
          'The rate is held for a short time while you decide. If it runs out, get a new rate.',
        ],
      },
      { h: 'When it arrives' },
      { p: 'The naira lands in your naira wallet, usually within a minute. You can convert pounds and euros the same way.' },
      { h: 'You don’t have to convert straight away' },
      { p: 'Money from abroad can stay in dollars, pounds or euros for as long as you like. Convert when you need the naira.' },
    ],
  },
  {
    slug: 'buy-electricity-token-online',
    audience: 'personal',
    title: 'How to buy prepaid electricity units online and get your token',
    dek: 'Pay for prepaid or postpaid electricity from your phone, check the name on the meter first, and copy your token straight from the screen.',
    category: 'Guides',
    date: '2026-10-30',
    minutes: 3,
    body: [
      { p: 'No queue at the vending point and no running out of light at night. You can buy units for your own meter, your parents’ or your shop’s, from wherever you are.' },
      { h: 'What you need' },
      { list: ['The meter number, printed on the meter or on an old receipt.', 'Whether the meter is prepaid or postpaid.', 'Money in your naira wallet.'] },
      { h: 'Buy the units' },
      {
        list: [
          'Open Payments and choose Electricity.',
          'Pick your electricity company and the meter type.',
          'Enter the meter number. The app checks it and shows the name the meter is registered to.',
          'Enter the amount. Each company sets its own minimum, and the app shows it.',
          'Confirm with your PIN.',
        ],
      },
      { h: 'Your token' },
      { p: 'For a prepaid meter, the token appears on screen once the electricity company sends it. Tap to copy it, then key it into your meter. It’s on your receipt too, if you’re buying for someone else and want to send it to them.' },
      { p: 'If the company is slow to answer, the app tells you the payment is on its way instead. It stays in Transactions with its reference, so you can follow it up.' },
      { h: 'Check the name before you pay' },
      { p: 'If the name shown isn’t the one you expect, stop and check the number. Units bought for the wrong meter go to that meter.' },
    ],
  },
  {
    slug: 'pay-remita-rrr-online',
    audience: 'personal',
    title: 'How to pay a Remita bill with your RRR',
    dek: 'Government fees, school charges and other Remita invoices, paid from your phone with the reference number on the invoice.',
    category: 'Guides',
    date: '2026-10-27',
    minutes: 3,
    body: [
      { p: 'Many government agencies, schools and other organisations bill through Remita. Their invoice carries a Remita Retrieval Reference, or RRR: a 12-digit number that tells Remita exactly what you’re paying for and how much.' },
      { h: 'Pay it' },
      {
        list: [
          'Open Payments and choose Remita.',
          'Enter the RRR from your invoice.',
          'The app finds the bill and shows its details and the amount.',
          'Check them, then confirm with your PIN. It’s paid from your naira wallet.',
        ],
      },
      { h: 'Fees' },
      { p: 'Any service fee is shown beside the total before you confirm.' },
      { h: 'Afterwards' },
      { p: 'Keep the receipt from Transactions. The organisation that billed you can check the payment against the RRR, and many ask for the receipt as proof.' },
      { h: 'If the RRR isn’t found' },
      { p: 'Check the number against the invoice. If it has already been paid or is no longer valid, ask the organisation that issued it for a new one.' },
    ],
  },
  {
    slug: 'save-for-school-fees',
    audience: 'personal',
    title: 'How to save for school fees without thinking about it',
    dek: 'Set a goal with the amount and the date you need it, and let auto-save put a little aside every day, week or month.',
    category: 'Guides',
    date: '2026-10-24',
    minutes: 3,
    body: [
      { p: 'School fees come round on the same dates every year, and they’re rarely smaller than last time. Putting a little aside as you go is easier than finding it all in one month.' },
      { h: 'Set the goal' },
      { list: ['Open Savings and tap New goal.', 'Say what it’s for: school fees, rent, a new laptop.', 'Enter how much you need and when you need it.'] },
      { h: 'Turn on auto-save' },
      { p: 'Choose daily, weekly or monthly. The app works out how much to put aside each time to reach the goal by your date. Use that figure or set your own. It comes from your naira wallet.' },
      { h: 'Change it whenever you like' },
      { p: 'You can pause auto-save or change the amount at any time, or leave it off and add money yourself when you can.' },
      { h: 'A tip' },
      { p: 'Set the date a few weeks before the fees are due, so the money is ready before the school asks for it. The same works for rent.' },
    ],
  },
  {
    slug: 'first-invoice-sent-and-paid',
    audience: 'business',
    category: 'Business',
    topic: 'Getting paid',
    title: 'Your first invoice, sent and paid',
    dek: 'Write it, send it by email or WhatsApp, and let the customer pay by card or transfer from the invoice itself.',
    date: '2026-09-24',
    minutes: 3,
    related: { label: 'Payments and invoices', to: '/business/payments' },
    body: [
      { p: 'An invoice should do more than ask for money. On Credvera it carries its own way to pay, reminds your customer when it is due, and tells you when the money lands.' },
      { h: 'Write it' },
      { list: ['Start a new invoice from Payments.', 'Add your customer, your line items and the due date.', 'Save it as a draft if you are not ready to send.'] },
      { h: 'Send it' },
      { p: 'Send it by email or share the link on WhatsApp. Your customer opens it and pays by card or bank transfer, straight from the invoice.' },
      { h: 'Let it follow up' },
      { p: 'If it is not paid by the due date, a reminder goes out for you. When the money arrives, the invoice marks itself paid and a receipt goes to you both.' },
    ],
  },
  {
    slug: 'two-people-for-big-payments',
    audience: 'business',
    category: 'Business',
    topic: 'Controls',
    title: 'Why big payments should need two people',
    dek: 'The commonest business fraud is a changed bank account. A second approval is the simplest way to catch it.',
    date: '2026-09-20',
    minutes: 4,
    related: { label: 'Business security', to: '/business/security' },
    body: [
      { p: 'An email arrives from a supplier you know: they have changed banks, please pay the new account. It looks right. The payment goes out, and the real supplier never sees it.' },
      { h: 'Why a second person helps' },
      { p: 'Fraud like this depends on one person acting quickly and alone. When a large payment has to wait for someone else to approve it, there is a moment for a second look, and a second question.' },
      { h: 'How it works on Credvera' },
      { list: ['Big payments wait for a second approval before they go out.', 'The approver sees who the payment is to, the amount and the reason.', 'They approve with their own PIN or Face ID, and the payment goes out.'] },
      { h: 'A few habits that help' },
      { list: ['Save suppliers once, and pay them from the saved details.', 'Treat new bank details as a new recipient, and confirm them by phone.', 'Never share a PIN or one-time code, even with someone from Credvera.'] },
    ],
  },
  {
    slug: 'customers-abroad-pay-like-a-local',
    audience: 'business',
    category: 'Business',
    topic: 'FX',
    title: 'Letting customers abroad pay you like a local',
    dek: 'Dollar, pound and euro accounts in your business’s name, with details in each country’s own format.',
    date: '2026-09-15',
    minutes: 3,
    related: { label: 'FX and currencies', to: '/business/fx' },
    body: [
      { p: 'A customer in London should not need an international transfer to pay a business in Lagos. With a currency account in your business’s name, they pay you the way they pay anyone at home.' },
      { h: 'The details they use' },
      { list: ['In the United States: an account number and ACH routing number.', 'In the United Kingdom: a sort code and account number.', 'In the euro area: an IBAN.'] },
      { h: 'When you convert' },
      { p: 'Keep the money in that currency, or convert to naira when it suits you. You see our rate beside the market rate, and the rate is held for thirty seconds while you confirm. If it moves after that, you are asked again.' },
    ],
  },
  {
    slug: 'pay-suppliers-when-goods-ship',
    audience: 'business',
    topic: 'Suppliers',
    related: { label: 'Pay suppliers abroad', to: '/business/suppliers' },
    title: 'Paying a supplier abroad only when your goods ship',
    dek: 'Pay a deposit now and have the rest held until the shipping line confirms your goods are loaded.',
    category: 'Business',
    date: '2026-09-08',
    minutes: 4,
    body: [
      { p: 'Paying a new supplier in full before anything ships is a risk many importers know too well. With a Credvera business account you can pay on shipment instead.' },
      { h: 'How it works' },
      { list: ['Pay a deposit of 30% or 50% and set the date the goods must ship by.', 'We hold the balance, already converted.', 'The supplier sends the bill of lading. We check it with the shipping line.', 'Once the goods are confirmed loaded, the balance is paid to the supplier.'] },
      { h: 'If nothing ships' },
      { p: 'If the goods haven’t shipped by the date you set, you can take the held money back. That outcome is recorded on the supplier’s record.' },
      { h: 'Supplier Passport' },
      { p: 'Every order adds to a supplier’s record: how many businesses they have shipped to and how often on time. We confirm shipment, not the quality of the goods, so check them when they arrive.' },
    ],
  },
  {
    slug: 'pay-staff-and-suppliers-on-a-schedule',
    audience: 'business',
    category: 'Business',
    topic: 'Controls',
    related: { label: 'Payments and invoices', to: '/business/payments' },
    title: 'Paying staff and suppliers on a schedule',
    dek: 'Set up a repeat payment once, every week or every month, with the name on the account checked before the first one goes.',
    date: '2026-10-29',
    minutes: 3,
    body: [
      { p: 'Salaries, rent and a regular supplier get paid every month: the same amount, to the same account. Doing it by hand each time is how payments get missed, or sent to the wrong place.' },
      { h: 'Set it up once' },
      {
        list: [
          'In your business dashboard, open Payments and choose Pay someone.',
          'Choose the bank and enter the account number. We check the name on the account before you pay.',
          'Add what it’s for, like “Deliveries, September”.',
          'Choose to repeat it every week or every month.',
          'You see the fee and the total before you confirm.',
        ],
      },
      { h: 'Keep track' },
      { p: 'Scheduled payments lists everything that repeats, and the date each one next goes out.' },
      { h: 'Pay suppliers from saved details' },
      { p: 'Save the businesses you pay often in Suppliers and pay them from the saved details. If a supplier says their bank has changed, treat it as a new recipient and confirm it by phone before you pay.' },
    ],
  },
];

// At launch: a naira post in each international post's slot, for the same
// readers and about as long. The international slugs aren't in the launch list,
// so their links fall back to the blog index.
const launchFor: Record<string, Post> = {
  'get-paid-from-abroad': {
    slug: 'collect-wedding-gifts-with-one-link',
    audience: 'personal',
    title: 'How to collect wedding gifts with one link',
    dek: 'Make a page for the celebration, share the link, and see every gift and its note in one list.',
    category: 'Personal',
    date: '2026-11-08',
    minutes: 4,
    cover: photos.celebrateNaira,
    body: [
      { p: 'After a wedding, the gifts are everywhere: cash in envelopes, transfers to three different accounts, and alerts with no name on them. A celebration page puts them all in one place, with who sent what.' },
      { h: 'Make the page' },
      { list: ['In the app, start a new celebration.', 'Give it a name, like Ada & Tunde’s wedding, and the date.', 'You get a link of your own to share, and a code to print on the invitation.'] },
      { h: 'Share it' },
      { p: 'Send the link in the family WhatsApp group, or print the code on the invitation card. Guests open it on their phone. They don’t need the app or an account.' },
      { h: 'How guests give' },
      { list: ['On the page, by transfer or card, with a note.', 'Straight to the celebration’s own account number, from their usual bank app.'] },
      { p: 'Each gift shows in your list with the guest’s name, the amount and their note, so you know who to thank.' },
      { h: 'When you’re ready' },
      { p: 'Gifts wait in the celebration, away from your everyday money, until you move them to your account. Making the page, receiving gifts and moving them are all free.' },
    ],
  },
  'what-your-landlord-sees': {
    slug: 'collect-aso-ebi-without-the-notebook',
    audience: 'personal',
    title: 'Collecting aso-ebi money without the notebook',
    dek: 'One link for the family fabric. Guests pick, add their sizes and pay, and you see who has paid for what.',
    category: 'Personal',
    date: '2026-11-15',
    minutes: 3,
    cover: photos.asoEbiGroup,
    body: [
      { p: 'Whoever collects for the aso-ebi usually ends up with a notebook, a pile of transfer screenshots and a long list of aunties to chase. An aso-ebi page keeps the list for you.' },
      { h: 'Set it up' },
      { list: ['In the app, start a new aso-ebi page.', 'Add each fabric with its price, like gele, buba or agbada, and how many pieces you have if there’s a limit.', 'Set the deadline, then share the link.'] },
      { h: 'What guests do' },
      { list: ['Open the link and pick what they want, one fabric or several.', 'Add their sizes.', 'Pay on the page, by transfer or card. No sign-in.'] },
      { h: 'What you see' },
      { p: 'Each order shows who paid, for which fabrics and in which sizes. An order counts only once the money has arrived, so a screenshot isn’t enough. Add anyone who paid you in cash, call or WhatsApp a guest from their order, and tick people off as they collect.' },
      { h: 'What it costs' },
      { p: 'Nothing. Making an aso-ebi page, receiving guests’ payments and moving the money to your account are free.' },
    ],
  },
  'convert-dollars-to-naira': {
    slug: 'spray-from-your-phone',
    audience: 'personal',
    title: 'Spraying from your phone: how it works on the day',
    dek: 'Guests buy spray notes printed with the couple’s monogram, flick them from their phone, and watch them land on the big screen.',
    category: 'Guides',
    date: '2026-11-12',
    minutes: 3,
    body: [
      { p: 'Spraying is half the fun of an owambe. But not everyone carries a wad of crisp notes, and the money on the floor still has to be gathered and counted. Spraying from a phone keeps the fun and loses the counting.' },
      { h: 'For the guests' },
      {
        list: [
          'Scan the code on the screen in the hall, or open the celebration’s link.',
          'Choose Spray, then pick ₦200, ₦500 or ₦1,000 notes and how many.',
          'Pay by transfer or card.',
          'Flick the notes across your phone. Each one lands on the big screen with your name.',
        ],
      },
      { p: 'If you close the page halfway, open the link again on the same phone and carry on with the notes you have left.' },
      { h: 'For the celebrants' },
      { p: 'Put the celebration’s live screen up on a TV or projector in the hall. Spraying opens on the day of the celebration, and the notes carry your monogram.' },
      { h: 'Where the money goes' },
      { p: 'Every note is yours the moment the guest pays for it. It waits in the celebration with the gifts until you move it to your account, free.' },
    ],
  },
  'customers-abroad-pay-like-a-local': {
    slug: 'pay-everyone-from-one-spreadsheet',
    audience: 'business',
    category: 'Business',
    topic: 'Payouts',
    title: 'Paying everyone at once from one spreadsheet',
    dek: 'Salaries, riders, vendors: upload one file and pay them all, with every row checked before anything goes.',
    date: '2026-10-28',
    minutes: 3,
    related: { label: 'Bulk and scheduled payouts', to: '/business/payouts' },
    body: [
      { p: 'Paying twenty people one at a time is slow, and it’s how a digit gets typed wrong. With bulk payments, you pay them all from one list you already keep.' },
      { h: 'The file' },
      { list: ['Download the template from Bulk payments in your business dashboard.', 'One row per person: their name, bank, account number and amount.', 'Save it as CSV and upload it.'] },
      { h: 'Before you pay' },
      { p: 'Every row is checked first. A missing name, a bank we don’t recognise or an account number that isn’t 10 digits is marked to fix, and left out. You see how many are ready and the total with fees, then confirm with your PIN. If you’ve set an approval limit, any payment over it waits for a second person.' },
    ],
  },
  'pay-suppliers-when-goods-ship': {
    slug: 'pay-a-supplier-without-paying-blind',
    audience: 'business',
    topic: 'Suppliers',
    related: { label: 'Protected supplier payments', to: '/business/suppliers' },
    title: 'Paying a new supplier without paying blind',
    dek: 'Pay a deposit now and have the rest held until the goods are on their way.',
    category: 'Business',
    date: '2026-10-30',
    minutes: 4,
    body: [
      { p: 'Paying a new supplier in full before anything leaves their warehouse is a risk many businesses know too well. With a protected order, only the deposit goes now.' },
      { h: 'How it works' },
      { list: ['Choose a saved supplier and say what you’re buying.', 'Enter the order total and pick a deposit: none, 20%, 30% or 50%.', 'Set how soon the goods must ship, from 14 to 45 days.', 'The deposit goes to the supplier. The rest is held until you release it.'] },
      { h: 'When the goods move' },
      { p: 'Once you’re happy the goods are on their way, release the rest to the supplier with your PIN. If something’s wrong, raise a problem and the money stays held while you sort it out.' },
      { h: 'If it falls through' },
      { p: 'Call the order off and the held money comes back to your balance. Holding it is free; the deposit and the balance each cost the usual transfer fee.' },
    ],
  },
};

const atLaunch: Post[] = withAbroad.map((p) => launchFor[p.slug] ?? p);

export const posts: Post[] = INTERNATIONAL ? withAbroad : atLaunch;

export const postBySlug = (slug?: string) => posts.find((p) => p.slug === slug);

export const personalPosts = posts.filter((p) => p.audience === 'personal').sort((a, b) => b.date.localeCompare(a.date));
export const businessPosts = posts.filter((p) => p.audience === 'business').sort((a, b) => b.date.localeCompare(a.date));

export const postDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
