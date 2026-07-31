'use client';

import {
  Fragment
} from 'react';

import type {
  FeedModule
} from '../contracts';

import FeedExperienceLoader from '../providers/FeedExperienceLoader';

import {
  useFeedExperienceContext
} from '../providers/FeedExperienceProvider';

import {
  FeedModuleRenderer
} from './FeedModuleRenderer';

const PUBLIC_SHOPPING_LIST_SLOT_ID =
  'public-shopping-list-feed-slot';

const AMBIENT_DISCOVERY_MODULE_TYPES =
  new Set<
    FeedModule['type']
  >([
    'shopping-journey',
    'collection-feed',
    'featured-products',
    'product-grid',
    'recently-viewed',
    'product-rail'
  ]);

export function FeedRenderer() {
  const {
    experience,
    actions,
    isResolving,
    pendingIntent
  } = useFeedExperienceContext();

  if (isResolving) {
    return (
      <main
        aria-busy="true"
        aria-live="polite">
        <FeedExperienceLoader
          intentType={
            pendingIntent?.type
          }
        />
      </main>
    );
  }

  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    console.table(
      experience.modules.map(
        module => ({
          id:
            module.id,

          type:
            module.type,

          priority:
            module.priority
        })
      )
    );
  }

  const publicListInsertionIndex =
    experience.modules.findIndex(
      module =>
        AMBIENT_DISCOVERY_MODULE_TYPES.has(
          module.type
        )
    );

  return (
    <main
      aria-busy="false"
      data-experience-key={
        experience.key
      }
      data-experience-status={
        experience.status
      }>
      <div className="space-y-4 md:space-y-5">
        {experience.modules.map(
          (
            module,
            index
          ) => (
            <Fragment
              key={
                module.id
              }>
              {index ===
              publicListInsertionIndex ? (
                <div
                  id={
                    PUBLIC_SHOPPING_LIST_SLOT_ID
                  }
                  className="min-w-0"
                  data-feed-module="public-shopping-lists"
                />
              ) : null}

              <FeedModuleRenderer
                module={
                  module
                }
                actions={
                  actions
                }
              />
            </Fragment>
          )
        )}

        {publicListInsertionIndex ===
        -1 ? (
          <div
            id={
              PUBLIC_SHOPPING_LIST_SLOT_ID
            }
            className="min-w-0"
            data-feed-module="public-shopping-lists"
          />
        ) : null}
      </div>
    </main>
  );
}
