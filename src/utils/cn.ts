// Pequeña utilidad para concatenar clases CSS condicionales de forma legible,
// evitando repetir `.filter(Boolean).join(' ')` o dejar espacios sobrantes en los templates.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}