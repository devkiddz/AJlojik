'use client';

import {
  useState
} from 'react';

import {
  Check,
  Clipboard,
  Expand,
  QrCode,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

import {
  QRCodeSVG
} from 'qrcode.react';

import {
  useGlobalOverlay
} from '@/features/global-overlay';

type RiderHandoverQrFrameProps = {
  accessUrl:
    string;
  expiresAt:
    string;
  trackingCode:
    string;
  orderNumber:
    string;
  dispatcherName?:
    string |
    null;
};

export function RiderHandoverQrFrame({
  accessUrl,
  expiresAt,
  trackingCode,
  orderNumber,
  dispatcherName
}: RiderHandoverQrFrameProps) {
  const [
    copied,
    setCopied
  ] =
    useState(
      false
    );

  const {
    openOverlay
  } =
    useGlobalOverlay();

  async function copyLink() {
    await navigator.clipboard.writeText(
      accessUrl
    );

    setCopied(
      true
    );

    window.setTimeout(
      () =>
        setCopied(
          false
        ),
      1800
    );
  }

  function openScanFrame() {
    openOverlay({
      id:
        `delivery-handover-qr-${trackingCode}`,
      eyebrow:
        'Rider handover',
      title:
        `Scan ${trackingCode}`,
      description:
        'The assigned rider should scan this frame once. Successful activation replaces this temporary handover credential with the rider device session.',
      variant:
        'dialog',
      size:
        'md',
      content: (
        <LargeQrFrame
          accessUrl={
            accessUrl
          }
          expiresAt={
            expiresAt
          }
          trackingCode={
            trackingCode
          }
          orderNumber={
            orderNumber
          }
          dispatcherName={
            dispatcherName
          }
        />
      )
    });
  }

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-primary/20 bg-background/90 shadow-sm">
      <div className="grid min-w-0 gap-5 p-4 sm:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] sm:p-5">
        <div className="mx-auto w-full max-w-60">
          <QrSurface
            accessUrl={
              accessUrl
            }
            trackingCode={
              trackingCode
            }
            size={
              224
            }
          />
        </div>

        <div className="min-w-0 self-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
            <QrCode className="size-3.5" />

            QR ready to scan
          </span>

          <h4 className="mt-4 text-lg font-black">
            {
              orderNumber
            }
          </h4>

          <p className="mt-1 text-xs text-muted-foreground">
            {
              dispatcherName ??
              'Assigned rider'
            }
            {' · '}
            Single-use access
          </p>

          <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <Meta
              label="Tracking code"
              value={
                trackingCode
              }
            />

            <Meta
              label="Expires"
              value={new Date(
                expiresAt
              ).toLocaleString(
                'en-NG'
              )}
            />
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
            <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />

            Rider opens the
            phone camera, scans
            the frame and accepts
            package handover.
            Manual URL entry is
            not required.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                openScanFrame
              }
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-black text-background">
              <Expand className="size-3.5" />

              Open large QR
            </button>

            <button
              type="button"
              onClick={() =>
                void copyLink()
              }
              className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black">
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Clipboard className="size-3.5" />
              )}

              {copied
                ? 'Copied'
                : 'Copy fallback link'}
            </button>
          </div>

          <p className="mt-3 break-all text-[9px] leading-4 text-muted-foreground/70">
            {
              accessUrl
            }
          </p>
        </div>
      </div>
    </section>
  );
}

function LargeQrFrame({
  accessUrl,
  expiresAt,
  trackingCode,
  orderNumber,
  dispatcherName
}: RiderHandoverQrFrameProps) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto w-full max-w-[24rem]">
        <QrSurface
          accessUrl={
            accessUrl
          }
          trackingCode={
            trackingCode
          }
          size={
            360
          }
        />
      </div>

      <div className="mt-5 rounded-3xl border border-border/60 bg-muted/25 p-4">
        <p className="text-lg font-black">
          {
            orderNumber
          }
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {
            dispatcherName ??
            'Assigned rider'
          }
          {' · '}
          {
            trackingCode
          }
        </p>

        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-700 dark:text-amber-300">
          <ShieldCheck className="size-3.5" />

          Expires{' '}
          {new Date(
            expiresAt
          ).toLocaleString(
            'en-NG'
          )}
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Scan once with the
        rider&apos;s phone
        camera. The temporary QR
        becomes invalid
        immediately after
        successful activation.
      </p>
    </div>
  );
}

function QrSurface({
  accessUrl,
  trackingCode,
  size
}: {
  accessUrl:
    string;
  trackingCode:
    string;
  size:
    number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <span className="pointer-events-none absolute left-1 top-1 size-8 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
      <span className="pointer-events-none absolute right-1 top-1 size-8 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
      <span className="pointer-events-none absolute bottom-1 left-1 size-8 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
      <span className="pointer-events-none absolute bottom-1 right-1 size-8 rounded-br-2xl border-b-4 border-r-4 border-primary" />

      <QRCodeSVG
        value={
          accessUrl
        }
        size={
          size
        }
        level="H"
        marginSize={
          4
        }
        bgColor="#ffffff"
        fgColor="#050505"
        title={`Rider access for ${trackingCode}`}
        className="h-auto w-full"
      />
    </div>
  );
}

function Meta({
  label,
  value
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
      <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 break-words font-bold">
        {value}
      </dd>
    </div>
  );
}
