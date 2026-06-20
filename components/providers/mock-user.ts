import { UserType } from '@/types';

export const mockUser: UserType = {
  id: 'u1',
  name: 'Dennis Okaro',
  email: 'dennis@ajstore.com',
  avatar: '',
  wishlist: ['p1', 'p3', 'p9'],
  cart: [
    { productId: 'p2', quantity: 2 },
    { productId: 'p5', quantity: 1 }
  ]
};