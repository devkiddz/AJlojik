'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { BadgeCheck, MessageSquareText, Star, UserRound } from 'lucide-react';
import { getMyProductReview } from '@/features/reviews/actions/getMyProductReview';

import { Button } from '@/components/ui/button';
import type {
  ExperienceReview,
  ReviewRating,
  ReviewsModuleDefinition
} from '@/features/feed-experience/contracts';
import { upsertProductReview, type SavedProductReview } from '@/features/reviews/actions/upsertProductReview';
import { cn } from '@/lib/utils';

type ProductReviewsSectionProps = {
  productId: string;
  data: ReviewsModuleDefinition['data'];
};

type RatingStarsProps = {
  rating: number;
  size?: 'default' | 'large';
};

const REVIEW_RATINGS: ReviewRating[] = [5, 4, 3, 2, 1];
const REVIEW_PREVIEW_LIMIT = 3;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function RatingStars({ rating, size = 'default' }: RatingStarsProps) {
  const roundedRating = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={cn(
            size === 'large' ? 'size-5' : 'size-3.5',
            star <= roundedRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </span>
  );
}

export function ProductReviewsSection({ productId, data }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ExperienceReview[]>(data.reviews);
  const [loadingMyReview, setLoadingMyReview] = useState(true);
  const [averageRating, setAverageRating] = useState(data.averageRating);

  const [reviewCount, setReviewCount] = useState(data.reviewCount);

  const [ratingDistribution, setRatingDistribution] = useState<Record<ReviewRating, number>>({
    ...data.ratingDistribution
  });

  const [pendingReview, setPendingReview] = useState<SavedProductReview | null>(null);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [draftRating, setDraftRating] = useState<ReviewRating | 0>(0);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const numberFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(data.locale ?? 'en-NG', {
        notation: 'compact',
        maximumFractionDigits: 1
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        notation: 'compact',
        maximumFractionDigits: 1
      });
    }
  }, [data.locale]);

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(data.locale ?? 'en-NG', {
        dateStyle: 'medium'
      });
    } catch {
      return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium'
      });
    }
  }, [data.locale]);

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, REVIEW_PREVIEW_LIMIT);

  useEffect(() => {
    setReviews(data.reviews);
    setAverageRating(data.averageRating);
    setReviewCount(data.reviewCount);

    setRatingDistribution({
      ...data.ratingDistribution
    });
  }, [data.averageRating, data.ratingDistribution, data.reviewCount, data.reviews]);

  useEffect(() => {
    setShowAllReviews(false);
    setReviewFormOpen(false);
    setPendingReview(null);
    setSubmittingReview(false);

    setDraftRating(0);
    setDraftTitle('');
    setDraftComment('');
    setFormError(null);
  }, [data.targetId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMyReview(): Promise<void> {
      setLoadingMyReview(true);

      try {
        const result = await getMyProductReview(productId);

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          console.error(result.message);
          setPendingReview(null);

          return;
        }

        /*
         * Approved reviews belong in the public collection.
         * Only an unapproved review is shown privately here.
         */
        setPendingReview(result.review && !result.review.approved ? result.review : null);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load pending review:', error);

          setPendingReview(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingMyReview(false);
        }
      }
    }

    void loadMyReview();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  function resetReviewForm(): void {
    setDraftRating(0);
    setDraftTitle('');
    setDraftComment('');
    setFormError(null);
  }

  function closeReviewForm(): void {
    setReviewFormOpen(false);
    resetReviewForm();
  }

  function toggleReviewForm(): void {
    const openingForm = !reviewFormOpen;

    if (openingForm && pendingReview) {
      setDraftRating(pendingReview.rating);
      setDraftTitle(pendingReview.title ?? '');
      setDraftComment(pendingReview.comment);
    }

    setReviewFormOpen(openingForm);
    setFormError(null);
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (submittingReview) {
      return;
    }

    if (draftRating === 0) {
      setFormError('Select a star rating before submitting your review.');

      return;
    }

    const comment = draftComment.trim();

    if (comment.length < 10) {
      setFormError('Please write at least 10 characters about your experience.');

      return;
    }

    setSubmittingReview(true);
    setFormError(null);

    try {
      const result = await upsertProductReview({
        productId,
        rating: draftRating,
        title: draftTitle.trim() || undefined,
        comment
      });

      if (!result.ok) {
        setFormError(result.message);

        return;
      }

      /*
       * The review is stored in the database but remains outside
       * the public review collection until moderation is completed.
       */
      setPendingReview(result.review);

      /*
       * Editing an approved review returns it to moderation.
       * Remove the approved version from this local presentation.
       */
      setReviews(currentReviews => currentReviews.filter(review => review.id !== result.review.id));

      setReviewFormOpen(false);
      resetReviewForm();
    } catch (error) {
      console.error('Review submission failed:', error);

      setFormError('Your review could not be saved. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <section
      id={`product-reviews-${productId}`}
      aria-label={`Customer reviews for ${data.targetName}`}
      className="
        relative scroll-mt-24 overflow-hidden
        rounded-3xl border border-border
        bg-background/70
      ">
      {/* ====================================================
          REVIEW HEADER
      ==================================================== */}

      <header
        className="
          flex flex-col justify-between gap-5
          border-b border-border bg-card/40 p-5
          md:flex-row md:items-end md:p-6
        ">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-primary" />

            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
              Customer experiences
            </p>
          </div>

          <h3 className="mt-3 text-2xl font-bold tracking-tight">{data.title}</h3>

          {data.subtitle ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.subtitle}</p>
          ) : null}
        </div>

        <Button
          type="button"
          aria-expanded={reviewFormOpen}
          aria-controls={`review-form-${productId}`}
          onClick={toggleReviewForm}
          className="
            h-10 w-full rounded-full
            border border-amber-400/30
            bg-amber-400 px-5
            text-sm font-bold text-slate-950
            shadow-sm transition
            hover:bg-amber-300
            focus-visible:ring-1
            focus-visible:ring-amber-400
            focus-visible:ring-offset-1
            md:w-auto
          ">
          <MessageSquareText className="size-4" />

          {reviewFormOpen ? 'Close review form' : pendingReview ? 'Edit pending review' : 'Write a review'}
        </Button>
      </header>

      {/* ====================================================
          INLINE REVIEW FORM
      ==================================================== */}

      {reviewFormOpen ? (
        <div
          id={`review-form-${productId}`}
          className="
            relative z-20
            border-b border-border
            bg-muted/20 p-5 md:p-6
          ">
          <form
            onSubmit={handleSubmitReview}
            aria-busy={submittingReview}
            className="mx-auto max-w-2xl space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
                Share your experience
              </p>

              <h4 className="mt-2 text-xl font-bold tracking-tight">Review {data.targetName}</h4>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tell other customers about the quality and your overall experience.
              </p>
            </div>

            {!data.canWriteReview ? (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Sign in required</p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  You must sign in before submitting your review.
                </p>
              </div>
            ) : null}

            <fieldset disabled={submittingReview}>
              <legend className="text-sm font-semibold">Your rating</legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(star => {
                  const rating = star as ReviewRating;
                  const selected = rating <= draftRating;

                  return (
                    <button
                      key={rating}
                      type="button"
                      aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                      aria-pressed={draftRating === rating}
                      onClick={() => {
                        setDraftRating(rating);
                        setFormError(null);
                      }}
                      className="
                        grid size-11 place-items-center
                        rounded-full border border-border
                        bg-background transition
                        hover:border-amber-400/50
                        hover:bg-amber-400/5
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-ring
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      ">
                      <Star
                        className={cn(
                          'size-5',
                          selected ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`review-title-${productId}`} className="text-sm font-semibold">
                Review title
                <span className="ml-1 font-normal text-muted-foreground">Optional</span>
              </label>

              <input
                id={`review-title-${productId}`}
                type="text"
                value={draftTitle}
                maxLength={90}
                disabled={submittingReview}
                onChange={event => {
                  setDraftTitle(event.target.value);
                  setFormError(null);
                }}
                placeholder="Summarise your experience"
                className="
                  mt-2 h-11 w-full rounded-2xl
                  border border-border bg-background
                  px-4 text-sm outline-none
                  placeholder:text-muted-foreground/60
                  focus:border-primary/40
                  focus:ring-1 focus:ring-ring
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            <div>
              <label htmlFor={`review-comment-${productId}`} className="text-sm font-semibold">
                Tell us about your experience
              </label>

              <textarea
                id={`review-comment-${productId}`}
                value={draftComment}
                rows={5}
                maxLength={1200}
                disabled={submittingReview}
                onChange={event => {
                  setDraftComment(event.target.value);
                  setFormError(null);
                }}
                placeholder="What stood out about the quality, presentation or service?"
                className="
                  mt-2 w-full resize-y rounded-2xl
                  border border-border bg-background
                  px-4 py-3 text-sm leading-6
                  outline-none
                  placeholder:text-muted-foreground/60
                  focus:border-primary/40
                  focus:ring-1 focus:ring-ring
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <p className="mt-1 text-right text-[10px] text-muted-foreground">{draftComment.length}/1200</p>
            </div>

            {formError ? (
              <p
                role="alert"
                className="
                  rounded-2xl border border-rose-500/20
                  bg-rose-500/10 px-4 py-3
                  text-sm text-rose-700
                  dark:text-rose-300
                ">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={submittingReview}
                onClick={closeReviewForm}
                className="rounded-full">
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submittingReview || !data.canWriteReview}
                className="
                  rounded-full
                  border border-amber-400/30
                  bg-amber-400
                  font-bold text-slate-950
                  hover:bg-amber-300
                ">
                <MessageSquareText className="size-4" />

                {submittingReview ? 'Saving review...' : 'Submit review'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* ====================================================
          RATING SUMMARY AND REVIEWS
      ==================================================== */}

      <div className="grid items-start gap-6 p-5 md:p-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Overall rating */}

        <aside className="h-fit self-start rounded-3xl border border-border bg-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Overall rating
          </p>

          <div className="mt-4 flex items-end gap-3">
            <p className="text-5xl font-black tracking-tight">{averageRating.toFixed(1)}</p>

            <p className="pb-1 text-sm text-muted-foreground">out of 5</p>
          </div>

          <div className="mt-3">
            <RatingStars rating={averageRating} size="large" />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Based on{' '}
            <strong className="font-semibold text-foreground">{numberFormatter.format(reviewCount)}</strong>{' '}
            reviews
          </p>

          <div className="mt-6 space-y-3">
            {REVIEW_RATINGS.map(rating => {
              const ratingCount = ratingDistribution[rating];

              const percentage = reviewCount > 0 ? Math.round((ratingCount / reviewCount) * 100) : 0;

              return (
                <div key={rating} className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium">
                    {rating}

                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </span>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                  </div>

                  <span className="text-right text-xs text-muted-foreground">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Pending and approved reviews */}

        <div className="min-w-0 space-y-4">
          {loadingMyReview ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Checking your review status...</p>
            </div>
          ) : null}
          {pendingReview ? (
            <article
              aria-label="Your pending review"
              className="
                rounded-3xl border border-amber-400/25
                bg-amber-400/5 p-5
              ">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{pendingReview.author.name}</h4>

                    <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      Pending approval
                    </span>

                    {pendingReview.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <BadgeCheck className="size-3" />
                        Verified purchase
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2">
                    <RatingStars rating={pendingReview.rating} />
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">Awaiting moderation</p>
              </div>

              {pendingReview.title ? <h5 className="mt-4 text-sm font-bold">{pendingReview.title}</h5> : null}

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {pendingReview.comment}
              </p>

              <p className="mt-4 text-xs leading-5 text-amber-700 dark:text-amber-300">
                Your review has been saved. It will become public after approval.
              </p>
            </article>
          ) : null}

          {visibleReviews.length > 0 ? (
            <div className="space-y-4">
              {visibleReviews.map(review => {
                const reviewDate = new Date(review.createdAt);

                const formattedDate = Number.isNaN(reviewDate.getTime())
                  ? 'Recently'
                  : dateFormatter.format(reviewDate);

                return (
                  <article key={review.id} className="rounded-3xl border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(review.author.name) || <UserRound className="size-4" />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">{review.author.name}</h4>

                          {review.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
                              <BadgeCheck className="size-3" />
                              Verified purchase
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <RatingStars rating={review.rating} />

                          <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {review.title ? <h5 className="mt-4 text-sm font-bold">{review.title}</h5> : null}

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {review.comment}
                    </p>
                  </article>
                );
              })}

              {reviews.length > REVIEW_PREVIEW_LIMIT ? (
                <div className="flex justify-center pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAllReviews(current => !current);
                    }}
                    className="rounded-full">
                    {showAllReviews ? 'Show fewer reviews' : `Show ${reviews.length} loaded reviews`}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : pendingReview ? null : (
            <div className="grid min-h-56 place-items-center rounded-3xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <div>
                <MessageSquareText className="mx-auto size-8 text-muted-foreground/50" />

                <h4 className="mt-4 font-semibold">Be the first to review</h4>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Share your experience with {data.targetName}.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReviewFormOpen(true);
                    setFormError(null);
                  }}
                  className="mt-5 rounded-full">
                  Write the first review
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
