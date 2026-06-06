import { Aperture, AtSign } from 'lucide-react';
import Link from 'next/dist/client/link';

export default function FooterComponent({ brandName, brandSlug }: { brandName: string; brandSlug: string }) {
  return (
    <footer className="border-t flex items-center px-6 py-2 w-full mt-auto bg-primary-foreground/80 backdrop-blur-xs shadow-lg overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-xl flex items-center space-x-1">
              <Link className="flex items-baseline gap-1" href="/">
                <h1 className="text-rose-500 text-xl font-bold">{brandName}</h1>{' '}
                <span className="font-light tracking-tight">{brandSlug}</span>
                <Aperture className="text-rose-500 w-2 h-2" />
              </Link>
            </div>
            <h3 className="mb-4 text-xl font-bold">Liquors & Kitchen</h3>
            <p className="text-sm text-muted-foreground leading-6">
              Fast delivery of premium liquors, delicious meals, grilled specials, and kitchen essentials
              right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Categories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Special Offers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 font-semibold">Customer Service</h4>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Delivery Information
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>📍 Lagos, Nigeria</li>
              <li>📞 +234 XXX XXX XXXX</li>
              <li>✉️ hello@liquorskitchen.com</li>
              <li>🕒 Mon - Sun: 8:00 AM - 11:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 flex justify-around items-center">
          <p className="text-center text-sm text-muted-foreground flex gap-x-2 items-center">
            <span className="flex text-rose-500 text-xs font-normal items-center mt-0.5">
              <AtSign className="w-3" /> {new Date().getFullYear()}
            </span>{' '}
            Liquors & Kitchen Quick Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
