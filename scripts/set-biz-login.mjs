// Sets up the business dashboard's sign-in (/business/app) on this computer.
// Run: npm run biz-login
// Writes .env.local (git-ignored) and shows the phone, code and PIN once here.
// This repo is public: never commit these or paste them into the code.
import { createHash, randomInt } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const sha = (v) => createHash('sha256').update(v).digest('hex');
const digits = (n) => Array.from({ length: n }, () => randomInt(10)).join('');

const rl = createInterface({ input: process.stdin, output: process.stdout });
const phoneIn = (await rl.question('Phone for the account, 10 digits (empty for 8030000000, as in the app): ')).replace(/\D/g, '');
const codeIn = (await rl.question('Six-digit code (empty to create one): ')).replace(/\D/g, '');
const pinIn = (await rl.question('Four-digit PIN (empty to create one): ')).replace(/\D/g, '');
rl.close();

const phone = (phoneIn || '8030000000').replace(/^234/, '').replace(/^0/, '');
const code = codeIn.length === 6 ? codeIn : digits(6);
let pin = pinIn.length === 4 ? pinIn : digits(4);
while (!pinIn && (new Set(pin).size < 3 || pin === '1234')) pin = digits(4);

const keep = existsSync('.env.local') ? readFileSync('.env.local', 'utf8').split('\n').filter((l) => l && !/^(VITE_BIZ_|# Business dashboard sign-in)/.test(l)) : [];
const lines = [
  '# Business dashboard sign-in (git-ignored). Made by npm run biz-login.',
  `VITE_BIZ_PHONE=${phone}`,
  `VITE_BIZ_CODE_SHA256=${sha(`credvera-biz-code:${code}`)}`,
  `VITE_BIZ_PIN_SHA256=${sha(`credvera-biz-pin:${pin}`)}`,
];
writeFileSync('.env.local', [...lines, ...keep, ''].join('\n'));

console.log(`
Saved to .env.local. Restart the dev server to use it.

  /business/app/sign-in → Other ways to sign in → Text me a code
  Phone   ${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
  Code    ${code}
  PIN     ${pin}

For the live site, add these three settings to the host's environment
settings and deploy again (they hold no readable code or PIN):
${lines.slice(1).map((l) => `  ${l}`).join('\n')}
`);
