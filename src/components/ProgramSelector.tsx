import { usePrograms } from "@/hooks/use-api";
import { getSelectedProgram, setSelectedProgram } from "@/lib/api";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ProgramSelector({ onChange }: { onChange?: (id: string) => void }) {
  const { data } = usePrograms();
  const [selected, setSelected] = useState(getSelectedProgram());

  useEffect(() => {
    if (!selected && data?.programs?.length) {
      const first = data.programs[0].program_id;
      setSelected(first);
      setSelectedProgram(first);
      onChange?.(first);
    }
  }, [data, selected, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    setSelectedProgram(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={handleChange}
        className="appearance-none rounded-md border border-border bg-card px-3 py-1.5 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary"
      >
        {!data?.programs?.length && <option value="">No programs</option>}
        {data?.programs?.map((p: any) => (
          <option key={p.program_id} value={p.program_id}>{p.name || p.program_id}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
