"use client";

import { useMemo, useState } from "react";
import { CarTaxiFront, CheckCircle2, CreditCard, Lock, ShieldCheck, Wallet, Zap } from "lucide-react";
import type { Space } from "@/types";
import { priceBundle, type PriceConfig } from "@/lib/pricing";
import { formatMoney } from "@/lib/utils";
import { createBookingAction } from "@/lib/booking-actions";
import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

const METHODS = [
  { id: "card", labelKey: "app.checkout.card", icon: CreditCard },
  { id: "wallet", labelKey: "app.checkout.wallet", icon: Wallet },
] as const;

export function Checkout({
  space,
  startDate,
  endDate,
  currency,
  initialTransfer = false,
  initialEv = false,
  allowTransfer = true,
  promoInvalid = false,
  priceCfg,
}: {
  space: Space;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  currency: "GBP" | "EUR";
  initialTransfer?: boolean;
  initialEv?: boolean;
  /** Terminal transfer exists only at airport destinations. */
  allowTransfer?: boolean;
  /** The promo the traveller typed was rejected server-side. */
  promoInvalid?: boolean;
  /** Fee overrides from /admin/settings so the preview matches the charge. */
  priceCfg?: PriceConfig;
}) {
  const t = useT();
  // "2026-07-21T09:00"-style props mean an hourly (same-day) stay.
  const hourly = startDate.includes("T");
  const [transfer, setTransfer] = useState(initialTransfer && allowTransfer);
  const [transferReturn, setTransferReturn] = useState(true);
  const [transferTime, setTransferTime] = useState("09:00");
  const [ev, setEv] = useState(initialEv && !!space.evCharger);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("card");
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(hourly && !endDate.includes("T") ? `${startDate.slice(0, 10)}T17:00` : endDate);

  const day = start.slice(0, 10);
  const fromTime = hourly ? start.slice(11, 16) : "";
  const toTime = hourly ? end.slice(11, 16) : "";
  function setHourly(nextDay: string, nextFrom: string, nextTo: string) {
    setStart(`${nextDay}T${nextFrom}`);
    setEnd(`${nextDay}T${nextTo}`);
  }

  const price = useMemo(
    () =>
      priceBundle(
        space,
        { parking: true, transfer, ev, transferReturn },
        new Date(start).toISOString(),
        new Date(end).toISOString(),
        currency,
        priceCfg
      ),
    [space, transfer, ev, transferReturn, start, end, currency, priceCfg]
  );

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-5 lg:pb-0">
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
            subtitle={`${space.title} · ${space.driveMinutes} ${t(
              allowTransfer ? "app.checkout.minToTerminal" : "app.space.minAway"
            )}`}
          />
          {allowTransfer && (
            <>
              <Line
                checked={transfer}
                onChange={setTransfer}
                icon={CarTaxiFront}
                title={t("app.checkout.licensedTransfer")}
                subtitle={t("app.checkout.transferSub")}
              />
              {transfer && (
                <div className="ms-4 space-y-3 rounded-xl border border-navy-100 bg-navy-50/50 p-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="mb-1 block text-xs font-semibold text-navy-500">
                        {t("app.checkout.tripType")}
                      </span>
                      <div className="grid grid-cols-2 gap-1 rounded-xl border border-navy-200 bg-white p-1">
                        {(
                          [
                            [false, t("app.checkout.oneWay")],
                            [true, t("app.checkout.returnTrip")],
                          ] as const
                        ).map(([val, label]) => (
                          <button
                            key={label}
                            type="button"
                            aria-pressed={transferReturn === val}
                            onClick={() => setTransferReturn(val)}
                            className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                              transferReturn === val
                                ? "bg-navy-900 text-white"
                                : "text-navy-600 hover:bg-navy-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-navy-500">
                        {t("app.checkout.taxiTime")}
                      </span>
                      <input
                        type="time"
                        value={transferTime}
                        onChange={(e) => setTransferTime(e.target.value)}
                        className="h-9 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                  </div>
                  {transferReturn && (
                    <p className="text-xs text-navy-500">{t("app.checkout.returnNote")}</p>
                  )}
                </div>
              )}
            </>
          )}
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

        {hourly ? (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-navy-500">{t("search.date")}</span>
              <input
                type="date"
                value={day}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setHourly(e.target.value, fromTime, toTime)}
                className="h-11 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-navy-500">{t("search.from")}</span>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setHourly(day, e.target.value, toTime)}
                className="h-11 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-navy-500">{t("search.until")}</span>
              <input
                type="time"
                value={toTime}
                min={fromTime}
                onChange={(e) => setHourly(day, fromTime, e.target.value)}
                className="h-11 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-navy-500">{t("app.checkout.dropOff")}</span>
              <input
                type="date"
                value={start}
                min={new Date().toISOString().slice(0, 10)}
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
        )}

        <h3 className="mt-6 text-sm font-bold text-navy-900">{t("app.checkout.paymentMethod")}</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
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
            {transfer && (
              <Row
                label={`${t("app.checkout.licensedTransferRow")} · ${
                  transferReturn ? t("app.checkout.returnTrip") : t("app.checkout.oneWay")
                }`}
                value={formatMoney(price.transfer, currency)}
              />
            )}
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

          <form id="checkout-form" action={createBookingAction} className="mt-4">
            {/* Promo code (validated server-side; discount comes off the platform fee) */}
            <div className="mb-3">
              <label htmlFor="promo" className="mb-1 block text-xs font-bold text-navy-600">
                {t("book.promo.label")}
              </label>
              <input
                id="promo"
                name="promo"
                defaultValue={promoInvalid ? "" : undefined}
                placeholder={t("book.promo.ph")}
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm uppercase text-navy-900 placeholder:normal-case placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
              />
              {promoInvalid && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {t("book.promo.invalid")}
                </p>
              )}
            </div>
            <input type="hidden" name="spaceId" value={space.id} />
            <input type="hidden" name="startAt" value={new Date(start).toISOString()} />
            <input type="hidden" name="endAt" value={new Date(end).toISOString()} />
            <input type="hidden" name="transfer" value={transfer ? "1" : ""} />
            <input type="hidden" name="transferReturn" value={transfer && transferReturn ? "1" : ""} />
            <input type="hidden" name="transferTime" value={transfer ? transferTime : ""} />
            <input type="hidden" name="ev" value={ev ? "1" : ""} />
            <input type="hidden" name="method" value={method} />
            <Button type="submit" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> {t("app.checkout.pay")} {formatMoney(price.total, currency)}
            </Button>
          </form>
          <div className="mt-3 space-y-1.5 text-xs text-navy-400">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {t("app.checkout.releaseNote")}
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {t("home.hero.trust.cancel")}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky pay bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">
              {t("common.total")}
            </div>
            <div className="text-lg font-extrabold leading-tight text-navy-900">
              {formatMoney(price.total, currency)}
            </div>
          </div>
          <Button type="submit" form="checkout-form" size="lg" className="shrink-0">
            <Lock className="h-4 w-4" /> {t("app.checkout.pay")} {formatMoney(price.total, currency)}
          </Button>
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
