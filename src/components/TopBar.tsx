import { ProgramSelector } from "./ProgramSelector";
import { useQueryClient } from "@tanstack/react-query";
import { Circle } from "lucide-react";

export function TopBar() {
  const qc = useQueryClient();

  const handleProgramChange = () => {
    qc.invalidateQueries();
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 pl-14 lg:pl-4">
      <ProgramSelector onChange={handleProgramChange} />

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-severity-low">
          <Circle className="h-2 w-2 fill-current" />
          <span>Live</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Ready
        </span>
      </div>
    </header>
  );
}
