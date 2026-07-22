import { formatMoneyShort } from "@/lib/utils";

export interface EarningsMonth {
  key: string;
  label: string;
  value: number; // pence
}

/**
 * Six-month earnings bar chart (single series → one brand hue, no legend).
 * Thin bars with rounded data-ends on a recessive baseline; only the latest
 * non-zero month is direct-labelled, every bar has a hover tooltip, and a
 * visually-hidden table mirrors the data for screen readers.
 */
export function EarningsChart({
  months,
  currency,
  title,
}: {
  months: EarningsMonth[];
  currency: "GBP" | "EUR";
  title: string;
}) {
  const max = Math.max(...months.map((m) => m.value), 1);
  const lastValueIdx = months.reduce((acc, m, i) => (m.value > 0 ? i : acc), -1);

  return (
    <div>
      <div
        role="img"
        aria-label={title}
        className="flex h-32 items-end gap-2 border-b border-navy-100 pb-px sm:gap-3"
      >
        {months.map((m, i) => (
          <div
            key={m.key}
            title={`${m.label} · ${formatMoneyShort(m.value, currency)}`}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            {i === lastValueIdx && (
              <span className="text-xs font-bold text-navy-900">
                {formatMoneyShort(m.value, currency)}
              </span>
            )}
            <div
              className={`w-full max-w-9 rounded-t transition-colors ${
                m.value > 0 ? "bg-brand-500 group-hover:bg-brand-600" : "bg-navy-100"
              }`}
              style={{ height: m.value > 0 ? `${Math.max((m.value / max) * 82, 4)}%` : "3px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 sm:gap-3">
        {months.map((m) => (
          <span key={m.key} className="flex-1 text-center text-[11px] text-navy-400">
            {m.label}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {months.map((m) => (
            <tr key={m.key}>
              <th scope="row">{m.label}</th>
              <td>{formatMoneyShort(m.value, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
