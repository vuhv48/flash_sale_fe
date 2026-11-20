const RANK: Record<string, number> = {
  AUTO: 1,
  OWN: 2,
  ALL: 3,
}

export function accessCovers(actual: string, required: string) {
  return (RANK[actual] ?? 0) >= (RANK[required] ?? Number.POSITIVE_INFINITY)
}
