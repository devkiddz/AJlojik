// lib/collection-icons.ts

import {
  Wine,
  Martini,
  Candy,
  PartyPopper
} from 'lucide-react';

export const collectionIcons = {
  wine: Wine,
  martini: Martini,
  candy: Candy,
  party_popper: PartyPopper
};

export const getCollectionIcon = (name?: string) =>
  collectionIcons[name as keyof typeof collectionIcons] ?? PartyPopper;