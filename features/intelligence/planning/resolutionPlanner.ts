import type {
  IntelligenceConstraint,
  IntelligencePlanStep,
  IntelligenceRecommendation,
  IntelligenceResolutionType
} from '../domain';

import {
  clampIntelligenceConfidence
} from '../domain';

import type {
  IntelligencePlanningInput,
  IntelligencePlanningResult
} from './planningContracts';

const PLAN_TEMPLATES:
  Record<
    IntelligenceResolutionType,
    readonly string[]
  > = {
  PRODUCT_DISCOVERY: [
    'Understand the product need',
    'Inspect catalogue evidence',
    'Rank suitable products',
    'Present justified recommendations'
  ],
  PRODUCT_COMPARISON: [
    'Confirm comparison criteria',
    'Collect comparable product evidence',
    'Evaluate strengths and trade-offs',
    'Recommend the best fit'
  ],
  PRODUCT_PAIRING: [
    'Identify the anchor product or occasion',
    'Resolve pairing constraints',
    'Find compatible products',
    'Explain the pairing'
  ],
  SHOPPING_PLAN: [
    'Capture the occasion and constraints',
    'Build the product plan',
    'Check availability and budget',
    'Prepare an actionable Shopping List'
  ],
  BASKET_OPTIMIZATION: [
    'Inspect the current basket',
    'Identify cost or availability pressure',
    'Prepare substitutions and adjustments',
    'Review the optimized basket'
  ],
  SHOPPING_LIST_PREPARATION: [
    'Inspect the Shopping List',
    'Resolve missing or unavailable items',
    'Prepare variants and quantities',
    'Submit for review or checkout preparation'
  ],
  DELIVERY_SUPPORT: [
    'Identify the relevant order or delivery',
    'Inspect available delivery evidence',
    'Explain current status',
    'Prepare the next support action'
  ],
  CATALOG_IMPROVEMENT: [
    'Inspect catalogue quality signals',
    'Group incomplete or inconsistent records',
    'Prepare recommended corrections',
    'Create governed improvement actions'
  ],
  PRODUCT_DRAFT: [
    'Collect product identity',
    'Resolve category and brand context',
    'Prepare catalogue fields',
    'Review and save the draft'
  ],
  PRODUCT_REVISION: [
    'Inspect the current product',
    'Capture the revision reason',
    'Prepare proposed changes',
    'Submit through approval governance'
  ],
  CAMPAIGN_PLAN: [
    'Define the campaign objective',
    'Select audience and products',
    'Prepare campaign structure',
    'Review and submit the campaign'
  ],
  INVENTORY_INTERVENTION: [
    'Inspect inventory risk',
    'Identify affected products',
    'Prepare recovery actions',
    'Route changes through operational authority'
  ],
  REVIEW_MODERATION: [
    'Inspect moderation evidence',
    'Group reviews by priority',
    'Prepare moderation recommendations',
    'Route decisions through approval'
  ],
  VENDOR_INTERVENTION: [
    'Inspect vendor performance context',
    'Identify the intervention objective',
    'Prepare corrective actions',
    'Review and assign the intervention'
  ],
  OPERATIONS_BRIEF: [
    'Collect operational signals',
    'Identify risks and opportunities',
    'Prioritize recommended actions',
    'Publish the operational brief'
  ],
  GOVERNANCE_EXPLANATION: [
    'Identify the governance question',
    'Inspect applicable authority boundaries',
    'Explain permitted and restricted actions',
    'Provide the correct governed path'
  ],
  CUSTOM: [
    'Clarify the objective',
    'Collect relevant context',
    'Prepare a resolution plan',
    'Review the proposed outcome'
  ]
};

export class DeterministicResolutionPlanner {
  plan(
    input:
      IntelligencePlanningInput
  ): IntelligencePlanningResult {
    const missingInformation =
      findMissingInformation(
        input
      );

    const constraints =
      resolveConstraints(
        input,
        missingInformation
      );

    const recommendations =
      createRecommendations(
        input
      );

    const steps =
      createPlanSteps(
        input.goal
          .resolutionType
      );

    const warningCount =
      missingInformation.length;

    const confidence =
      clampIntelligenceConfidence(
        0.88 -
        warningCount *
          0.12
      );

    return {
      expectedOutcome:
        input.goal.expectedOutcome?.trim() ||
        defaultExpectedOutcome(
          input.goal
            .resolutionType
        ),
      constraints,
      recommendations,
      plan: {
        summary:
          `Resolve: ${input.goal.objective}`,
        steps
      },
      confidence,
      riskLevel:
        inferRisk(
          input,
          warningCount
        ),
      missingInformation,
      warnings:
        missingInformation.map(
          item =>
            `More information may be required: ${item}.`
        )
    };
  }
}

