"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { MaskText } from "@/components/ui/Reveal";

// Mirrors the "Are you a" options on lotteindia.com/contact-us.html.
const inquiryTypes = [
  "Consumer",
  "Distributor / Retailer",
  "Vendor / Supplier",
  "Institutional Buyer",
  "Importer / Exporter",
  "Contract Manufacturer",
  "Others",
] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: (typeof inquiryTypes)[number] | "";
  city: string;
  message: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  type: "",
  city: "",
  message: "",
  consent: false,
};

export function validateInquiry(v: FormState): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (v.phone && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!v.type) e.type = "Tell us who you are so we can route your enquiry.";
  if (v.type === "Distributor / Retailer" && v.city.trim().length < 2) e.city = "Tell us the city or region you serve.";
  if (v.message.trim().length < 20) e.message = "Please share a little more (at least 20 characters).";
  if (!v.consent) e.consent = "Please agree so we can contact you.";
  return e;
}

export function ContactInquiry() {
  const uid = useId();
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  // The submit button unmounts when the success panel replaces the form, so focus would fall
  // to <body>. Move it to the confirmation heading, and back to the first field on "Send another".
  const returningToForm = useRef(false);
  const focusOnMount = useCallback((el: HTMLElement | null) => el?.focus({ preventScroll: true }), []);
  const focusFirstField = useCallback((el: HTMLFormElement | null) => {
    if (el && returningToForm.current) {
      returningToForm.current = false;
      el.querySelector<HTMLInputElement>("input")?.focus();
    }
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors(validateInquiry(next));
  };
  const blur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateInquiry(values));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateInquiry(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(initial).map((k) => [k, true])));
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`${uid}-${firstInvalid}`)?.focus();
      return;
    }
    setStatus("sending");
    // TODO: POST to the Lotte India CRM / inquiry endpoint.
    await new Promise((r) => setTimeout(r, 900));
    setStatus("sent");
  };

  const field = (key: keyof FormState) => ({
    id: `${uid}-${key}`,
    "aria-invalid": Boolean(touched[key] && errors[key]) || undefined,
    "aria-describedby": touched[key] && errors[key] ? `${uid}-${key}-error` : undefined,
    onBlur: () => blur(key),
  });

  const FieldError = ({ k }: { k: keyof FormState }) =>
    touched[k] && errors[k] ? (
      <p id={`${uid}-${k}-error`} className="mt-1.5 text-xs font-medium text-crimson">
        {errors[k]}
      </p>
    ) : null;

  const Label = ({ k, children, optional }: { k: keyof FormState; children: string; optional?: boolean }) => (
    <label htmlFor={`${uid}-${k}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
      {children} {optional && <span className="font-normal normal-case tracking-normal text-ink-muted">(optional)</span>}
    </label>
  );

  return (
    <section id="inquiry" aria-labelledby="inquiry-title" className="py-24 md:py-32">
      <div className="container grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Partner with us</p>
          <h2 id="inquiry-title" className="mt-4 text-display-md font-light text-balance">
            <MaskText>Corporate &amp; <em className="italic text-lotte">distributor</em> inquiries.</MaskText>
          </h2>
          <p className="mt-6 max-w-md text-ink-soft">
            Whether you want to carry our brands in your region, order for an occasion or reach our investor relations
            team, drop in your details and we will get in touch with you shortly.
          </p>
          <dl className="mt-10 space-y-5 border-t hairline pt-8 text-sm">
            <div>
              <dt className="eyebrow !text-ink-muted">Network</dt>
              <dd className="mt-1 text-ink-soft">
                <span className="tabular-nums">2,000+</span> distributors nationwide
              </dd>
            </div>
            <div>
              <dt className="eyebrow !text-ink-muted">Headquarters</dt>
              <dd className="mt-1 text-ink-soft">Chennai, Tamil Nadu</dd>
            </div>
          </dl>
        </div>

        <div className="relative rounded-[2rem] bg-alabaster p-6 shadow-card ring-1 ring-noir/5 sm:p-10 lg:col-span-7">
          <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[420px] flex-col items-center justify-center text-center"
                role="status"
              >
                <CheckCircle2 className="h-14 w-14 text-lotte" aria-hidden="true" />
                <h3 ref={focusOnMount} tabIndex={-1} className="mt-6 text-3xl outline-none">
                  Thank you, {values.name.split(" ")[0]}.
                </h3>
                <p className="mt-3 max-w-sm text-ink-soft">
                  In this concept preview nothing was sent — the form isn&apos;t connected yet.
                </p>
                <button
                  type="button"
                  className="btn-ghost mt-8"
                  onClick={() => {
                    returningToForm.current = true;
                    setValues(initial);
                    setTouched({});
                    setErrors({});
                    setStatus("idle");
                  }}
                >
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                ref={focusFirstField}
                key="form"
                noValidate
                onSubmit={onSubmit}
                exit={{ opacity: 0 }}
                className="grid gap-5 sm:grid-cols-2"
                aria-describedby={`${uid}-required`}
              >
                <p id={`${uid}-required`} className="sr-only">
                  Fields are required unless marked optional.
                </p>
                <div>
                  <Label k="name">Full name</Label>
                  <input {...field("name")} className="field" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
                  <FieldError k="name" />
                </div>
                <div>
                  <Label k="email">Email</Label>
                  <input {...field("email")} type="email" className="field" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
                  <FieldError k="email" />
                </div>
                <div>
                  <Label k="phone" optional>
                    Mobile
                  </Label>
                  <input {...field("phone")} type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="+91" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
                  <FieldError k="phone" />
                </div>
                <div>
                  <Label k="company" optional>
                    Company
                  </Label>
                  <input {...field("company")} className="field" autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} />
                </div>
                <div>
                  <Label k="type">I am a</Label>
                  <select
                    {...field("type")}
                    className={cn("field appearance-none", !values.type && "text-ink-muted")}
                    value={values.type}
                    onChange={(e) => set("type", e.target.value as FormState["type"])}
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <FieldError k="type" />
                </div>
                <div>
                  <Label k="city" optional={values.type !== "Distributor / Retailer"}>
                    City / region
                  </Label>
                  <input {...field("city")} className="field" autoComplete="address-level2" value={values.city} onChange={(e) => set("city", e.target.value)} />
                  <FieldError k="city" />
                </div>
                <div className="sm:col-span-2">
                  <Label k="message">Message</Label>
                  <textarea {...field("message")} rows={5} className="field resize-y" value={values.message} onChange={(e) => set("message", e.target.value)} />
                  <FieldError k="message" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-consent`} className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
                    <input
                      {...field("consent")}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-noir/30 accent-lotte"
                      checked={values.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                    />
                    I agree that Lotte India may contact me about this inquiry.
                  </label>
                  <FieldError k="consent" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "sending"}>
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                      </>
                    ) : (
                      <>
                        Submit inquiry <Send className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  {/* TODO: Remove once the form posts to Lotte India's real enquiry endpoint. */}
                  <p className="mt-3 text-xs text-ink-muted">
                    Concept preview: this form isn&apos;t connected yet and doesn&apos;t send your details anywhere. For real enquiries, use{" "}
                    <a href="https://www.lotteindia.com/contact-us.html" className="font-semibold underline underline-offset-2">
                      lotteindia.com
                    </a>
                    .
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
