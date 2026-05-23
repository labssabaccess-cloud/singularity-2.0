// Progress tracker — sessionStorage-backed, SSR-safe
const PROGRESS_KEY = "sg_completed_tools";

export function getCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markCompleted(toolId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCompleted();
    current.add(toolId);
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify([...current]));
    // Dispatch event so launcher can react without a page reload
    window.dispatchEvent(new CustomEvent("sg_progress", { detail: toolId }));
  } catch {
    // ignore
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}
