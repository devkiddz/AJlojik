import type { ReactNode } from 'react';

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <>
      <div className="min-h-screen pb-24 lg:pb-0">{children}</div>
    </>
  );
}
