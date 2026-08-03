import type {
  SupportKnowledgeEntrySnapshot
} from '../supportKnowledgeTypes';

import {
  normalizeSupportKnowledgeText
} from './supportKnowledgeText';

const STOP_WORDS =
  new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'but',
    'by',
    'can',
    'could',
    'do',
    'does',
    'for',
    'from',
    'how',
    'i',
    'in',
    'is',
    'it',
    'me',
    'my',
    'of',
    'on',
    'or',
    'please',
    'the',
    'this',
    'to',
    'was',
    'what',
    'when',
    'where',
    'which',
    'why',
    'with',
    'you'
  ]);

export type SupportKnowledgeMatchEvidence = {
  exactQuestion: boolean;
  phraseSimilarity: number;
  keywordCoverage: number;
  synonymCoverage: number;
  metadataCoverage: number;
};

export type SupportKnowledgeMatch = {
  entry: SupportKnowledgeEntrySnapshot;
  score: number;
  threshold: number;
  evidence: SupportKnowledgeMatchEvidence;
};

export type SupportKnowledgeMatchResolution = {
  best: SupportKnowledgeMatch | null;
  runnerUp: SupportKnowledgeMatch | null;
  ambiguous: boolean;
};

function lightStem(
  token: string
): string {
  if (
    token.length > 6 &&
    token.endsWith('ing')
  ) {
    return token.slice(
      0,
      -3
    );
  }

  if (
    token.length > 5 &&
    token.endsWith('ed')
  ) {
    return token.slice(
      0,
      -2
    );
  }

  if (
    token.length > 5 &&
    token.endsWith('es')
  ) {
    return token.slice(
      0,
      -2
    );
  }

  if (
    token.length > 4 &&
    token.endsWith('s')
  ) {
    return token.slice(
      0,
      -1
    );
  }

  return token;
}

function tokens(
  value: string
): string[] {
  const normalized =
    normalizeSupportKnowledgeText(
      value
    );

  if (!normalized) {
    return [];
  }

  const all =
    normalized
      .split(' ')
      .map(lightStem)
      .filter(Boolean);

  const meaningful =
    all.filter(
      token =>
        !STOP_WORDS.has(
          token
        )
    );

  return meaningful.length
    ? meaningful
    : all;
}

function tokenEquivalent(
  first: string,
  second: string
): boolean {
  if (
    first ===
    second
  ) {
    return true;
  }

  if (
    first.length < 4 ||
    second.length < 4
  ) {
    return false;
  }

  const shortest =
    Math.min(
      first.length,
      second.length
    );

  return (
    Math.abs(
      first.length -
        second.length
    ) <= 3 &&
    first.slice(
      0,
      shortest
    ) ===
      second.slice(
        0,
        shortest
      )
  );
}

function intersectionCount(
  first: readonly string[],
  second: readonly string[]
): number {
  const used =
    new Set<number>();

  let count =
    0;

  for (
    const firstToken of
    first
  ) {
    const index =
      second.findIndex(
        (
          secondToken,
          secondIndex
        ) =>
          !used.has(
            secondIndex
          ) &&
          tokenEquivalent(
            firstToken,
            secondToken
          )
      );

    if (
      index >=
      0
    ) {
      used.add(
        index
      );

      count +=
        1;
    }
  }

  return count;
}

function diceSimilarity(
  first: readonly string[],
  second: readonly string[]
): number {
  if (
    !first.length ||
    !second.length
  ) {
    return 0;
  }

  const intersection =
    intersectionCount(
      first,
      second
    );

  return (
    (2 * intersection) /
    (
      first.length +
      second.length
    )
  );
}

function trigrams(
  value: string
): string[] {
  const normalized =
    normalizeSupportKnowledgeText(
      value
    ).replace(
      /\s+/g,
      ' '
    );

  if (
    normalized.length <
    3
  ) {
    return normalized
      ? [normalized]
      : [];
  }

  const result:
    string[] = [];

  for (
    let index = 0;
    index <=
      normalized.length -
        3;
    index += 1
  ) {
    result.push(
      normalized.slice(
        index,
        index + 3
      )
    );
  }

  return result;
}

function phraseSimilarity(
  question: string,
  candidate: string
): {
  exact: boolean;
  score: number;
} {
  const normalizedQuestion =
    normalizeSupportKnowledgeText(
      question
    );

  const normalizedCandidate =
    normalizeSupportKnowledgeText(
      candidate
    );

  if (
    !normalizedQuestion ||
    !normalizedCandidate
  ) {
    return {
      exact:
        false,
      score:
        0
    };
  }

  if (
    normalizedQuestion ===
    normalizedCandidate
  ) {
    return {
      exact:
        true,
      score:
        1
    };
  }

  const questionTokens =
    tokens(
      normalizedQuestion
    );

  const candidateTokens =
    tokens(
      normalizedCandidate
    );

  const tokenScore =
    diceSimilarity(
      questionTokens,
      candidateTokens
    );

  const trigramScore =
    diceSimilarity(
      trigrams(
        normalizedQuestion
      ),
      trigrams(
        normalizedCandidate
      )
    );

  const shorter =
    normalizedQuestion.length <=
    normalizedCandidate.length
      ? normalizedQuestion
      : normalizedCandidate;

  const longer =
    normalizedQuestion.length >
    normalizedCandidate.length
      ? normalizedQuestion
      : normalizedCandidate;

  const containmentScore =
    shorter.length >=
      6 &&
    longer.includes(
      shorter
    )
      ? Math.min(
          0.96,
          0.84 +
            (
              shorter.length /
              longer.length
            ) *
              0.12
        )
      : 0;

  return {
    exact:
      false,
    score:
      Math.max(
        tokenScore,
        trigramScore *
          0.9,
        containmentScore
      )
  };
}

