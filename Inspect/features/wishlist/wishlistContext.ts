'use client';

import {
  createContext
} from 'react';

import type {
  WishlistContextValue
} from './wishlistTypes';

export const WishlistContext =
  createContext<WishlistContextValue | null>(
    null
  );