import { apiFetch, getApiConfig, setApiConfig } from "@/lib/api";

describe("api utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("stores and returns API config", () => {
    setApiConfig("http://localhost:9999/", "abc123");
    const cfg = getApiConfig();
    expect(cfg.baseUrl).toBe("http://localhost:9999");
    expect(cfg.apiKey).toBe("abc123");
  });

  it("supports query object as second arg (backward compatibility)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await apiFetch<{ ok: boolean }>("/api/v1/findings/", { program_id: "p1", limit: 50 });

    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain("/api/v1/findings/");
    expect(calledUrl).toContain("program_id=p1");
    expect(calledUrl).toContain("limit=50");
  });

  it("supports options form with explicit query", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await apiFetch<{ ok: boolean }>("/api/v1/leaks/", { query: { skip: 100, limit: 50 } });

    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain("skip=100");
    expect(calledUrl).toContain("limit=50");
  });

  it("throws AUTH_FAILED on unauthorized response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("unauthorized", { status: 401 }));

    await expect(apiFetch("/api/v1/programs/", { suppressAuthRedirect: true })).rejects.toThrow("AUTH_FAILED");
  });
});
