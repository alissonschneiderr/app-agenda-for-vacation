// Endereços das telas de passo e de motorista (features 006 e 009).

export function stepHref(date: string, key: string): string {
  return `#/dia/${date}/${encodeURIComponent(key)}`;
}

export function driverHref(date: string, key: string): string {
  return `#/motorista/${date}/${encodeURIComponent(key)}`;
}
