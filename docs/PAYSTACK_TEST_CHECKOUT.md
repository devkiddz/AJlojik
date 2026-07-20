# Paystack test checkout

AJ Logik now initializes Paystack transactions on the server, redirects customers to Paystack's hosted checkout, verifies the returned reference and amount on the server, and accepts signed `charge.success` webhooks.

## Local configuration

Copy the Paystack entries from `.env.example` into `.env.local` and replace the placeholder with a Paystack **test** secret key:

```env
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_CALLBACK_URL="http://localhost:3000/payments"
```

Only keys beginning with `sk_test_` are accepted in this implementation. Restart the Next.js development server after changing environment variables.

## Paystack dashboard configuration

- Local callback: `http://localhost:3000/payments`
- Production callback: `https://ajlojik.vercel.app/payments`
- Production test webhook: `https://ajlojik.vercel.app/api/payments/webhook`

Paystack cannot send webhooks to localhost. Use the callback verification flow locally and configure the public webhook URL on the deployed test environment.

## Supported behavior

- Live workspace: Paystack test checkout using card, bank, USSD, or bank transfer.
- Demo and Practice workspaces: internal paper-wallet checkout; no Paystack transaction is created.
- Successful payments update the payment and order, create delivery tracking, decrement managed inventory, clear the paid cart, and write commerce activity events.
- Payment verification is idempotent and rejects mismatched amount, currency, reference, or transaction status.

Do not add a live Paystack key until the test flow has been accepted and the live-payment change is intentionally implemented.
