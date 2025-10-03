// src/utils/sessionId.ts
export const SESSION_KEY = "clickprato_session_id";

/**
 * Gera um UUID seguro.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  // Fallback: gera uma string hex de 32 chars
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Retorna o sessionId atual ou cria um novo se não existir.
 */
export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Limpa a sessão (caso queira reiniciar manualmente).
 */
export function clearSessionId() {
  sessionStorage.removeItem(SESSION_KEY);
}
