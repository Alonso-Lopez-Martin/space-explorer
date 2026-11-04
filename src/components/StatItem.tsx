interface StatItemProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}

export function StatItem({ label, value, unit = '' }: StatItemProps) {
  const displayValue = value != null ? `${value} ${unit}`.trim() : 'Desconocida';
  return (
    <li>
      <strong>{label}</strong> {displayValue}
    </li>
  );
}