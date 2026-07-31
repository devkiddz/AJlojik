const COMMERCE_STORY_VIEW_STORAGE_KEY =
  'rcentz_commerce_story_views';

type CommerceStoryViewRecord = {
  storyId: string;
  viewedAt: string;
};

function readViewRecords():
  CommerceStoryViewRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        COMMERCE_STORY_VIEW_STORAGE_KEY
      );

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (
        item
      ): item is CommerceStoryViewRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof (
          item as CommerceStoryViewRecord
        ).storyId === 'string' &&
        typeof (
          item as CommerceStoryViewRecord
        ).viewedAt === 'string'
    );
  } catch {
    return [];
  }
}

function writeViewRecords(
  records: CommerceStoryViewRecord[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      COMMERCE_STORY_VIEW_STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch {
    // Story viewing must never interrupt Store usage.
  }
}

export function getViewedStoryIds():
  string[] {
  return readViewRecords().map(
    record => record.storyId
  );
}

export function markStoryAsViewed(
  storyId: string
): void {
  const currentRecords =
    readViewRecords();

  const nextRecord: CommerceStoryViewRecord = {
    storyId,
    viewedAt:
      new Date().toISOString()
  };

  const nextRecords = [
    nextRecord,

    ...currentRecords.filter(
      record =>
        record.storyId !== storyId
    )
  ].slice(0, 200);

  writeViewRecords(nextRecords);
}