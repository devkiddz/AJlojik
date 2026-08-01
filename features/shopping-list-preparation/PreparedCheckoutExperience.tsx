'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck
} from 'lucide-react';

import type {
  PreparationView
} from './preparationContracts';

const currency =
  new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
    }
  );

const deliveryOptions = [
  {
    id:
      'AJ_DELIVERY',
    title:
      'AJ Delivery',
    description:
      'AJ-managed delivery with live progress updates.',
    fee:
      2_500,
    icon:
      Truck
  },
  {
    id:
      'PERSONAL_COURIER',
    title:
      'My Courier',
    description:
      'Your courier receives the controlled handover and tracking flow.',
    fee:
      0,
    icon:
      PackageCheck
  },
  {
    id:
      'STORE_PICKUP',
    title:
      'Store pickup',
    description:
      'Collect after the prepared order is marked ready.',
    fee:
      0,
    icon:
      Store
  }
] as const;

type DeliveryMethod =
  (typeof deliveryOptions)[number]['id'];

async function readJson<T>(
  response: Response
): Promise<T> {
  const payload =
    (await response.json()) as
      T & {
        error?: string;
      };

  if (!response.ok) {
    throw new Error(
      payload.error ??
      'The request could not be completed.'
    );
  }

  return payload;
}

