import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import { PutLayoutComponent } from '@/types/layout-component';
import { CompositePutSlot } from '@/types/layout-component/composite-component';
import { getBlobFile } from './blobFileRegistry';
import { FlattenComponent, UpdateFlattenComponent } from './flattenLayout';

const isBlobUrl = (val: unknown): val is string =>
  typeof val === 'string' && val.trim().startsWith('blob:');

async function resolveChangedUrlsInConfig<T>(
  newVal: T,
  oldVal: unknown,
  path = 'config',
): Promise<T> {
  if (Array.isArray(newVal)) {
    const oldArr = Array.isArray(oldVal) ? oldVal : [];
    const resolvedItems = await Promise.all(
      newVal.map((item, idx) =>
        resolveChangedUrlsInConfig(item, oldArr[idx], `${path}[${idx}]`),
      ),
    );
    return resolvedItems as T;
  }

  if (newVal !== null && typeof newVal === 'object') {
    const oldObj =
      oldVal !== null && typeof oldVal === 'object'
        ? (oldVal as Record<string, unknown>)
        : {};

    const entries = await Promise.all(
      Object.entries(newVal).map(async ([key, val]) => {
        const fieldPath = `${path}.${key}`;
        const prevVal = oldObj[key];

        // Leaf field whose name ends with "Url" / "url" and whose string value changed
        if (isBlobUrl(val) && val !== prevVal) {
          const fetchedValue =
            getBlobFile(val) ??
            (await fetch(val).then((res) => res.blob()));
          const newKey = key.replace(/url$/i, '') || key;
          return [newKey, fetchedValue] as const;
        }

        // Recurse into nested objects/arrays
        const nested = await resolveChangedUrlsInConfig(
          val,
          prevVal,
          fieldPath,
        );
        return [key, nested] as const;
      }),
    );

    return Object.fromEntries(entries) as T;
  }

  return newVal;
}

export type BatchLayoutComponentPayload = {
  components: PutLayoutComponent[];
  deleteIds: string[];
};

type MutationLayoutState = Omit<LayoutState, 'components'> & {
  components: Record<string, FlattenComponent | UpdateFlattenComponent>;
};

