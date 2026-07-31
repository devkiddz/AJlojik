export default function SearchShortcut() {
  return (
    <div className="flex items-center gap-6 text-xs text-muted-foreground whitespace-nowrap">
      <div className="flex items-center gap-2">
        <kbd className="rounded border bg-muted px-2 py-1">↑</kbd>
        <kbd className="rounded border bg-muted px-2 py-1">↓</kbd>
        <span>Navigate</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="rounded border bg-muted px-2 py-1">↵</kbd>
        <span>Open</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="rounded border bg-muted px-2 py-1">Esc</kbd>
        <span>Close</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="rounded border bg-muted px-2 py-1">Ctrl K</kbd>
        <span>Focus</span>
      </div>
    </div>
  );
}
