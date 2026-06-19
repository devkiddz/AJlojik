// app/(store)/store/layout.tsx

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen bg-background">{children}</main>
    </>
  );
}
