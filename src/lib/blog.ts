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
  topic?: 'Getting paid' | 'Controls';
  date: string; // ISO
  minutes: number;
  /** Personal posts usually have a photo (those without get a plain tile); business notes are set as memos, without one. */
  cover?: Photo;
  /** Business notes: the page to read next. */
  related?: { label: string; to: string };
  body: Block[];
};

export const posts: Post[] = [
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

export const postBySlug = (slug?: string) => posts.find((p) => p.slug === slug);

export const personalPosts = posts.filter((p) => p.audience === 'personal').sort((a, b) => b.date.localeCompare(a.date));
export const businessPosts = posts.filter((p) => p.audience === 'business').sort((a, b) => b.date.localeCompare(a.date));

export const postDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
