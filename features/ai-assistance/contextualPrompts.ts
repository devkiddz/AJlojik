import type {
  AIAssistantAudience,
  AIAssistantRuntimeContext
} from './contracts';

export type AssistantPromptCategory =
  | 'collaborate'
  | 'discover'
  | 'compare'
  | 'plan'
  | 'budget'
  | 'shopping-list'
  | 'order'
  | 'delivery'
  | 'vendor'
  | 'admin';

export type AssistantPromptBehavior =
  | 'fill-composer'
  | 'submit-immediately'
  | 'start-guided-flow';

export type AssistantSuggestedPrompt = {
  id: string;
  label: string;
  prompt: string;
  description: string;
  category: AssistantPromptCategory;
  behavior: AssistantPromptBehavior;
  priority: number;
};

type ResolveAssistantPromptsInput = {
  audience: AIAssistantAudience;
  context: Partial<AIAssistantRuntimeContext>;
};

const collaborativePrompt: AssistantSuggestedPrompt = {
  id: 'collaborate-think-through',
  label: 'I can help you think this through',
  prompt: 'Help me think this through',
  description:
    'Share an unfinished idea and I will ask a few useful questions to help you shape it.',
  category: 'collaborate',
  behavior: 'start-guided-flow',
  priority: 100
};

const customerGeneralPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'customer-discover-new',
    label: 'I can help you discover something new',
    prompt: 'Help me discover something new based on my interests',
    description:
      'Explore useful products without needing to know exactly what to search for.',
    category: 'discover',
    behavior: 'fill-composer',
    priority: 82
  },
  {
    id: 'customer-recent-activity',
    label: 'I can continue from your recent activity',
    prompt: 'Show me useful products based on my recent activity',
    description:
      'Continue naturally from products and categories you recently explored.',
    category: 'discover',
    behavior: 'fill-composer',
    priority: 78
  },
  {
    id: 'customer-budget-plan',
    label: 'I can help you plan within your budget',
    prompt: 'Help me plan what to buy within my budget',
    description:
      'Tell me your budget and goal, and I will help organise practical options.',
    category: 'budget',
    behavior: 'start-guided-flow',
    priority: 76
  },
  {
    id: 'customer-shopping-list',
    label: 'I can help you build a Shopping List',
    prompt: 'Help me build a useful Shopping List',
    description:
      'Turn a rough need, occasion or restock idea into an organised list.',
    category: 'shopping-list',
    behavior: 'start-guided-flow',
    priority: 74
  }
];

const customerProductPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'customer-product-compare',
    label: 'I can compare this with similar products',
    prompt: 'Compare this product with similar available products',
    description:
      'See the most useful differences in price, size, availability and purpose.',
    category: 'compare',
    behavior: 'fill-composer',
    priority: 96
  },
  {
    id: 'customer-product-alternative',
    label: 'I can find a better-priced alternative',
    prompt: 'Find a more affordable alternative to this product',
    description:
      'Look for a suitable option that gives you better control of your budget.',
    category: 'budget',
    behavior: 'fill-composer',
    priority: 92
  },
  {
    id: 'customer-product-gift',
    label: 'I can tell you whether this suits a gift',
    prompt: 'Would this product make a good gift, and what could I pair with it?',
    description:
      'Understand who it may suit and discover a thoughtful combination.',
    category: 'plan',
    behavior: 'fill-composer',
    priority: 88
  },
  {
    id: 'customer-product-variant',
    label: 'I can help you choose the right option',
    prompt: 'Help me choose the best available variant of this product',
    description:
      'Compare the available sizes or options before you decide.',
    category: 'compare',
    behavior: 'fill-composer',
    priority: 84
  }
];

const customerCategoryPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'customer-category-picks',
    label: 'I can show the strongest choices here',
    prompt: 'Show me the strongest choices in this category',
    description:
      'Focus on useful, available products instead of making you browse everything.',
    category: 'discover',
    behavior: 'fill-composer',
    priority: 92
  },
  {
    id: 'customer-category-budget',
    label: 'I can find options for your budget',
    prompt: 'Help me find good options in this category within my budget',
    description:
      'Use your spending range to narrow the category into practical choices.',
    category: 'budget',
    behavior: 'start-guided-flow',
    priority: 88
  },
  {
    id: 'customer-category-occasion',
    label: 'I can plan an occasion from this category',
    prompt: 'Help me plan an occasion using products from this category',
    description:
      'Build a balanced selection around the event you have in mind.',
    category: 'plan',
    behavior: 'start-guided-flow',
    priority: 84
  }
];

const customerListPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'customer-list-estimate',
    label: 'I can help estimate this Shopping List',
    prompt: 'Estimate this Shopping List and explain the total clearly',
    description:
      'Review the likely cost and point out anything that may change it.',
    category: 'shopping-list',
    behavior: 'fill-composer',
    priority: 96
  },
  {
    id: 'customer-list-missing',
    label: 'I can suggest anything you may have forgotten',
    prompt: 'Check this Shopping List and suggest useful missing items',
    description:
      'Look for practical gaps without filling the list with unnecessary products.',
    category: 'shopping-list',
    behavior: 'fill-composer',
    priority: 92
  },
  {
    id: 'customer-list-cheaper',
    label: 'I can help reduce the cost of this list',
    prompt: 'Find sensible ways to reduce the cost of this Shopping List',
    description:
      'Keep the purpose of the list while identifying lower-cost alternatives.',
    category: 'budget',
    behavior: 'fill-composer',
    priority: 88
  },
  {
    id: 'customer-list-prepare',
    label: 'I can help prepare this list for checkout',
    prompt: 'Help me prepare this Shopping List for checkout',
    description:
      'Review availability, likely substitutions and the next safe step.',
    category: 'shopping-list',
    behavior: 'fill-composer',
    priority: 84
  }
];

const customerOrderPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'customer-order-explain',
    label: 'I can explain your order status',
    prompt: 'Explain my current order status in simple terms',
    description:
      'Understand what has happened, what is pending and what comes next.',
    category: 'order',
    behavior: 'fill-composer',
    priority: 96
  },
  {
    id: 'customer-order-changes',
    label: 'I can explain what changed in your order',
    prompt: 'Explain any changes, substitutions or delays affecting my order',
    description:
      'See the important changes without searching through several screens.',
    category: 'order',
    behavior: 'fill-composer',
    priority: 92
  },
  {
    id: 'customer-delivery-progress',
    label: 'I can help you understand your delivery progress',
    prompt: 'Help me understand where my delivery is and what happens next',
    description:
      'Translate delivery events into a clear, useful update.',
    category: 'delivery',
    behavior: 'fill-composer',
    priority: 88
  },
  {
    id: 'customer-order-problem',
    label: 'I can help you report a problem',
    prompt: 'Help me report a problem with my order or delivery',
    description:
      'Describe what happened and I will guide you toward the correct next step.',
    category: 'delivery',
    behavior: 'start-guided-flow',
    priority: 84
  }
];

const vendorPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'vendor-priority',
    label: 'I can show what you should work on first',
    prompt: 'Show me what needs my attention first today',
    description:
      'Turn your permitted vendor activity into a practical order of work.',
    category: 'vendor',
    behavior: 'fill-composer',
    priority: 96
  },
  {
    id: 'vendor-product-create',
    label: 'I can help you create a product',
    prompt: 'Help me create a new product draft',
    description:
      'Describe the product naturally and I will organise the draft details.',
    category: 'vendor',
    behavior: 'start-guided-flow',
    priority: 92
  },
  {
    id: 'vendor-listing-improve',
    label: 'I can find listings that need improvement',
    prompt: 'Find my product listings that need improvement and explain why',
    description:
      'Identify incomplete or weak listings and suggest a useful next step.',
    category: 'vendor',
    behavior: 'fill-composer',
    priority: 88
  },
  {
    id: 'vendor-stock',
    label: 'I can identify products running low',
    prompt: 'Show my products that may need stock attention',
    description:
      'Focus on products whose availability may affect customer activity.',
    category: 'vendor',
    behavior: 'fill-composer',
    priority: 84
  },
  {
    id: 'vendor-promotion',
    label: 'I can help prepare a promotion',
    prompt: 'Help me prepare a useful promotion from my current products',
    description:
      'Use your own catalog and activity to shape a reviewable campaign idea.',
    category: 'vendor',
    behavior: 'start-guided-flow',
    priority: 80
  }
];

