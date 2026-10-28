// Endereços das telas de passo e de motorista (features 006 e 009).

export function stepHref(date: string, key: string): string {
  return `#/dia/${date}/${encodeURIComponent(key)}`;
}

export function driverHref(date: string, key: string): string {
  return `#/motorista/${date}/${encodeURIComponent(key)}`;
}

/** Tela "Rota até…" (feature 016): a chave é a do passo ou o id do lugar, como no motorista. */
export function routeHref(date: string, key: string, query = ''): string {
  return `#/rota/${date}/${encodeURIComponent(key)}${query}`;
}
