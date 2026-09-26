// Photos for the personal pages and the blog. Each is used once on the site.
// From Unsplash and Pexels (both free licences, commercial use allowed, no
// credit required). Credits are kept here only, never shown on the page.
// Short looping clips live in /public/video (Pexels), each with a .jpg still.
import abroadBalcony from '../assets/photos/personal/abroad-balcony-lagos.webp';
import abroadLaptop from '../assets/photos/personal/abroad-laptop-home.webp';
import blogBridge from '../assets/photos/personal/blog-lagos-bridge.webp';
import blogSkyline from '../assets/photos/personal/blog-lagos-skyline.webp';
import blogTraffic from '../assets/photos/personal/blog-lagos-traffic.webp';
import blogKaftan from '../assets/photos/personal/blog-man-kaftan-phone.webp';
import ctaLaughing from '../assets/photos/personal/cta-woman-laughing.webp';
import everydayStreet from '../assets/photos/personal/everyday-street-phone.webp';
import heroAnkara from '../assets/photos/personal/hero-woman-ankara.webp';
import passportWoman from '../assets/photos/personal/passport-woman-building.webp';
import splitDinner from '../assets/photos/personal/split-friends-dinner.webp';
import womanGele from '../assets/photos/personal/woman-gele-phone.webp';
import marketTomatoes from '../assets/photos/personal/market-tomatoes.webp';
import friendsSelfie from '../assets/photos/personal/friends-selfie-dinner.webp';
import womanKeys from '../assets/photos/personal/woman-keys-home.webp';
import marketLagosScene from '../assets/photos/personal/market-lagos-scene.webp';
import womanBraidsPhone from '../assets/photos/personal/woman-braids-phone.webp';
import manCapSunglasses from '../assets/photos/personal/man-cap-sunglasses.webp';
import marketNutsSeller from '../assets/photos/personal/market-nuts-seller.webp';
import familySofa from '../assets/photos/personal/family-sofa-home.webp';
import menYellowBus from '../assets/photos/personal/men-yellow-bus.webp';
import manWorkWatch from '../assets/photos/personal/man-work-watch.webp';
import marketOnions from '../assets/photos/personal/market-onions.webp';

export type Photo = { src: string; width: number; height: number; alt: string; credit: string };

export const photos = {
  heroAnkara: { src: heroAnkara, width: 1067, height: 1600, alt: 'A young woman in a blue ankara dress smiling at her phone', credit: 'Segun Osunyomi' },
  abroadLaptop: { src: abroadLaptop, width: 1600, height: 1064, alt: 'A woman with long braids working on her laptop at home', credit: 'Daniel Thomas' },
  abroadBalcony: { src: abroadBalcony, width: 1067, height: 1600, alt: 'A man on a balcony above city rooftops, looking at his phone', credit: 'Blessing Olarewaju' },
  everydayStreet: { src: everydayStreet, width: 1067, height: 1600, alt: 'A young woman checking her phone on a city street', credit: 'Muhammad-Taha Ibrahim' },
  splitDinner: { src: splitDinner, width: 1573, height: 1600, alt: 'Friends laughing together around a restaurant table', credit: 'Jim Nyamao' },
  passportWoman: { src: passportWoman, width: 1600, height: 1067, alt: 'A confident young woman with braids standing outside a building', credit: 'Blessing Olarewaju' },
  ctaLaughing: { src: ctaLaughing, width: 1600, height: 1067, alt: 'A woman laughing with friends outdoors', credit: 'Kona Studios' },
  blogTraffic: { src: blogTraffic, width: 1400, height: 934, alt: 'Lagos traffic seen from above, with yellow buses', credit: 'Opeyemi Adisa' },
  blogBridge: { src: blogBridge, width: 1600, height: 1068, alt: 'A Lagos bridge lit up over the water at night', credit: 'Opeyemi Adisa' },
  blogSkyline: { src: blogSkyline, width: 1600, height: 1067, alt: 'The Lagos skyline on a cloudy day', credit: 'Stephen Olatunde' },
  blogKaftan: { src: blogKaftan, width: 857, height: 1200, alt: 'A man in a pink kaftan laughing on the phone', credit: 'Olumide Adekunle' },
  // Pexels (photo ids in the credit)
  womanGele: { src: womanGele, width: 1200, height: 1600, alt: 'A woman in a gele and white lace, smiling at her phone', credit: 'Pexels 39638684' },
  marketTomatoes: { src: marketTomatoes, width: 1600, height: 1142, alt: 'A trader arranging tomatoes at her market stall', credit: 'Pexels 3213283' },
  menYellowBus: { src: menYellowBus, width: 1600, height: 1280, alt: 'People getting on a yellow danfo bus', credit: 'Pexels 15183533' },
  manWorkWatch: { src: manWorkWatch, width: 1200, height: 1800, alt: 'A man in a shirt and tie heading to work with his laptop bag', credit: 'Pexels 13801828' },
  marketOnions: { src: marketOnions, width: 1200, height: 1680, alt: 'A young woman selling onions at the market', credit: 'Pexels 33490144' },
  familySofa: { src: familySofa, width: 1600, height: 1066, alt: 'A family laughing together on the sofa at home', credit: 'Pexels 7114420' },
  friendsSelfie: { src: friendsSelfie, width: 1200, height: 1800, alt: 'Three friends taking a selfie over dinner', credit: 'Pexels 31412505' },
  womanKeys: { src: womanKeys, width: 1600, height: 1068, alt: 'A young woman smiling as she holds the keys to her new home', credit: 'Pexels 4971275' },
  marketLagosScene: { src: marketLagosScene, width: 1600, height: 900, alt: 'A busy Lagos market street, full of traders and shoppers', credit: 'Pexels 38968336' },
  womanBraidsPhone: { src: womanBraidsPhone, width: 1200, height: 1800, alt: 'A young woman with long braids on a phone call', credit: 'Pexels 33837423' },
  manCapSunglasses: { src: manCapSunglasses, width: 1200, height: 1800, alt: 'A young man in a patterned cap and sunglasses', credit: 'Pexels 33539805' },
  marketNutsSeller: { src: marketNutsSeller, width: 1200, height: 1680, alt: 'A trader serving a customer at her market stall', credit: 'Pexels 38519852' },
} satisfies Record<string, Photo>;
