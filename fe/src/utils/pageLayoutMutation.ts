import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import { PutLayoutComponent } from '@/types/layout-component';
import { CompositePutSlot } from '@/types/layout-component/composite-component';

export type BatchLayoutComponentPayload = {
  components: PutLayoutComponent[];
  deleteIds: string[];
};

const buildPageLayoutMutation = (state: LayoutState) => {
  const { components, newComponents, dirtyComponents, removedComponents } =
    state;
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
    if (!component || removedComponents.has(id)) return null;
    visited.add(id);

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
          name: component.name,
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
          name: component.name,
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
          name: component.name,
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

export default buildPageLayoutMutation;
