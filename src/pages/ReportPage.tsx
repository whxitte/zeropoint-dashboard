import { useState, useRef } from "react";
import { apiFetch, getSelectedProgram } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Loader2, Printer, Download } from "lucide-react";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [sevFilter, setSevFilter] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    setLoading(true);
    const pid = getSelectedProgram();
    const params: any = { program_id: pid, limit: 200 };
    if (sevFilter) params.severity = sevFilter;
    if (newOnly) params.is_new = true;

    try {
      const [findings, secrets, leaks, ports, dorks] = await Promise.all([
        apiFetch<any>("/api/v1/findings/", { query: params }),
        apiFetch<any>("/api/v1/secrets/", { query: params }),
        apiFetch<any>("/api/v1/leaks/", { query: params }),
        apiFetch<any>("/api/v1/portfindings/", { query: params }),
        apiFetch<any>("/api/v1/dorks/", { query: params }),
      ]);
      setReport({ findings: findings.findings || [], secrets: secrets.secrets || [], leaks: leaks.leaks || [], ports: ports.findings || [], dorks: dorks.results || [], generated: new Date().toISOString() });
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    if (!reportRef.current) return;
    const html = `<!DOCTYPE html><html><head><title>ZeroPoint Report</title><style>body{font-family:system-ui;background:#0d1117;color:#c9d1d9;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #30363d;padding:8px;text-align:left;font-size:13px}th{background:#161b22}</style></head><body>${reportRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zeropoint-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Report</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All severities</option>
          {["critical", "high", "medium", "low", "info"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)} className="rounded" />
          New only
        </label>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generate Report
        </button>
        {report && (
          <>
            <button onClick={downloadHtml} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent active:scale-[0.97]">
              <Download className="h-4 w-4" /> Download HTML
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent active:scale-[0.97]">
              <Printer className="h-4 w-4" /> Print
            </button>
          </>
        )}
      </div>

      {report && (
        <div ref={reportRef} className="space-y-6 rounded-lg border border-border bg-card p-6 print:bg-white print:text-black">
          <div className="text-sm text-muted-foreground">Generated: {new Date(report.generated).toLocaleString()}</div>

          {[
            { title: "Findings", items: report.findings, cols: ["severity", "template_name", "domain", "matched_at"] },
            { title: "Secrets", items: report.secrets, cols: ["severity", "secret_type", "domain", "secret_value"] },
            { title: "Leaks", items: report.leaks, cols: ["severity", "match_type", "repo_full_name", "file_path"] },
            { title: "Ports", items: report.ports, cols: ["severity", "ip", "port", "service", "product"] },
            { title: "Dorks", items: report.dorks, cols: ["severity", "dork_category", "title", "url"] },
          ].map(({ title, items, cols }) => items.length > 0 && (
            <div key={title}>
              <h2 className="mb-2 text-lg font-semibold text-foreground">{title} ({items.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated text-left uppercase tracking-wider text-muted-foreground">
                      {cols.map(c => <th key={c} className="px-3 py-2">{c.replace("_", " ")}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-border">
                        {cols.map(c => (
                          <td key={c} className="max-w-[200px] truncate px-3 py-2 text-foreground">
                            {c === "severity" ? <SeverityBadge severity={item[c]} /> : (item[c] || "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
