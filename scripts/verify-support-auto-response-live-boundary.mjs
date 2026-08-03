const rawBaseUrl =
  process.env
    .SUPPORT_BASE_URL ??
  process.argv
    .find(
      argument =>
        argument.startsWith(
          '--url='
        )
    )
    ?.slice(
      '--url='.length
    ) ??
  '';

const baseUrl =
  rawBaseUrl
    .trim()
    .replace(
      /\/+$/u,
      ''
    );

if (
  !baseUrl ||
  !/^https?:\/\//u.test(
    baseUrl
  )
) {
  console.error('');
  console.error(
    'Set SUPPORT_BASE_URL or pass --url=https://your-production-domain.'
  );
  console.error('');
  process.exit(
    1
  );
}

const checks = [
  {
    label:
      'Store availability',
    path:
      '/store',
    init: {
      method:
        'GET'
    },
    expected:
      status =>
        status >=
          200 &&
        status <
          400
  },
  {
    label:
      'Guide authentication boundary',
    path:
      '/api/support/guide',
    init: {
      method:
        'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body:
        JSON.stringify({
          question:
            'Hello'
        })
    },
    expected:
      status =>
        status ===
          401 ||
        status ===
          403
  },
  {
    label:
      'Feedback authentication boundary',
    path:
      '/api/support/guide/feedback',
    init: {
      method:
        'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body:
        JSON.stringify({
          interactionId:
            'unauthenticated-smoke-test',
          helpful:
            true
        })
    },
    expected:
      status =>
        status ===
          401 ||
        status ===
          403
  },
  {
    label:
      'Support Case authentication boundary',
    path:
      '/api/support/cases',
    init: {
      method:
        'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body:
        JSON.stringify({
          category:
            'OTHER',
          priority:
            'NORMAL',
          subject:
            'Unauthenticated smoke test',
          description:
            'This request must not create a Support Case.'
        })
    },
    expected:
      status =>
        status ===
          401 ||
        status ===
          403
  },
  {
    label:
      'Knowledge Studio admin boundary',
    path:
      '/api/admin/support/knowledge',
    init: {
      method:
        'GET'
    },
    expected:
      status =>
        status ===
          401 ||
        status ===
          403
  }
];

const failures = [];

for (
  const check of
  checks
) {
  try {
    const response =
      await fetch(
        `${baseUrl}${check.path}`,
        {
          ...check.init,
          redirect:
            'follow',
          signal:
            AbortSignal.timeout(
              20_000
            )
        }
      );

    if (
      !check.expected(
        response.status
      )
    ) {
      failures.push(
        `${check.label}: expected a safe status, received ${response.status}`
      );
    } else {
      console.log(
        `PASS ${check.label} (${response.status})`
      );
    }
  } catch (
    cause
  ) {
    failures.push(
      `${check.label}: ${
        cause instanceof
          Error
          ? cause.message
          : 'request failed'
      }`
    );
  }
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'AJ Logik Support live-boundary verification failed:'
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `  - ${failure}`
    );
  }

  console.error('');
  process.exitCode =
    1;
} else {
  console.log('');
  console.log(
    'AJ Logik Support public and authentication boundaries are healthy.'
  );
  console.log(
    `Validated ${checks.length} unauthenticated production checks against ${baseUrl}.`
  );
  console.log('');
}
