// src/utils/sessionId.ts
/**
 * Gera um UUID seguro.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Retorna sempre um novo sessionId a cada reload.
 * (Não usa storage, só memória)
 */
export function getSessionId(): string {
  return generateId();
}
