export default function ProductPageLoading() {
  return (
    <main className="mx-auto w-full max-w-[94rem] animate-pulse px-3 pb-24 pt-5 sm:px-5 lg:px-6">
      <div className="h-4 w-64 rounded-full bg-muted" />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="aspect-[4/5] rounded-3xl bg-muted" />
        <div className="h-[38rem] rounded-3xl bg-muted" />
      </div>

      <div className="mt-10 h-80 rounded-3xl bg-muted" />
    </main>
  );
}
