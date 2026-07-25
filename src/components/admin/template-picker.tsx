"use client";

import { useState } from "react";

interface Template {
  id: string;
  label: string;
  text: string;
}

/** Saved-reply picker: choosing a template fills the message box (editable). */
export function TemplatePicker({
  templates,
  placeholder,
}: {
  templates: Template[];
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-2">
      <select
        aria-label={templates[0]?.label ?? "template"}
        defaultValue=""
        onChange={(e) => {
          const tpl = templates.find((x) => x.id === e.target.value);
          if (tpl) setValue(tpl.text);
        }}
        className="w-full rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-xs text-navy-700 focus:border-brand-400 focus:outline-none"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {templates.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.label}
          </option>
        ))}
      </select>
      <textarea
        name="message"
        required
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-xs text-navy-700 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
      />
    </div>
  );
}
