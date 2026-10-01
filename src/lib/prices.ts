import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { notify } from '@/lib/dialog';
import { colors } from '@/theme';

/**
 * BabyKlar oppgir aldri en pris selv. Lenken åpner dagens reelle priser og
 * butikker hos Prisjakt, så ingenting her kan bli utdatert.
 */
export const PRICE_SOURCE = 'Prisjakt';

const SEARCH_URL = 'https://www.prisjakt.no/search?query=';

/** Checklist names are written for parents, not for a price search. */
const QUERIES: { match: RegExp; query: string }[] = [
  { match: /bilstol/i, query: 'babybilstol gruppe 0+' },
  { match: /bedside/i, query: 'bedside crib' },
  { match: /madrass/i, query: 'madrass babyseng' },
  { match: /laken/i, query: 'laken babyseng' },
  { match: /sovepose/i, query: 'sovepose baby' },
  { match: /nattlys/i, query: 'nattlys barnerom' },
  { match: /babycall/i, query: 'babycall' },
  { match: /ullbody/i, query: 'ullbody baby' },
  { match: /body/i, query: 'body baby' },
  { match: /pysj/i, query: 'pysjamas baby' },
  { match: /bukse/i, query: 'bukse baby' },
  { match: /sokker/i, query: 'babysokker' },
  { match: /lue/i, query: 'babylue' },
  { match: /yttertøy|dress/i, query: 'babydress' },
  { match: /votter/i, query: 'votter baby' },
  { match: /bleier/i, query: 'bleier str 1' },
  { match: /stellematte/i, query: 'stellematte' },
  { match: /stellebord/i, query: 'stellebord' },
  { match: /vaskekluter/i, query: 'vaskekluter baby' },
  { match: /termometer/i, query: 'febertermometer baby' },
  { match: /neglefil|neglesaks/i, query: 'neglesett baby' },
  { match: /badekar/i, query: 'babybadekar' },
  { match: /babyolje|krem/i, query: 'babyolje' },
  { match: /vogn med bag|barnevogn/i, query: 'barnevogn' },
  { match: /regntrekk/i, query: 'regntrekk barnevogn' },
  { match: /myggnetting/i, query: 'myggnetting barnevogn' },
  { match: /bæresele|bæretørkle/i, query: 'bæresele baby' },
  { match: /vognpose/i, query: 'vognpose' },
  { match: /smekke/i, query: 'smekke baby' },
  { match: /tåteflaske/i, query: 'tåteflaske' },
  { match: /ammepute|støttepute/i, query: 'ammepute' },
  { match: /sterilisator/i, query: 'sterilisator tåteflaske' },
  { match: /høystol|barnestol/i, query: 'barnestol høystol' },
];

const clean = (name: string) =>
  name
    .replace(/^bag:\s*/i, '')
    .replace(/\s*str\.?\s*\d+/gi, '')
    .replace(/\s*gr\.\s*0\+/i, '')
    .replace(/\s*\d+[–-]\d+\s*mnd/i, '')
    .replace(/[«»]/g, '')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function priceCheckQuery(name: string): string {
  return QUERIES.find((q) => q.match.test(name))?.query ?? clean(name);
}

const searchUrl = (term: string) => `${SEARCH_URL}${encodeURIComponent(term)}`;

export function priceCheckUrl(name: string): string {
  return searchUrl(priceCheckQuery(name));
}

async function open(url: string, term: string): Promise<void> {
  try {
    // In-app browser (SafariViewController / Chrome Custom Tab) keeps the user in the
    // app and brings its own share / open-in-browser controls. Web has no equivalent.
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: colors.surface,
      controlsColor: colors.primary,
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    notify('Kunne ikke åpne lenken', `Søk etter «${term}» på ${PRICE_SOURCE}.`);
  }
}

/** Open Prisjakt for a checklist item, mapped to a good generic search term. */
export function openPriceCheck(name: string): Promise<void> {
  const term = priceCheckQuery(name);
  return open(searchUrl(term), term);
}

/** Open Prisjakt for an exact product term (e.g. a curated favourite: brand + model). */
export function openPriceSearch(term: string): Promise<void> {
  const t = term.trim();
  return open(searchUrl(t), t);
}
