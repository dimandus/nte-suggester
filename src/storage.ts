const KEY = "nte-owned-v1"

export function loadOwned(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export function saveOwned(ids: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(ids))
}
