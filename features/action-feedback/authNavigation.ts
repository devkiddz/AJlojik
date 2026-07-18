const DEFAULT_ACCOUNT_RETURN_TO = '/account';
const DEFAULT_STORE_RETURN_TO = '/store';

export const AUTH_RETURN_TO_PARAM = 'returnTo';

export function sanitizeInternalReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_ACCOUNT_RETURN_TO
): string {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim();

  if (
    !normalizedValue.startsWith('/') ||
    normalizedValue.startsWith('//')
  ) {
    return fallback;
  }

  return normalizedValue;
}

export function getCurrentReturnTo(
  fallback = DEFAULT_STORE_RETURN_TO
): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return sanitizeInternalReturnTo(
    `${window.location.pathname}${window.location.search}`,
    fallback
  );
}

export function buildAuthHref(
  route: '/sign-in' | '/sign-up',
  returnTo: string
): string {
  const safeReturnTo = sanitizeInternalReturnTo(
    returnTo,
    DEFAULT_STORE_RETURN_TO
  );

  const params = new URLSearchParams({
    [AUTH_RETURN_TO_PARAM]: safeReturnTo
  });

  return `${route}?${params.toString()}`;
}

export function readAuthReturnTo(
  fallback = DEFAULT_ACCOUNT_RETURN_TO
): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const params = new URLSearchParams(
    window.location.search
  );

  return sanitizeInternalReturnTo(
    params.get(AUTH_RETURN_TO_PARAM),
    fallback
  );
}