import { CATEGORIES, SIZES } from '@/data/catalog';
import type { CategoryId, ScanResult } from '@/types';

/**
 * Photo → suggested items. Runs on the server (Expo dev server locally, EAS
 * Hosting in production) so the OpenAI key never ships inside the app.
 */

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
const MAX_IMAGE_CHARS = 8_000_000;

const PROMPT = `You help Norwegian parents register baby gear from a photo. The photo usually shows baby clothes (often a pile), a product box, or a single item.

Return only what you can actually see:
- One entry per kind of thing. Group identical garments: four bodies = one entry with quantity 4. Count carefully; give your best estimate if things overlap.
- name: short, generic Norwegian (bokmål) name as a parent would write it, e.g. "Body", "Ullbody", "Pysj", "Bukse", "Lue", "Sokker", "Sovepose", "Bilstol", "Tåteflaske". Never put the size in the name. Add brand or model only when clearly printed on a box.
- size: Norwegian baby size in cm, only when you can read it on a label or box. Otherwise null. Never guess.
- category: sleep, clothes, care, transport, food, hospitalBag (only things obviously packed for the hospital) or other.
- match: only for things that are not clothes. If the thing is the same kind of product as an entry on the family's list, give that entry's number, otherwise null. Match on what it is, not the wording: a "Maxi-Cosi babyskall" box matches "Bilstol gr. 0+".
- label: what the photo shows, in lowercase Norwegian with an indefinite article, e.g. "en bunke med klær", "en produkteske", "et par sokker".

If nothing baby-related is visible, return an empty items list and say what you see in label.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['label', 'items'],
  properties: {
    label: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'category', 'size', 'quantity', 'match'],
        properties: {
          name: { type: 'string' },
          category: { type: 'string', enum: CATEGORY_IDS },
          size: { type: ['string', 'null'], enum: [...SIZES, null] },
          quantity: { type: 'integer' },
          match: { type: ['integer', 'null'] },
        },
      },
    },
  },
};

interface ListEntry {
  id: string;
  name: string;
}

interface Raw {
  label: string;
  items: { name: string; category: string; size: string | null; quantity: number; match: number | null }[];
}

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fail(503, 'not-configured');

  let body: { image?: unknown; list?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad-request');
  }
  const image = body.image;
  if (typeof image !== 'string' || !image || image.length > MAX_IMAGE_CHARS) return fail(400, 'bad-image');
  const list: ListEntry[] = Array.isArray(body.list)
    ? body.list
        .filter((e): e is ListEntry => typeof e?.id === 'string' && typeof e?.name === 'string')
        .slice(0, 200)
    : [];

  const listText = list.length
    ? list.map((e, i) => `${i + 1}. ${e.name}`).join('\n')
    : '(tom)';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: `The family's list:\n${listText}` },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
          ],
        },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'scan', strict: true, schema: SCHEMA } },
    }),
  });

  if (!res.ok) {
    console.warn('[scan] OpenAI error', res.status, await res.text().catch(() => ''));
    return fail(502, 'ai-failed');
  }

  let raw: Raw;
  try {
    const data = await res.json();
    raw = JSON.parse(data.choices[0].message.content);
  } catch {
    return fail(502, 'ai-failed');
  }

  const result: ScanResult = {
    label: raw.label?.trim() || 'et bilde',
    items: (raw.items ?? [])
      .filter((i) => i.name?.trim() && CATEGORY_IDS.includes(i.category as CategoryId))
      .map((i) => ({
        name: i.name.trim().slice(0, 60),
        category: i.category as CategoryId,
        size: i.size && SIZES.includes(i.size) ? i.size : undefined,
        quantity: Math.min(50, Math.max(1, Math.round(i.quantity) || 1)),
        matchId: i.match && i.category !== 'clothes' ? list[i.match - 1]?.id : undefined,
      })),
  };
  return Response.json(result);
}
