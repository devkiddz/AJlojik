import 'server-only';

/* AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1 */

function normalizedInstruction(
  prompt:
    string
) {
  return prompt
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function asksForInformationOnly(
  value:
    string
) {
  return (
    /\b(?:tell|show|explain|describe|share|give)\s+me\s+more\s+(?:about|information|details?|context|reasoning)\b/i.test(
      value
    ) ||
    /\bmore\s+(?:about|information|details?|context|reasoning)\b/i.test(
      value
    )
  );
}

export function isCompositionDirectionInstruction(
  prompt:
    string
) {
  const value =
    normalizedInstruction(
      prompt
    );

  if (
    asksForInformationOnly(
      value
    )
  ) {
    return false;
  }

  return (
    /\b(?:more|fewer|less|mostly|mainly)\s+(?!(?:about|information|details?|context|reasoning|why|how)\b)[a-z][a-z0-9'-]*/i.test(
      value
    ) ||
    /\b(?:give|include|add|use|make|lean|focus|prioriti[sz]e|favour|favor)\b.{0,80}\b(?:more|fewer|less|mostly|mainly)\b/i.test(
      value
    )
  );
}

export function isPlanMutationInstruction(
  prompt:
    string
) {
  const value =
    normalizedInstruction(
      prompt
    );

  return (
    /\b(?:change|adjust|refine|update|revise|edit|replace|remove|add|include|exclude|reduce|increase|decrease|lower|raise|cut|swap|rebuild|recompose|rework)\b/i.test(
      value
    ) ||
    /\b(?:make|turn)\s+(?:it|this|the\s+plan)\b/i.test(
      value
    ) ||
    /\binstead\b/i.test(
      value
    ) ||
    /\b(?:show|give|find|suggest|recommend)\b.{0,60}\b(?:different|alternative|cheaper|premium)\b/i.test(
      value
    ) ||
    /\b(?:different|another)\s+(?:combination|version|plan|selection|option)\b/i.test(
      value
    ) ||
    /\b(?:set|move|change|raise|cut|cap|limit)\b.{0,35}\bbudget\b/i.test(
      value
    ) ||
    /\bbudget\b.{0,35}\b(?:to|at|under|below|above)\b/i.test(
      value
    ) ||
    isCompositionDirectionInstruction(
      value
    )
  );
}

export function isPlanExplanationOnlyInstruction(
  prompt:
    string
) {
  const value =
    normalizedInstruction(
      prompt
    );

  return (
    /\b(?:explain|why|reason|rationale|walk me through|help me understand|describe|summari[sz]e)\b/i.test(
      value
    ) &&
    /\b(?:plan|products?|items?|choices?|selections?|fit|selected|included|budget|combination|list)\b/i.test(
      value
    ) &&
    !isPlanMutationInstruction(
      value
    )
  );
}
