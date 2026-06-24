export default function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
