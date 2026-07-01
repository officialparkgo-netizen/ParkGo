"use client";

import { useMemo, useState } from "react";
import { CarTaxiFront, CreditCard, Lock, ShieldCheck, Wallet, Zap, Bitcoin } from "lucide-react";
import type { Space } from "@/types";
import { priceBundle } from "@/lib/pricing";
import { formatMoney } from "@/lib/utils";
import { createBookingAction } from "@/lib/booking-actions";
import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

const METHODS = [
  { id: "card", labelKey: "app.checkout.card", icon: CreditCard },
  { id: "wallet", labelKey: "app.checkout.wallet", icon: Wallet },
  { id: "crypto", labelKey: "app.checkout.crypto", icon: Bitcoin },
] as const;

export function Checkout({
  space,
  startDate,
  endDate,
  currency,
  initialTransfer = false,
  initialEv = false,
}: {
  space: Space;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  currency: "GBP" | "EUR";
  initialTransfer?: boolean;
  initialEv?: boolean;
}) {
  const t = useT();
  const [transfer, setTransfer] = useState(initialTransfer);
  const [ev, setEv] = useState(initialEv && !!space.evCharger);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("card");
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  const price = useMemo(
    () =>
      priceBundle(
        space,
        { parking: true, transfer, ev },
        new Date(start).toISOString(),
        new Date(end).toISOString(),
        currency
      ),
    [space, transfer, ev, start, end, currency]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Bundle builder */}
      <div className="lg:col-span-3">
        <h2 className="text-lg font-bold text-navy-900">{t("common.buildBundle")}</h2>
        <p className="text-sm text-navy-500">
          {t("app.checkout.buildBundleSub")}
        </p>

        <div className="mt-4 space-y-3">
          <Line
            checked
            disabled
            icon={ShieldCheck}
            title={t("app.checkout.verifiedParking")}
            subtitle={`${space.title} · ${space.driveMinutes} ${t("app.checkout.minToTerminal")}`}
          />
          <Line
            checked={transfer}
            onChange={setTransfer}
            icon={CarTaxiFront}
            title={t("app.checkout.licensedTransfer")}
            subtitle={t("app.checkout.transferSub")}
          />
          <Line
            checked={ev}
            onChange={(v) => setEv(v && !!space.evCharger)}
            disabled={!space.evCharger}
            icon={Zap}
            title={t("app.checkout.evOnSite")}
            subtitle={
              space.evCharger
                ? `${space.evCharger.connector} · ${space.evCharger.kw}kW`
                : t("app.checkout.evNotAvailable")
            }
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-500">{t("app.checkout.dropOff")}</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-11 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-500">{t("app.checkout.pickUp")}</span>
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="h-11 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <h3 className="mt-6 text-sm font-bold text-navy-900">{t("app.checkout.paymentMethod")}</h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                method === m.id
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-navy-200 text-navy-600 hover:bg-navy-50"
              }`}
            >
              <m.icon className="h-4 w-4" /> {t(m.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
          <h3 className="font-bold text-navy-900">{t("app.checkout.orderSummary")}</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={t("app.checkout.parking")} value={formatMoney(price.parking, currency)} />
            {transfer && <Row label={t("app.checkout.licensedTransferRow")} value={formatMoney(price.transfer, currency)} />}
            {ev && <Row label={t("app.checkout.evCharging")} value={formatMoney(price.ev, currency)} />}
            <Row label={t("app.checkout.serviceFee")} value={formatMoney(price.serviceFee, currency)} />
            <div className="my-2 border-t border-navy-100" />
            <div className="flex items-center justify-between">
              <dt className="text-base font-bold text-navy-900">{t("common.total")}</dt>
              <dd className="text-xl font-extrabold text-navy-900">
                {formatMoney(price.total, currency)}
              </dd>
            </div>
          </dl>

          <form action={createBookingAction} className="mt-4">
            <input type="hidden" name="spaceId" value={space.id} />
            <input type="hidden" name="startAt" value={new Date(start).toISOString()} />
            <input type="hidden" name="endAt" value={new Date(end).toISOString()} />
            <input type="hidden" name="transfer" value={transfer ? "1" : ""} />
            <input type="hidden" name="ev" value={ev ? "1" : ""} />
            <input type="hidden" name="method" value={method} />
            <Button type="submit" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> {t("app.checkout.pay")} {formatMoney(price.total, currency)}
            </Button>
          </form>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-400">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("app.checkout.releaseNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({
  checked,
  onChange,
  disabled,
  icon: Icon,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-xl border p-3.5 ${
        checked ? "border-brand-300 bg-brand-50/50" : "border-navy-200"
      } ${disabled && !checked ? "opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled || !onChange}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-5 w-5 rounded border-navy-300 text-brand-500 focus:ring-brand-400"
      />
      <Icon className="h-5 w-5 text-brand-600" />
      <span className="flex-1">
        <span className="block text-sm font-bold text-navy-900">{title}</span>
        <span className="block text-xs text-navy-500">{subtitle}</span>
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-navy-600">
      <dt>{label}</dt>
      <dd className="font-semibold text-navy-800">{value}</dd>
    </div>
  );
}
