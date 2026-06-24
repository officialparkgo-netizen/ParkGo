"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { sendContact, type ContactState } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function ContactForm() {
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
        <h3 className="mt-4 text-lg font-bold text-navy-900">Message sent</h3>
        <p className="mt-1.5 text-sm text-navy-600">
          Thanks for getting in touch — we&apos;ll reply to your email as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
        />
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          "Sending…"
        ) : (
          <>
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-navy-500">
        We&apos;ll only use your details to reply to this enquiry.
      </p>
    </form>
  );
}