const adminPrompts: AssistantSuggestedPrompt[] = [
  {
    id: 'admin-priority',
    label: 'I can show what needs attention first',
    prompt: 'Show me the most important work that needs attention today',
    description:
      'Organise urgent, blocked and high-impact work into a clear priority order.',
    category: 'admin',
    behavior: 'fill-composer',
    priority: 98
  },
  {
    id: 'admin-blocked',
    label: 'I can explain blocked operations',
    prompt: 'Explain the important operations that are currently blocked',
    description:
      'Understand what is preventing progress and what can safely happen next.',
    category: 'admin',
    behavior: 'fill-composer',
    priority: 94
  },
  {
    id: 'admin-approvals',
    label: 'I can summarise pending approvals',
    prompt: 'Summarise pending approvals and show which ones matter most',
    description:
      'Review approval work by urgency and operational effect.',
    category: 'admin',
    behavior: 'fill-composer',
    priority: 90
  },
  {
    id: 'admin-deliveries',
    label: 'I can find deliveries that may need attention',
    prompt: 'Find delayed or risky deliveries and explain the next step',
    description:
      'Surface delivery problems before they become harder customer issues.',
    category: 'admin',
    behavior: 'fill-composer',
    priority: 86
  },
  {
    id: 'admin-product-draft',
    label: 'I can help prepare a product draft',
    prompt: 'Help me prepare a new product draft for review',
    description:
      'Turn natural product details into a controlled, inactive draft.',
    category: 'admin',
    behavior: 'start-guided-flow',
    priority: 82
  }
];

function includesAny(
  value: string,
  candidates: string[]
) {
  return candidates.some(
    candidate => value.includes(candidate)
  );
}

function deduplicatePrompts(
  prompts: AssistantSuggestedPrompt[]
) {
  const seen = new Set<string>();

  return prompts.filter(prompt => {
    if (seen.has(prompt.id)) {
      return false;
    }

    seen.add(prompt.id);
    return true;
  });
}

export function resolveAssistantSuggestedPrompts({
  audience,
  context
}: ResolveAssistantPromptsInput): AssistantSuggestedPrompt[] {
  if (audience === 'admin') {
    return [
      collaborativePrompt,
      ...adminPrompts
    ];
  }

  if (audience === 'vendor') {
    return [
      collaborativePrompt,
      ...vendorPrompts
    ];
  }

  const mode = (context.mode ?? '').toLowerCase();
  const intent = (context.intent ?? '').toLowerCase();

  const inShoppingList =
    includesAny(mode, ['shopping-list', 'shopping_list', 'list']) ||
    includesAny(intent, ['shopping-list', 'shopping list']);

  const inOrder =
    includesAny(mode, ['order', 'delivery', 'tracking']) ||
    includesAny(intent, ['order', 'delivery', 'tracking']);

  const contextual = context.productId
    ? customerProductPrompts
    : inShoppingList
      ? customerListPrompts
      : inOrder
        ? customerOrderPrompts
        : context.category
          ? customerCategoryPrompts
          : customerGeneralPrompts;

  return deduplicatePrompts([
    collaborativePrompt,
    ...contextual,
    ...customerGeneralPrompts
  ])
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 8);
}
