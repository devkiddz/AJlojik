import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ShoppingListInput = { id: string; name: string; productIds: string[] };

function normalizeLists(value: unknown): ShoppingListInput[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    const name = typeof candidate.name === 'string' ? candidate.name.trim().slice(0, 48) : '';
    if (!name) return [];
    const productIds = Array.isArray(candidate.productIds)
      ? [...new Set(candidate.productIds.filter((id): id is string => typeof id === 'string'))].slice(0, 60)
      : [];
    return [{ id: typeof candidate.id === 'string' ? candidate.id : crypto.randomUUID(), name, productIds }];
  });
}

async function sessionUser() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const profile = await prisma.experienceProfile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    select: { shoppingLists: true, experienceDensity: true, autoplayPreviews: true, discoveryEnabled: true, recommendationMode: true, shoppingNotifications: true, personalizationEnabled: true, preferredCategorySlugs: true }
  });
  return NextResponse.json({ user: { name: session.user.name, email: session.user.email, image: session.user.image ?? '' }, profile: { ...profile, shoppingLists: normalizeLists(profile.shoppingLists) } });
}

export async function PATCH(request: Request) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : session.user.name;
  const image = typeof body.image === 'string' ? body.image.trim().slice(0, 500) || null : session.user.image;
  const experienceDensity = ['compact', 'balanced', 'immersive'].includes(String(body.experienceDensity)) ? String(body.experienceDensity) : 'immersive';
  const recommendationMode = ['familiar', 'balanced', 'exploratory'].includes(String(body.recommendationMode)) ? String(body.recommendationMode) : 'balanced';
  const preferredCategorySlugs = Array.isArray(body.preferredCategorySlugs) ? body.preferredCategorySlugs.filter((slug): slug is string => typeof slug === 'string').slice(0, 12) : [];
  const shoppingLists = normalizeLists(body.shoppingLists);

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { name: name || session.user.name, image } }),
    prisma.experienceProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, shoppingLists, experienceDensity, recommendationMode, preferredCategorySlugs, autoplayPreviews: body.autoplayPreviews !== false, discoveryEnabled: body.discoveryEnabled !== false, shoppingNotifications: body.shoppingNotifications !== false, personalizationEnabled: body.personalizationEnabled !== false },
      update: { shoppingLists, experienceDensity, recommendationMode, preferredCategorySlugs, autoplayPreviews: body.autoplayPreviews !== false, discoveryEnabled: body.discoveryEnabled !== false, shoppingNotifications: body.shoppingNotifications !== false, personalizationEnabled: body.personalizationEnabled !== false }
    })
  ]);
  return NextResponse.json({ ok: true });
}
