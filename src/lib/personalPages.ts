// The personal account's feature pages, in reading order.
export const personalPages = [
  { no: '01', to: '/personal/abroad', title: 'Get paid from abroad', line: 'Dollars, pounds and euros, in your own name.' },
  { no: '02', to: '/personal/everyday', title: 'Everyday money', line: 'Bills, airtime and a card that works online.' },
  { no: '03', to: '/personal/save', title: 'Save and split', line: 'Put money aside. Get paid back.' },
  { no: '04', to: '/personal/passport', title: 'Earnings Passport', line: 'Prove your income without a bank statement.' },
] as const;

export type PersonalPage = (typeof personalPages)[number];
