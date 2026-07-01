"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { sendContact, type ContactState } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { useT } from "@/lib/i18n/client";

export function ContactForm() {
  const t = useT();
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContact,
    {}
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-go-200 bg-go-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-go-100 text-go-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-navy-900">{t("contact.form.successTitle")}</h3>
        <p className="mt-1.5 text-sm text-navy-600">
          {t("contact.form.successBody")}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="contact-name">{t("contact.form.name")}</Label>
        <Input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          placeholder={t("contact.form.namePh")}
        />
      </div>
      <div>
        <Label htmlFor="contact-email">{t("contact.form.email")}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("contact.form.emailPh")}
        />
      </div>
      <div>
        <Label htmlFor="contact-message">{t("contact.form.message")}</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder={t("contact.form.messagePh")}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          t("contact.form.sending")
        ) : (
          <>
            {t("contact.form.submit")} <Send className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-navy-500">
        {t("contact.form.disclaimer")}
      </p>
    </form>
  );
}