function createPlanSteps(
  type:
    IntelligenceResolutionType
): IntelligencePlanStep[] {
  return PLAN_TEMPLATES[
    type
  ].map(
    (
      title,
      index
    ) => ({
      id:
        `${type.toLowerCase()}:${index + 1}`,
      order:
        index + 1,
      title,
      status:
        index ===
        0
          ? 'ACTIVE'
          : 'PENDING'
    })
  );
}

function findMissingInformation(
  input:
    IntelligencePlanningInput
): string[] {
  const missing:
    string[] = [];

  const refs =
    input.context
      .references;

  switch (
    input.goal
      .resolutionType
  ) {
    case 'PRODUCT_COMPARISON':
      if (
        refs.productIds.length <
        2
      ) {
        missing.push(
          'at least two products to compare'
        );
      }
      break;
    case 'PRODUCT_PAIRING':
      if (
        refs.productIds.length ===
        0 &&
        !input.context.experience
          .category
      ) {
        missing.push(
          'an anchor product or category'
        );
      }
      break;
    case 'BASKET_OPTIMIZATION':
      if (
        !hasArrayData(
          input.context.commerce,
          'cartItems'
        )
      ) {
        missing.push(
          'current basket items'
        );
      }
      break;
    case 'SHOPPING_LIST_PREPARATION':
      if (
        refs.shoppingListIds.length ===
        0
      ) {
        missing.push(
          'a Shopping List'
        );
      }
      break;
    case 'DELIVERY_SUPPORT':
      if (
        refs.orderIds.length ===
        0
      ) {
        missing.push(
          'an order or delivery'
        );
      }
      break;
    case 'PRODUCT_REVISION':
      if (
        refs.productIds.length ===
        0
      ) {
        missing.push(
          'the product to revise'
        );
      }
      break;
    default:
      break;
  }

  return missing;
}

function resolveConstraints(
  input:
    IntelligencePlanningInput,
  missingInformation:
    string[]
): IntelligenceConstraint[] {
  const constraints = [
    ...(
      input.existingConstraints ??
      []
    )
  ];

  for (
    const [
      index,
      missing
    ] of
    missingInformation.entries()
  ) {
    constraints.push({
      id:
        `missing:${index}`,
      kind:
        'CUSTOM',
      label:
        'Missing information',
      value:
        missing,
      required:
        true,
      source:
        'CONTEXT'
    });
  }

  if (
    input.goal.audience ===
    'vendor'
  ) {
    constraints.push({
      id:
        'governance:vendor-scope',
      kind:
        'GOVERNANCE',
      label:
        'Vendor scope',
      value:
        'Changes must remain inside the active vendor profile and approval process.',
      required:
        true,
      source:
        'POLICY'
    });
  }

  return dedupeConstraints(
    constraints
  );
}

function createRecommendations(
  input:
    IntelligencePlanningInput
): IntelligenceRecommendation[] {
  const references =
    input.context
      .references.productIds
      .slice(
        0,
        5
      )
      .map(
        id => ({
          type:
            'product',
          id
        })
      );

  return [
    {
      id:
        `recommendation:${input.goal.resolutionType.toLowerCase()}`,
      title:
        'Continue with the structured resolution plan',
      rationale:
        'The current context is sufficient to begin planning while preserving explicit review before application.',
      priority:
        'HIGH',
      confidence:
        0.82,
      references
    }
  ];
}

function inferRisk(
  input:
    IntelligencePlanningInput,
  missingCount:
    number
): IntelligencePlanningResult['riskLevel'] {
  const highGovernanceTypes:
    IntelligenceResolutionType[] = [
      'PRODUCT_REVISION',
      'INVENTORY_INTERVENTION',
      'REVIEW_MODERATION',
      'VENDOR_INTERVENTION'
    ];

  if (
    highGovernanceTypes.includes(
      input.goal
        .resolutionType
    )
  ) {
    return 'HIGH';
  }

  if (
    input.goal
      .resolutionType ===
      'CAMPAIGN_PLAN' ||
    missingCount >
      1
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function defaultExpectedOutcome(
  type:
    IntelligenceResolutionType
): string {
  return `A reviewed and actionable ${type.toLowerCase().replaceAll('_', ' ')} resolution.`;
}

function hasArrayData(
  record:
    Record<string, unknown>,
  key:
    string
): boolean {
  const value =
    record[
      key
    ];

  return (
    Array.isArray(
      value
    ) &&
    value.length >
      0
  );
}

function dedupeConstraints(
  constraints:
    IntelligenceConstraint[]
): IntelligenceConstraint[] {
  const seen =
    new Set<string>();

  return constraints.filter(
    constraint => {
      const key =
        `${constraint.kind}:${constraint.label}:${constraint.value}`;

      if (
        seen.has(
          key
        )
      ) {
        return false;
      }

      seen.add(
        key
      );

      return true;
    }
  );
}