export function PreparedCheckoutExperience({
  requestId
}: {
  requestId: string;
}) {
  const [
    preparation,
    setPreparation
  ] =
    useState<
      PreparationView | null
    >(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    submitting,
    setSubmitting
  ] =
    useState(
      false
    );

  const [
    error,
    setError
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    success,
    setSuccess
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    deliveryMethod,
    setDeliveryMethod
  ] =
    useState<
      DeliveryMethod
    >(
      'AJ_DELIVERY'
    );

  const [
    recipientName,
    setRecipientName
  ] =
    useState(
      ''
    );

  const [
    phone,
    setPhone
  ] =
    useState(
      ''
    );

  const [
    addressLine1,
    setAddressLine1
  ] =
    useState(
      ''
    );

  const [
    addressLine2,
    setAddressLine2
  ] =
    useState(
      ''
    );

  const [
    city,
    setCity
  ] =
    useState(
      ''
    );

  const [
    state,
    setState
  ] =
    useState(
      ''
    );

  const [
    notes,
    setNotes
  ] =
    useState(
      ''
    );

  const [
    saveAddress,
    setSaveAddress
  ] =
    useState(
      true
    );

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        try {
          const response =
            await fetch(
              `/api/shopping-list-preparations/${encodeURIComponent(
                requestId
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          const data =
            await readJson<{
              preparation:
                PreparationView;
            }>(
              response
            );

          setPreparation(
            data.preparation
          );

          setError(
            null
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Unable to load the prepared quote.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        requestId
      ]
    );

  useEffect(
    () => {
      void load();
    },
    [
      load
    ]
  );

  const selectedDelivery =
    deliveryOptions.find(
      option =>
        option.id ===
        deliveryMethod
    ) ??
    deliveryOptions[0];

  const approvedSubtotal =
    preparation
      ?.approvedTotal ??
    preparation
      ?.quotedSubtotal ??
    0;

  const total =
    approvedSubtotal +
    selectedDelivery.fee;

  const includedItems =
    useMemo(
      () =>
        preparation?.items.filter(
          item =>
            item.status !==
              'UNAVAILABLE' &&
            item.status !==
              'REMOVED' &&
            item.customerDecision !==
              'REJECTED' &&
            item.preparedQuantity >
              0
        ) ??
        [],
      [
        preparation
      ]
    );

  async function checkout() {
    if (
      !preparation ||
      submitting
    ) {
      return;
    }

    setSubmitting(
      true
    );

    setError(
      null
    );

    setSuccess(
      null
    );

    try {
      const response =
        await fetch(
          '/api/payments/prepared-checkout',
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                requestId:
                  preparation.id,
                deliveryMethod,
                recipientName,
                phone,
                addressLine1,
                addressLine2,
                city,
                state,
                notes,
                saveAddress
              })
          }
        );

      const data =
        await readJson<{
          authorizationUrl?:
            string;
          orderNumber:
            string;
          paper:
            boolean;
        }>(
          response
        );

      if (
        data.authorizationUrl
      ) {
        window.location.assign(
          data.authorizationUrl
        );

        return;
      }

      setSuccess(
        `Payment completed. Order ${data.orderNumber} is now in fulfilment.`
      );

      await load();
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Prepared checkout could not be completed.'
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-[75vh] place-items-center px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-7 animate-spin text-primary" />
          <p className="mt-3 text-xs font-black text-muted-foreground">
            Loading your approved quote…
          </p>
        </div>
      </main>
    );
  }

  if (
    !preparation
  ) {
    return (
      <main className="grid min-h-[75vh] place-items-center px-4 py-12">
        <section className="max-w-lg rounded-[2rem] border bg-card p-8 text-center shadow-xl">
          <LockKeyhole className="mx-auto size-9 text-muted-foreground" />
          <h1 className="mt-5 text-2xl font-black">
            Prepared quote unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {error ??
              'This quote may have expired, been cancelled or already converted.'}
          </p>
          <Link
            href="/account/lists"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-black text-background">
            Open Shopping Lists
            <ChevronRight className="size-4" />
          </Link>
        </section>
      </main>
    );
  }

  const canCheckout =
    preparation.status ===
      'READY_FOR_CHECKOUT' &&
    preparation.customerDecision ===
      'APPROVED';

  return (
    <main className="min-h-[75vh] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[90rem]">
        <Link
          href={`/account/lists/${encodeURIComponent(
            preparation.shoppingListId
          )}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to prepared list
        </Link>

        <header className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.2),transparent_36%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))] p-6 shadow-xl sm:p-9">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-primary">
                <ShieldCheck className="size-3.5" />
                Approved quote v{preparation.quoteVersion}
              </span>

              <h1 className="mt-5 text-4xl font-black tracking-[-.04em] sm:text-6xl">
                Complete your prepared order.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Your accepted products, quantities and prices are now the
                server-authoritative source for this checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-muted-foreground">
                Preparation
              </p>
              <p className="mt-1 text-lg font-black">
                {preparation.shoppingListName}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {preparation.workspaceName} · {preparation.workspaceMode}
              </p>
            </div>
          </div>
        </header>

        {success ? (
          <Notice
            icon={
              <CheckCircle2 className="size-5" />
            }
            tone="success"
            text={success}
          />
        ) : null}

        {error ? (
          <Notice
            icon={
              <ShieldCheck className="size-5" />
            }
            tone="error"
            text={error}
          />
        ) : null}

        {!canCheckout ? (
          <Notice
            icon={
              <LockKeyhole className="size-5" />
            }
            tone="info"
            text={
              preparation.status ===
              'ORDER_CREATED'
                ? `This prepared quote has already created ${preparation.orderNumber ?? 'an order'}.`
                : 'This quote is not currently ready for checkout.'
            }
          />
        ) : null}

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="space-y-6">
            <CheckoutSection
              number="01"
              title="Approved preparation"
              description="Only customer-approved and available items are included.">
              <div className="space-y-3">
                {includedItems.map(
                  item => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black">
                          {item.resolvedProduct?.name ??
                            item.productName}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {item.resolvedVariantLabel ??
                            item.originalVariantLabel}{' '}
                          · {item.preparedQuantity} ×{' '}
                          {currency.format(
                            item.quotedUnitPrice
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-black">
                        {currency.format(
                          item.quotedLineTotal
                        )}
                      </p>
                    </article>
                  )
                )}
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="02"
              title="Choose fulfilment"
              description="This creates the connected Delivery record immediately.">
              <div className="grid gap-3 md:grid-cols-3">
                {deliveryOptions.map(
                  option => {
                    const Icon =
                      option.icon;

                    const selected =
                      deliveryMethod ===
                      option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!canCheckout}
                        onClick={() =>
                          setDeliveryMethod(
                            option.id
                          )
                        }
                        className={
                          selected
                            ? 'rounded-2xl border border-primary bg-primary/8 p-4 text-left ring-2 ring-primary/10 disabled:opacity-50'
                            : 'rounded-2xl border border-border/60 bg-background/50 p-4 text-left transition hover:border-primary/30 disabled:opacity-50'
                        }>
                        <span
                          className={
                            selected
                              ? 'grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground'
                              : 'grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground'
                          }>
                          <Icon className="size-5" />
                        </span>

                        <span className="mt-4 block text-sm font-black">
                          {option.title}
                        </span>

                        <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                          {option.description}
                        </span>

                        <span className="mt-3 block text-xs font-black">
                          {option.fee
                            ? currency.format(
                                option.fee
                              )
                            : 'No delivery fee'}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="03"
              title={
                deliveryMethod ===
                'STORE_PICKUP'
                  ? 'Pickup contact'
                  : 'Delivery details'
              }
              description="Used for fulfilment, handover and delivery tracking.">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Recipient name"
                  value={recipientName}
                  onChange={setRecipientName}
                  autoComplete="name"
                />

                <Field
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  autoComplete="tel"
                />

                {deliveryMethod !==
                'STORE_PICKUP' ? (
                  <>
                    <Field
                      label="Address"
                      value={addressLine1}
                      onChange={setAddressLine1}
                      autoComplete="street-address"
                      className="sm:col-span-2"
                    />

                    <Field
                      label="Address line 2 (optional)"
                      value={addressLine2}
                      onChange={setAddressLine2}
                      className="sm:col-span-2"
                    />

                    <Field
                      label="City"
                      value={city}
                      onChange={setCity}
                      autoComplete="address-level2"
                    />

                    <Field
                      label="State"
                      value={state}
                      onChange={setState}
                      autoComplete="address-level1"
                    />
                  </>
                ) : null}

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold">
                    Order note (optional)
                  </span>

                  <textarea
                    value={notes}
                    onChange={
                      event =>
                        setNotes(
                          event.target
                            .value
                        )
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              {deliveryMethod !==
              'STORE_PICKUP' ? (
                <label className="mt-4 flex cursor-pointer items-center gap-3 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={
                      event =>
                        setSaveAddress(
                          event.target
                            .checked
                        )
                    }
                    className="size-4 accent-primary"
                  />
                  Save these delivery details to my account
                </label>
              ) : null}
            </CheckoutSection>

            <CheckoutSection
              number="04"
              title="Payment authority"
              description={
                preparation.workspaceMode ===
                'LIVE'
                  ? 'Paystack hosts the sensitive payment fields. The approved quote remains the order-price authority.'
                  : 'This workspace uses safe paper money and never publishes a live transaction.'
              }>
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                  {preparation.workspaceMode ===
                  'LIVE' ? (
                    <CreditCard className="size-6" />
                  ) : (
                    <Banknote className="size-6" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">
                    {preparation.workspaceMode ===
                    'LIVE'
                      ? 'Pay securely with Paystack'
                      : `${preparation.workspaceMode} paper wallet`}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The Order and Delivery records are created together from
                    this approved preparation.
                  </p>
                </div>

                <BadgeCheck className="size-5 shrink-0 text-emerald-600" />
              </div>
            </CheckoutSection>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">
                Prepared order summary
              </p>

              <div className="mt-4 space-y-3 border-b border-border/60 pb-4">
                {includedItems.map(
                  item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {item.preparedQuantity} ×{' '}
                        {item.resolvedProduct?.name ??
                          item.productName}
                      </span>

                      <span className="shrink-0 font-bold">
                        {currency.format(
                          item.quotedLineTotal
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow
                  label="Approved products"
                  value={currency.format(
                    approvedSubtotal
                  )}
                />

                <SummaryRow
                  label={selectedDelivery.title}
                  value={
                    selectedDelivery.fee
                      ? currency.format(
                          selectedDelivery.fee
                        )
                      : 'Free'
                  }
                />
              </div>

              <div className="my-5 border-t border-border/60" />

              <div className="flex items-end justify-between">
                <span className="font-black">
                  Total
                </span>
                <span className="text-2xl font-black">
                  {currency.format(
                    total
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  void checkout()
                }
                disabled={
                  !canCheckout ||
                  submitting ||
                  !includedItems.length
                }
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-black text-background disabled:opacity-50">
                {submitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                Complete secure checkout
              </button>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-[9px] leading-4 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                The chosen fulfilment method controls QR handover and tracking
                behavior in the connected Delivery sequence.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CheckoutSection({
  number,
  title,
  description,
  children
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-[10px] font-black text-primary">
          {number}
        </span>

        <div>
          <h2 className="text-lg font-black">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  className = '',
  autoComplete
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  className?: string;
  autoComplete?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-bold">
        {label}
      </span>

      <input
        value={value}
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}

function SummaryRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">
        {label}
      </span>
      <span className="font-black">
        {value}
      </span>
    </div>
  );
}

function Notice({
  icon,
  tone,
  text
}: {
  icon: React.ReactNode;
  tone:
    | 'success'
    | 'error'
    | 'info';
  text: string;
}) {
  const toneClass = {
    success:
      'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
    error:
      'border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300',
    info:
      'border-primary/20 bg-primary/5 text-primary'
  }[tone];

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs ${toneClass}`}>
      {icon}
      <span className="leading-5">
        {text}
      </span>
    </div>
  );
}
