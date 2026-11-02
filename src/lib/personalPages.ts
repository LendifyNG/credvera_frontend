// The personal account's feature pages, in reading order.
export const personalPages = [
  { no: '01', to: '/personal/everyday', title: 'Everyday money', line: 'Bills, airtime and transfers to any bank.' },
  { no: '02', to: '/personal/save', title: 'Save and split', line: 'Put money aside. Get paid back.' },
] as const;

export type PersonalPage = (typeof personalPages)[number];
