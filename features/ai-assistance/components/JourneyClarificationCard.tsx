'use client';

/* AJ_MS12_4_BUDGET_GUIDANCE_COPY_ALIGNMENT_V1 */

/* AJ_MS12_INTELLIGENCE_READABILITY_PASS_V1 */

/* AJ_MS12_VISIBLE_STATE_CLARIFICATION */
/* AJ_MS12_QUICK_RESPONSE_COMPOSER_V4 */
/* AJ_MS12_DYNAMIC_BUDGET_RANGES */
/* AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1 */

import {
  useMemo,
  useState,
  type FormEvent
} from 'react';

import {
  ArrowRight,
  CircleHelp,
  LoaderCircle
} from 'lucide-react';

import type {
  JourneyQuickReplyOption
} from '../journeyBudgetGuidance';

type JourneyClarificationCardProps = {
  question:
    string;
  sending:
    boolean;
  suggestions?:
    JourneyQuickReplyOption[];
  suggestionContext?:
    string |
    null;
  onSubmit(
    value:
      string
  ): void;
};

type ClarificationPresentation = {
  label:
    string;
  placeholder:
    string;
  helper:
    string;
  suggestions:
    string[];
};

function presentationFor(
  question:
    string
): ClarificationPresentation {
  const normalized =
    question
      .toLowerCase()
      .trim();

  if (
    /\b(?:how many|people|guests|attendees|persons)\b/.test(
      normalized
    )
  ) {
    return {
      label:
        'Guest count',
      placeholder:
        'For example: 12',
      helper:
        'A simple number is enough.',
      suggestions: [
        'We are 5 people',
        'We are 10 people',
        'We are 20 people'
      ]
    };
  }

  if (
    /\b(?:budget|spend|price|within|cost)\b/.test(
      normalized
    )
  ) {
    return {
      label:
        'Budget',
      placeholder:
        'For example: ₦100,000, N100K or 100000',
      helper:
        'Choose a catalogue-guided range or enter your own limit. Enter the amount with or without ₦, N, NGN, commas or K.',
      suggestions: [
        'Keep it under ₦50,000',
        'Work within ₦100,000',
        'My budget is flexible'
      ]
    };
  }

  if (
    /\b(?:occasion|event|situation|celebration|purpose)\b/.test(
      normalized
    )
  ) {
    return {
      label:
        'Occasion',
      placeholder:
        'For example: a birthday dinner',
      helper:
        'A few natural words are enough.',
      suggestions: [
        'It is for a birthday',
        'It is a relaxed dinner',
        'It is a small celebration'
      ]
    };
  }

  if (
    /\b(?:feel|preference|premium|balanced|affordable|style)\b/.test(
      normalized
    )
  ) {
    return {
      label:
        'Preference',
      placeholder:
        'For example: premium but relaxed',
      helper:
        'Describe the mood, quality or price direction.',
      suggestions: [
        'Keep it balanced',
        'Make it premium',
        'I prefer affordable options'
      ]
    };
  }

  if (
    /\b(?:which|choose|choice|option|prefer)\b/.test(
      normalized
    )
  ) {
    return {
      label:
        'Your choice',
      placeholder:
        'For example: go with the second option',
      helper:
        'Choose naturally. AJ will preserve the rest of the Journey.',
      suggestions: [
        'Go with the first option',
        'Go with the second option',
        'Show me another option'
      ]
    };
  }

  return {
    label:
      'One detail',
    placeholder:
      'Type your answer naturally',
    helper:
      'AJ will keep this answer with the current Journey.',
    suggestions: []
  };
}

export function JourneyClarificationCard({
  question,
  sending,
  suggestions,
  suggestionContext,
  onSubmit
}: JourneyClarificationCardProps) {
  const [
    answer,
    setAnswer
  ] =
    useState(
      ''
    );

  const presentation =
    useMemo(
      () =>
        presentationFor(
          question
        ),
      [
        question
      ]
    );

  const suggestionOptions =
    useMemo<JourneyQuickReplyOption[]>(
      () =>
        suggestions
          ?.length
          ? suggestions
          : presentation
              .suggestions
              .map(
                value => ({
                  label:
                    value,
                  value
                })
              ),
      [
        presentation.suggestions,
        suggestions
      ]
    );

  function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value =
      answer
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    if (
      !value ||
      sending
    ) {
      return;
    }

    onSubmit(
      value
    );

    setAnswer(
      ''
    );
  }

  return (
    <section
      aria-labelledby="aj-clarification-question"
      className="w-full overflow-hidden rounded-[1.75rem] border border-accent/20 bg-card/75 shadow-sm">
      <div className="bg-accent/[0.055] px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent">
            <CircleHelp className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-accent">
              Quick response
            </p>

            <h3
              id="aj-clarification-question"
              className="mt-1 text-base font-medium leading-6 text-foreground sm:text-lg">
              {
                question
              }
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {
                presentation.helper
              }
            </p>
          </div>
        </div>

        {suggestionOptions
          .length ? (
          <>
            <div
              className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Suggested answers">
              {suggestionOptions.map(
                suggestion => (
                  <button
                    key={
                      suggestion.value
                    }
                    type="button"
                    disabled={
                      sending
                    }
                    onClick={() =>
                      onSubmit(
                        suggestion.value
                      )
                    }
                    className="min-h-16 rounded-2xl border border-border/65 bg-background/70 px-4 py-3 text-left transition hover:border-accent/35 hover:bg-accent/7 disabled:cursor-not-allowed disabled:opacity-45">
                    <span className="block text-xs font-semibold text-foreground">
                      {
                        suggestion.label
                      }
                    </span>

                    {suggestion.helper ? (
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {
                          suggestion.helper
                        }
                      </span>
                    ) : null}
                  </button>
                )
              )}
            </div>

            {suggestionContext ? (
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                {
                  suggestionContext
                }
              </p>
            ) : null}
          </>
        ) : null}

        <form
          onSubmit={
            submit
          }
          className="mt-4">
          <label className="block text-xs font-medium text-muted-foreground">
            {
              presentation.label
            }
          </label>

          <div className="mt-3 flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-border/65 bg-background/80 p-3 shadow-sm focus-within:border-accent/40">
            <input
              value={
                answer
              }
              onChange={event =>
                setAnswer(
                  event.target.value
                )
              }
              disabled={
                sending
              }
              maxLength={
                2000
              }
              inputMode={
                presentation.label ===
                  'Guest count'
                  ? 'numeric'
                  : 'text'
              }
              autoComplete="off"
              spellCheck={
                presentation.label !==
                  'Budget'
              }
              placeholder={
                presentation.placeholder
              }
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !answer.trim()
              }
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Continue this Journey">
              {sending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </button>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
            Choose one or type naturally. AJ will continue the same Journey.
          </p>
        </form>
      </div>
    </section>
  );
}
