import 'server-only';

import { after } from 'next/server';

export function queueTransactionalEmail(task: () => Promise<unknown>): void {
  const runTask = async () => {
    try {
      await task();
    } catch (error) {
      console.error('[transactional-email]', error);
    }
  };

  try {
    after(runTask);
  } catch {
    void runTask();
  }
}
