/**
 * Creates a unique id via crypto.randomUUID
 */
export function createId(): string {
  return crypto.randomUUID()
}
