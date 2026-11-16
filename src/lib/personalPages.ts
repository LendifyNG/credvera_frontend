import { INTERNATIONAL } from './launch';

// The personal account's feature pages, in reading order.
const withAbroad = [
  { no: '01', to: '/personal/abroad', title: 'Get paid from abroad', line: 'Dollars, pounds and euros, in your own name.' },
  { no: '02', to: '/personal/everyday', title: 'Everyday money', line: 'Bills, airtime and a card that works online.' },
  { no: '03', to: '/personal/save', title: 'Save and split', line: 'Put money aside. Get paid back.' },
  { no: '04', to: '/personal/passport', title: 'Earnings Passport', line: 'Prove your income without a bank statement.' },
] as const;

// At launch: celebrations take the first and last chapters (see launch.ts).
const atLaunch = [
  { no: '01', to: '/personal/celebrate', title: 'Celebrations', line: 'Gifts and spray, straight to your account.' },
  { no: '02', to: '/personal/everyday', title: 'Everyday money', line: 'Bills, airtime and transfers, in one place.' },
  { no: '03', to: '/personal/save', title: 'Save and split', line: 'Put money aside. Get paid back.' },
  { no: '04', to: '/personal/aso-ebi', title: 'Aso-ebi', line: 'Collect for the fabric without the spreadsheet.' },
] as const;

export type PersonalPage = { no: string; to: string; title: string; line: string };

export const personalPages: readonly [PersonalPage, PersonalPage, PersonalPage, PersonalPage] = INTERNATIONAL ? withAbroad : atLaunch;
