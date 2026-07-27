'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ShoppingList, ShoppingListMutationResponse } from '../shoppingListTypes';

import {
  addShoppingListItem,
  archiveShoppingList,
  createShoppingList,
  getShoppingLists,
  removeShoppingListItem,
  updateShoppingList,
  updateShoppingListItem,
  type AddShoppingListItemInput,
  type CreateShoppingListInput,
  type UpdateShoppingListInput,
  type UpdateShoppingListItemInput
} from './shoppingListService';

type ShoppingListContextValue = {
  lists: ShoppingList[];

  loading: boolean;
  mutating: boolean;

  error: string | null;

  refresh: () => Promise<void>;

  createList: (input: Omit<CreateShoppingListInput, 'workspaceId'>) => Promise<ShoppingListMutationResponse>;

  updateList: (
    listId: string,
    input: Omit<UpdateShoppingListInput, 'workspaceId'>
  ) => Promise<ShoppingListMutationResponse>;

  archiveList: (listId: string) => Promise<ShoppingListMutationResponse>;

  addItem: (
    listId: string,
    input: Omit<AddShoppingListItemInput, 'workspaceId'>
  ) => Promise<ShoppingListMutationResponse>;

  updateItem: (
    listId: string,
    itemId: string,
    input: Omit<UpdateShoppingListItemInput, 'workspaceId'>
  ) => Promise<ShoppingListMutationResponse>;

  removeItem: (listId: string, itemId: string) => Promise<ShoppingListMutationResponse>;
};

type ShoppingListProviderProps = {
  workspaceId: string | null;
  children: ReactNode;
};

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to complete the shopping list request.';
}

export function ShoppingListProvider({ workspaceId, children }: ShoppingListProviderProps) {
  const [lists, setLists] = useState<ShoppingList[]>([]);

  const [loading, setLoading] = useState(false);

  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const applyMutation = useCallback((response: ShoppingListMutationResponse) => {
    setLists(response.lists);
    setError(null);

    return response;
  }, []);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setLists([]);
      setLoading(false);
      setError(null);

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getShoppingLists(workspaceId);

      setLists(result);
    } catch (requestError) {
      setLists([]);

      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runMutation = useCallback(
    async (operation: () => Promise<ShoppingListMutationResponse>) => {
      setMutating(true);
      setError(null);

      try {
        const response = await operation();

        return applyMutation(response);
      } catch (requestError) {
        setError(getErrorMessage(requestError));

        throw requestError;
      } finally {
        setMutating(false);
      }
    },
    [applyMutation]
  );

  const requireWorkspaceId = useCallback(() => {
    if (!workspaceId) {
      throw new Error('No active workspace is available.');
    }

    return workspaceId;
  }, [workspaceId]);

  const createList = useCallback(
    (input: Omit<CreateShoppingListInput, 'workspaceId'>) =>
      runMutation(() =>
        createShoppingList({
          ...input,

          workspaceId: requireWorkspaceId()
        })
      ),
    [requireWorkspaceId, runMutation]
  );

  const updateList = useCallback(
    (listId: string, input: Omit<UpdateShoppingListInput, 'workspaceId'>) =>
      runMutation(() =>
        updateShoppingList(listId, {
          ...input,

          workspaceId: requireWorkspaceId()
        })
      ),
    [requireWorkspaceId, runMutation]
  );

  const archiveList = useCallback(
    (listId: string) => runMutation(() => archiveShoppingList(listId, requireWorkspaceId())),
    [requireWorkspaceId, runMutation]
  );

  const addItem = useCallback(
    (listId: string, input: Omit<AddShoppingListItemInput, 'workspaceId'>) =>
      runMutation(() =>
        addShoppingListItem(listId, {
          ...input,

          workspaceId: requireWorkspaceId()
        })
      ),
    [requireWorkspaceId, runMutation]
  );

  const updateItem = useCallback(
    (listId: string, itemId: string, input: Omit<UpdateShoppingListItemInput, 'workspaceId'>) =>
      runMutation(() =>
        updateShoppingListItem(listId, itemId, {
          ...input,

          workspaceId: requireWorkspaceId()
        })
      ),
    [requireWorkspaceId, runMutation]
  );

  const removeItem = useCallback(
    (listId: string, itemId: string) =>
      runMutation(() => removeShoppingListItem(listId, itemId, requireWorkspaceId())),
    [requireWorkspaceId, runMutation]
  );

  const value = useMemo<ShoppingListContextValue>(
    () => ({
      lists,

      loading,
      mutating,

      error,

      refresh,

      createList,
      updateList,
      archiveList,

      addItem,
      updateItem,
      removeItem
    }),
    [
      lists,

      loading,
      mutating,

      error,

      refresh,

      createList,
      updateList,
      archiveList,

      addItem,
      updateItem,
      removeItem
    ]
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useOptionalShoppingLists(): ShoppingListContextValue | null {
  return useContext(ShoppingListContext);
}

export function useShoppingLists(): ShoppingListContextValue {
  const context = useContext(ShoppingListContext);

  if (!context) {
    throw new Error('useShoppingLists must be used inside ShoppingListProvider.');
  }

  return context;
}
