export const QUICK_SUPPORT_SELECTED_CASE_PREFIX =
  'aj_quick_support_selected_case';

function selectionKey(
  workspaceId: string
): string {
  return `${QUICK_SUPPORT_SELECTED_CASE_PREFIX}:${workspaceId}`;
}

export function readQuickSupportSelectedCaseId(
  workspaceId: string
): string | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null;
  }

  try {
    const value =
      window.localStorage.getItem(
        selectionKey(
          workspaceId
        )
      );

    return value
      ?.trim() ||
      null;
  } catch {
    return null;
  }
}

export function writeQuickSupportSelectedCaseId(
  workspaceId: string,
  caseId: string
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      selectionKey(
        workspaceId
      ),
      caseId
    );
  } catch {
    // Selection persistence is optional.
    // The current panel remains usable.
  }
}

export function clearQuickSupportSelectedCaseId(
  workspaceId: string
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(
      selectionKey(
        workspaceId
      )
    );
  } catch {
    // Selection persistence is optional.
  }
}