const buildPageLayoutMutation = (
  newState: MutationLayoutState,
  originalState: LayoutState,
) => {
  const { components, newComponents, dirtyComponents, removedComponents } =
    newState;
  // 1. Collect all IDs that need to be deleted
  const deleteIds = [...removedComponents].filter(
    (id) => !newComponents.has(id),
  );

  // 2. Collect every existing/new component that needs to be upserted
  const upsertIds = new Set<string>();
  for (const id of [...newComponents, ...dirtyComponents]) {
    if (!removedComponents.has(id) && components[id]) {
      upsertIds.add(id);
    }
  }

  // 3. Map each child/template ID to its parent so we only emit subtree roots
  //    at the top level of components (avoiding duplicate upserts)
  const parentOf = new Map<string, string>();
  for (const component of Object.values(components)) {
    if (!component) continue;

    if (component.type === 'COMPOSITE') {
      for (const childId of component.children ?? []) {
        parentOf.set(childId, component.id);
      }
    } else if (component.type === 'REPEATER' && component.itemTemplate) {
      parentOf.set(component.itemTemplate, component.id);
    }
  }

  const visited = new Set<string>();

  const serializeSubTree = (id: string): PutLayoutComponent | null => {
    if (visited.has(id) || !upsertIds.has(id)) return null;
    const component = components[id];
    const originalComponent = originalState.components[id];
    if (!component || removedComponents.has(id)) return null;
    visited.add(id);

    const name =
      component.name !== undefined &&
      (newComponents.has(component.id) ||
        originalComponent?.name !== component.name)
        ? { name: component.name }
        : {};

    switch (component.type) {
      case 'COMPOSITE': {
        const rawSlots = component.slots;
        const slots: CompositePutSlot | undefined = rawSlots
          ? {
              desktop: rawSlots.desktop,
              ...(rawSlots.tablet ? { tablet: rawSlots.tablet } : {}),
              ...(rawSlots.mobile ? { mobile: rawSlots.mobile } : {}),
            }
          : undefined;

        const childIds = (component.children ?? []).filter((childId) =>
          upsertIds.has(childId),
        );

        let adjustedSlots = {};
        if (slots) {
          adjustedSlots = Object.fromEntries(
            Object.entries(slots).map(([bp, slotMap]) => {
              const mappedSlotEntries = Object.entries(slotMap ?? {})
                .filter(
                  ([, childId]) =>
                    !removedComponents.has(childId) &&
                    Boolean(components[childId]),
                )
                .map(([slot, childId]) => {
                  const resolvedChildId = newComponents.has(childId)
                    ? childIds.indexOf(childId)
                    : childId;

                  return [slot, resolvedChildId] as const;
                });

              return [bp, Object.fromEntries(mappedSlotEntries)] as const;
            }),
          );
        }

        const children = childIds
          .map((id) => {
            const isNew = Boolean(newComponents.has(id));
            const subtree = serializeSubTree(id);
            if (!subtree) return;
            if (isNew && 'id' in subtree) {
              const { id: _, ...rest } = subtree;
              return {
                ...rest,
              };
            }
            return subtree;
          })
          .filter(Boolean) as PutLayoutComponent[];

        return {
          id: component.id,
          ...name,
          type: 'COMPOSITE',
          componentType: component.componentType,
          config: component.config,
          ...(children ? { children } : {}),
          ...(slots ? { slots: adjustedSlots } : {}),
        } as PutLayoutComponent;
      }
      case 'REPEATER': {
        // Backend schema expects `itemTemplate` to be an object or omitted (never `null`)
        const itemTemplate: PutLayoutComponent | null = (() => {
          if (!component.itemTemplate || !upsertIds.has(component.itemTemplate))
            return null;
          const template = serializeSubTree(component.itemTemplate);
          if (!template) return null;

          if (newComponents.has(component.itemTemplate) && 'id' in template) {
            const { id: _, ...rest } = template;
            return { ...rest } as PutLayoutComponent;
          }
          return template;
        })();

        return {
          id: component.id,
          ...name,
          type: 'REPEATER',
          componentType: component.componentType,
          config: component.config,
          ...(itemTemplate ? { itemTemplate } : {}),
        } as PutLayoutComponent;
      }
      case 'COMMERCE':
      case 'LEAF': {
        return {
          id: component.id,
          ...name,
          type: component.type,
          componentType: component.componentType,
          config: component.config,
        } as PutLayoutComponent;
      }
    }
  };

  // 4. Create a subtree for each component that does not have a parent being upserted
  const serializedSubTrees: PutLayoutComponent[] = [];
  for (const id of upsertIds) {
    const parentId = parentOf.get(id);
    if (parentId && upsertIds.has(parentId)) {
      continue;
    }

    const subTree = serializeSubTree(id);
    if (subTree) {
      serializedSubTrees.push(subTree);
    }
  }

  return {
    components: serializedSubTrees,
    deleteIds,
  };
};

export const buildPageLayoutMutationWithUrls = async (
  newState: LayoutState,
  originalState: LayoutState,
): Promise<BatchLayoutComponentPayload> => {
  const candidateIds = new Set([
    ...newState.newComponents,
    ...newState.dirtyComponents,
  ]);

  const updatedComponents: Record<
    string,
    FlattenComponent | UpdateFlattenComponent
  > = { ...newState.components };

  await Promise.all(
    [...candidateIds].map(async (id) => {
      if (newState.removedComponents.has(id)) return;

      const current = updatedComponents[id];
      if (!current?.config) return;

      const originalConfig = originalState.components[id]?.config;
      const resolvedConfig = await resolveChangedUrlsInConfig(
        current.config,
        originalConfig,
      );

      updatedComponents[id] = {
        ...current,
        config: resolvedConfig,
      } as UpdateFlattenComponent;
    }),
  );

  return buildPageLayoutMutation(
    { ...newState, components: updatedComponents },
    originalState,
  );
};

export default buildPageLayoutMutation;
