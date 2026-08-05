import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const conflictingDirectory =
  'app/(store)/products/[slug]';

const canonicalDirectory =
  'app/(store)/products/[id]';

const failures = [];

function exists(relativePath) {
  return fs.existsSync(
    path.join(
      root,
      relativePath
    )
  );
}

function read(relativePath) {
  const absolutePath =
    path.join(
      root,
      relativePath
    );

  if (!fs.existsSync(absolutePath)) {
    failures.push(
      `Missing ${relativePath}`
    );

    return '';
  }

  return fs.readFileSync(
    absolutePath,
    'utf8'
  );
}

if (exists(conflictingDirectory)) {
  failures.push(
    `${conflictingDirectory} must not coexist with ${canonicalDirectory}.`
  );
}

const page =
  read(
    `${canonicalDirectory}/page.tsx`
  );

read(
  `${canonicalDirectory}/loading.tsx`
);

read(
  `${canonicalDirectory}/not-found.tsx`
);

if (
  page &&
  (
    !page.includes(
      `params: Promise<{\n    id: string;\n  }>;`
    ) ||
    !page.includes(
      'id: slug'
    ) ||
    !page.includes(
      'getProductPage'
    ) ||
    !page.includes(
      'application/ld+json'
    )
  )
) {
  failures.push(
    'The canonical [id] route does not contain the Product Page Experience implementation.'
  );
}

const mainValidator =
  read(
    'scripts/validate-aj-product-page-experience.mjs'
  );

if (
  mainValidator &&
  (
    mainValidator.includes(
      'app/(store)/products/[slug]/'
    ) ||
    !mainValidator.includes(
      'app/(store)/products/[id]/page.tsx'
    )
  )
) {
  failures.push(
    'The main Product Page validator still targets [slug].'
  );
}

if (failures.length > 0) {
  console.error(
    '\nAJ Product Page route collision validation failed:\n'
  );

  for (const failure of failures) {
    console.error(
      `- ${failure}`
    );
  }

  process.exit(1);
}

console.log(
  'AJ Product Page route collision hotfix validation passed.'
);
