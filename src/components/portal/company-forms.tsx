"use client";

import { useActionState } from "react";
import { Building2, UserMinus, UserPlus } from "lucide-react";
import type { Organisation, User } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  addCompanyMemberAction,
  createCompanyAction,
  removeCompanyMemberAction,
  updateCompanyAction,
  type CompanyState,
} from "@/lib/company-actions";
import { useT } from "@/lib/i18n/client";

/** Create the account, or edit it if it already exists. One form, two actions. */
export function CompanyDetails({ org, isOwner }: { org?: Organisation; isOwner: boolean }) {
  const t = useT();
  const [state, action, pending] = useActionState<CompanyState, FormData>(
    org ? updateCompanyAction : createCompanyAction,
    {}
  );
  // A member sees the details but cannot touch them — the owner is the one
  // being invoiced.
  const readOnly = !!org && !isOwner;

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
        <Building2 className="h-5 w-5 text-navy-500" /> {t("guest.org.title")}
      </h2>
      <p className="mb-4 mt-0.5 text-sm text-navy-500">
        {readOnly ? t("guest.org.member") : t("guest.org.sub")}
      </p>

      <form action={action} className="space-y-3">
        <div>
          <Label htmlFor="name">{t("guest.org.name")}</Label>
          <Input id="name" name="name" required defaultValue={org?.name ?? ""} disabled={readOnly} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="billingEmail">{t("guest.org.billing")}</Label>
            <Input
              id="billingEmail"
              name="billingEmail"
              type="email"
              required
              defaultValue={org?.billingEmail ?? ""}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="vatNumber">{t("guest.org.vat")}</Label>
            <Input
              id="vatNumber"
              name="vatNumber"
              placeholder="GB123456789"
              defaultValue={org?.vatNumber ?? ""}
              disabled={readOnly}
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            name="monthlyInvoice"
            value="1"
            defaultChecked={!!org?.monthlyInvoice}
            disabled={readOnly}
            className="mt-0.5 h-4 w-4 rounded border-navy-300 text-go-600 focus:ring-go-400"
          />
          <span>{t("guest.org.monthly")}</span>
        </label>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {state.error}
          </p>
        )}
        {!readOnly && (
          <Button type="submit" size="sm" disabled={pending}>
            {org ? t("account.profile.save") : t("guest.org.create")}
          </Button>
        )}
      </form>
    </Card>
  );
}

export function CompanyMembers({
  members,
  ownerId,
  isOwner,
}: {
  members: User[];
  ownerId: string;
  isOwner: boolean;
}) {
  const t = useT();
  const [addState, addAction, adding] = useActionState<CompanyState, FormData>(
    addCompanyMemberAction,
    {}
  );
  const [, removeAction, removing] = useActionState<CompanyState, FormData>(
    removeCompanyMemberAction,
    {}
  );

  const addError =
    addState.error === "no-account"
      ? t("guest.org.noAccount")
      : addState.error === "already-elsewhere"
        ? t("guest.org.elsewhere")
        : addState.error;

  return (
    <Card className="p-5" data-company-members>
      <h2 className="font-bold text-navy-900">{t("guest.org.members")}</h2>
      <ul className="mt-3 divide-y divide-navy-100">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-900">{m.name}</p>
              <p className="truncate text-xs text-navy-500">{m.email}</p>
            </div>
            {m.id === ownerId ? (
              <span className="shrink-0 rounded bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700">
                {t("guest.org.owner")}
              </span>
            ) : (
              isOwner && (
                <form action={removeAction}>
                  <input type="hidden" name="userId" value={m.id} />
                  <Button type="submit" variant="ghost" size="sm" disabled={removing}>
                    <UserMinus className="h-4 w-4" /> {t("guest.org.remove")}
                  </Button>
                </form>
              )
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form action={addAction} className="mt-4 space-y-2">
          <Label htmlFor="member-email">{t("guest.org.invite")}</Label>
          <div className="flex gap-2">
            <Input
              id="member-email"
              name="email"
              type="email"
              required
              placeholder="colleague@company.com"
            />
            <Button type="submit" variant="outline" size="sm" disabled={adding} className="shrink-0">
              <UserPlus className="h-4 w-4" /> {t("guest.org.add")}
            </Button>
          </div>
          {addError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {addError}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