function termCoverage(
  question: string,
  terms: readonly string[]
): number {
  if (!terms.length) {
    return 0;
  }

  const normalizedQuestion =
    normalizeSupportKnowledgeText(
      question
    );

  const questionTokens =
    tokens(
      normalizedQuestion
    );

  if (
    !normalizedQuestion ||
    !questionTokens.length
  ) {
    return 0;
  }

  let matchedQueryTokens =
    0;

  for (
    const questionToken of
    questionTokens
  ) {
    const matched =
      terms.some(
        term => {
          const normalizedTerm =
            normalizeSupportKnowledgeText(
              term
            );

          if (
            !normalizedTerm
          ) {
            return false;
          }

          if (
            normalizedQuestion.includes(
              normalizedTerm
            )
          ) {
            return true;
          }

          return tokens(
            normalizedTerm
          ).some(
            termToken =>
              tokenEquivalent(
                questionToken,
                termToken
              )
          );
        }
      );

    if (matched) {
      matchedQueryTokens +=
        1;
    }
  }

  return Math.min(
    1,
    matchedQueryTokens /
      Math.min(
        3,
        questionTokens.length
      )
  );
}

function questionCandidates(
  entry: SupportKnowledgeEntrySnapshot
): Array<{
  text: string;
  weight: number;
}> {
  return [
    {
      text:
        entry.primaryQuestion,
      weight:
        1
    },
    ...entry.questionExamples.map(
      example => ({
        text:
          example.text,
        weight:
          Math.max(
            0.5,
            Math.min(
              1.2,
              example.weight
            )
          )
      })
    )
  ];
}

export function scoreSupportKnowledgeEntry(
  question: string,
  entry: SupportKnowledgeEntrySnapshot
): SupportKnowledgeMatch {
  let exactQuestion =
    false;

  let strongestPhrase =
    0;

  for (
    const candidate of
    questionCandidates(
      entry
    )
  ) {
    const similarity =
      phraseSimilarity(
        question,
        candidate.text
      );

    if (
      similarity.exact
    ) {
      exactQuestion =
        true;

      strongestPhrase =
        1;

      break;
    }

    strongestPhrase =
      Math.max(
        strongestPhrase,
        Math.min(
          1,
          similarity.score *
            candidate.weight
        )
      );
  }

  const keywordCoverage =
    termCoverage(
      question,
      entry.keywords
    );

  const synonymCoverage =
    termCoverage(
      question,
      entry.synonyms
    );

  const metadataCoverage =
    termCoverage(
      question,
      [
        entry.title,
        entry.category,
        entry.intent.replace(
          /_/g,
          ' '
        )
      ]
    );

  const hasEvidence =
    exactQuestion ||
    strongestPhrase >=
      0.25 ||
    keywordCoverage >
      0 ||
    synonymCoverage >
      0 ||
    metadataCoverage >
      0;

  const weighted =
    hasEvidence
      ? strongestPhrase *
          0.7 +
        keywordCoverage *
          0.18 +
        synonymCoverage *
          0.08 +
        metadataCoverage *
          0.04
      : 0;

  const priorityBonus =
    Math.max(
      0,
      Math.min(
        0.015,
        entry.priority /
          10_000
      )
    );

  const score =
    exactQuestion
      ? 1
      : Math.min(
          0.99,
          weighted +
            priorityBonus
        );

  return {
    entry,
    score:
      Number(
        score.toFixed(
          4
        )
      ),
    threshold:
      entry.confidenceThreshold,
    evidence: {
      exactQuestion,
      phraseSimilarity:
        Number(
          strongestPhrase.toFixed(
            4
          )
        ),
      keywordCoverage:
        Number(
          keywordCoverage.toFixed(
            4
          )
        ),
      synonymCoverage:
        Number(
          synonymCoverage.toFixed(
            4
          )
        ),
      metadataCoverage:
        Number(
          metadataCoverage.toFixed(
            4
          )
        )
    }
  };
}

export function resolveSupportKnowledgeMatch(
  question: string,
  entries: readonly SupportKnowledgeEntrySnapshot[]
): SupportKnowledgeMatchResolution {
  const scored =
    entries
      .map(
        entry =>
          scoreSupportKnowledgeEntry(
            question,
            entry
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          second.score -
            first.score ||
          second.entry.priority -
            first.entry.priority ||
          first.entry.slug.localeCompare(
            second.entry.slug
          )
      );

  const best =
    scored[0] ??
    null;

  const runnerUp =
    scored[1] ??
    null;

  if (
    !best ||
    best.score <
      best.threshold
  ) {
    return {
      best:
        null,
      runnerUp:
        runnerUp &&
        runnerUp.score >=
          runnerUp.threshold
          ? runnerUp
          : null,
      ambiguous:
        false
    };
  }

  const runnerUpQualifies =
    Boolean(
      runnerUp &&
        runnerUp.score >=
          runnerUp.threshold
    );

  const ambiguous =
    Boolean(
      runnerUpQualifies &&
        runnerUp &&
        best.entry.intent !==
          runnerUp.entry.intent &&
        !best.evidence
          .exactQuestion &&
        best.score <
          0.92 &&
        best.score -
          runnerUp.score <
          0.08
    );

  return {
    best,
    runnerUp:
      runnerUpQualifies
        ? runnerUp
        : null,
    ambiguous
  };
}
