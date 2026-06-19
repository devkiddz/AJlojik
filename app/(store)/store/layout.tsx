export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">{children}</div>
    </main>
  );
}
