'use client';

import {
  useEffect,
  useState
} from 'react';

export type QuickSupportViewportState = {
  height: number | null;
  keyboardInset: number;
  keyboardVisible: boolean;
  online: boolean;
};

const HEIGHT_VARIABLE =
  '--quick-support-viewport-height';

const KEYBOARD_VARIABLE =
  '--quick-support-keyboard-inset';

const OFFSET_VARIABLE =
  '--quick-support-viewport-offset-top';

function readOnline(): boolean {
  return (
    typeof navigator ===
      'undefined' ||
    navigator.onLine
  );
}

export function useQuickSupportViewport():
  QuickSupportViewportState {
  const [
    state,
    setState
  ] =
    useState<QuickSupportViewportState>({
      height:
        null,
      keyboardInset:
        0,
      keyboardVisible:
        false,
      online:
        true
    });

  useEffect(
    () => {
      const root =
        document.documentElement;

      const visualViewport =
        window.visualViewport;

      let frame:
        number |
        null =
          null;

      const update =
        (): void => {
          if (
            frame !==
            null
          ) {
            window.cancelAnimationFrame(
              frame
            );
          }

          frame =
            window.requestAnimationFrame(
              () => {
                frame =
                  null;

                const height =
                  Math.max(
                    1,
                    Math.round(
                      visualViewport
                        ?.height ??
                        window.innerHeight
                    )
                  );

                const offsetTop =
                  Math.max(
                    0,
                    Math.round(
                      visualViewport
                        ?.offsetTop ??
                        0
                    )
                  );

                const keyboardInset =
                  Math.max(
                    0,
                    Math.round(
                      window.innerHeight -
                        height -
                        offsetTop
                    )
                  );

                const keyboardVisible =
                  keyboardInset >
                  96;

                root.style.setProperty(
                  HEIGHT_VARIABLE,
                  `${height}px`
                );

                root.style.setProperty(
                  KEYBOARD_VARIABLE,
                  `${keyboardInset}px`
                );

                root.style.setProperty(
                  OFFSET_VARIABLE,
                  `${offsetTop}px`
                );

                setState({
                  height,
                  keyboardInset,
                  keyboardVisible,
                  online:
                    readOnline()
                });
              }
            );
        };

      const handleOnline =
        (): void => {
          update();
        };

      const handleOffline =
        (): void => {
          update();
        };

      update();

      visualViewport
        ?.addEventListener(
          'resize',
          update
        );

      visualViewport
        ?.addEventListener(
          'scroll',
          update
        );

      window.addEventListener(
        'resize',
        update
      );

      window.addEventListener(
        'orientationchange',
        update
      );

      window.addEventListener(
        'online',
        handleOnline
      );

      window.addEventListener(
        'offline',
        handleOffline
      );

      return () => {
        if (
          frame !==
          null
        ) {
          window.cancelAnimationFrame(
            frame
          );
        }

        visualViewport
          ?.removeEventListener(
            'resize',
            update
          );

        visualViewport
          ?.removeEventListener(
            'scroll',
            update
          );

        window.removeEventListener(
          'resize',
          update
        );

        window.removeEventListener(
          'orientationchange',
          update
        );

        window.removeEventListener(
          'online',
          handleOnline
        );

        window.removeEventListener(
          'offline',
          handleOffline
        );

        root.style.removeProperty(
          HEIGHT_VARIABLE
        );

        root.style.removeProperty(
          KEYBOARD_VARIABLE
        );

        root.style.removeProperty(
          OFFSET_VARIABLE
        );
      };
    },
    []
  );

  return state;
}
