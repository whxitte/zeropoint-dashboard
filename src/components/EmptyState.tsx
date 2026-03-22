import { SearchX } from "lucide-react";

export function EmptyState({ message = "No data found", sub }: { message?: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground/60">{sub}</p>}
    </div>
  );
}
