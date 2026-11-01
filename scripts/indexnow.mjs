// Tells Bing, Yandex and the other IndexNow search engines about every page in
// the live sitemap, so new and changed pages are crawled within hours rather
// than weeks. Run it after a deploy that adds or changes pages:
//
//   node scripts/indexnow.mjs
//
// The key is public by design: search engines check it against
// https://credvera.co/<key>.txt, which proves the request comes from this site.
const KEY = 'cf92cedccffadd934c08e3c38379d2f3';
const HOST = 'credvera.co';

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} pages`);
