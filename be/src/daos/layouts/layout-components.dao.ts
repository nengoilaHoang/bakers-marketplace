import database from '#/db/index.js';
import { PutLayoutComponent } from '#/models/layout-components/layout-components.model.js';
import { NotFoundError } from '#/utils/http-errors.js';
import { Knex } from 'knex';

type ComponentBatches = {
  base: Array<Record<string, unknown>>;
  leaf: Array<Record<string, unknown>>;
  commerce: Array<Record<string, unknown>>;
  repeater: Array<Record<string, unknown>>;
  composite: Array<Record<string, unknown>>;
  children: Array<Record<string, unknown>>;
};

type BuiltUpsertBatches = {
  insertables: ComponentBatches;
  updatables: ComponentBatches;
};

type CompositeChildRow = {
  compositeId: string;
  childId: string;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  sortOrder: number;
};

const emptyComponentBatches = (): ComponentBatches => ({
  base: [],
  leaf: [],
  commerce: [],
  repeater: [],
  composite: [],
  children: [],
});

const emptyBuiltUpsertBatches = (): BuiltUpsertBatches => ({
  insertables: emptyComponentBatches(),
  updatables: emptyComponentBatches(),
});

export class LayoutComponentDao {
  constructor(private readonly knex: Knex) {}

  public withTransaction = async <T>(
    action: (trx: Knex.Transaction) => Promise<T>,
    trx?: Knex.Transaction,
  ): Promise<T> => {
    // If an external transaction exists, participate in it without closing it
    if (trx) {
      return action(trx);
    }
    // Otherwise, create a managed transaction that auto-commits and auto-rollbacks
    return this.knex.transaction(action);
  };

  private readonly mergeBatches = (
    components: PutLayoutComponent[],
  ): BuiltUpsertBatches => {
    return components.reduce<BuiltUpsertBatches>((combined, component) => {
      const componentBatches = this.buildUpsertBatches(component);
      for (const group of ['insertables', 'updatables'] as const) {
        for (const key of [
          'base',
          'leaf',
          'commerce',
          'repeater',
          'composite',
          'children',
        ] as const) {
          combined[group][key].push(...componentBatches[group][key]);
        }
      }
      return combined;
    }, emptyBuiltUpsertBatches());
  };

  private readonly executeUpsertBatches = async (
    t: Knex.Transaction,
    batches: BuiltUpsertBatches,
  ): Promise<string[]> => {
    const upsertIds = new Set<string>();
    const baseRows = [...batches.insertables.base, ...batches.updatables.base];
    const leafRows = [...batches.insertables.leaf, ...batches.updatables.leaf];
    const commerceRows = [
      ...batches.insertables.commerce,
      ...batches.updatables.commerce,
    ];
    const repeaterRows = [
      ...batches.insertables.repeater,
      ...batches.updatables.repeater,
    ];
    const compositeRows = [
      ...batches.insertables.composite,
      ...batches.updatables.composite,
    ];
    const childrenRows = [
      ...batches.insertables.children,
      ...batches.updatables.children,
    ] as CompositeChildRow[];

    if (baseRows.length > 0) {
      const ids = await t('layout_components')
        .insert(baseRows)
        .onConflict('id')
        .merge()
        .returning('id');
      ids.forEach(({ id }) => upsertIds.add(id));
    }

    await Promise.all([
      leafRows.length > 0 &&
        t('leaf_components').insert(leafRows).onConflict('id').merge(),
      commerceRows.length > 0 &&
        t('commerce_components').insert(commerceRows).onConflict('id').merge(),
      repeaterRows.length > 0 &&
        t('repeater_components').insert(repeaterRows).onConflict('id').merge(),
      compositeRows.length > 0 &&
        t('composite_components')
          .insert(compositeRows)
          .onConflict('id')
          .merge(),
    ]);

    if (childrenRows.length > 0) {
      // Update sortOrder for children already assigned to (compositeId, breakpoint)
      await Promise.all(
        childrenRows.map((row) => {
          return t('composite_component_children')
            .where({
              compositeId: row.compositeId,
              breakpoint: row.breakpoint,
              childId: row.childId,
            })
            .update({ sortOrder: row.sortOrder });
        }),
      );

      // Insert new assignments using the non-deferrable (composite_id, breakpoint, child_id) unique constraint
      // (Temporary duplicate sort_order values are allowed until COMMIT because the PK is DEFERRABLE)
      await t('composite_component_children')
        .insert(childrenRows)
        .onConflict(['compositeId', 'breakpoint', 'childId'])
        .ignore();

      // Remove replaced/stale slot rows after new rows exist so trg_cleanup_parent_component
      // does not prematurely delete moved children from layout_components
      const rowsByScope = new Map<string, CompositeChildRow[]>();
      for (const row of childrenRows) {
        const key = `${row.compositeId}:${row.breakpoint}`;
        const group = rowsByScope.get(key) ?? [];
        group.push(row);
        rowsByScope.set(key, group);
      }

      await Promise.all(
        Array.from(rowsByScope.values(), (group) => {
          const { compositeId, breakpoint } = group[0];
          const validChildIds = group.map((r) => r.childId);
          return t('composite_component_children')
            .where({ compositeId, breakpoint })
            .whereNotIn('childId', validChildIds)
            .del();
        }),
      );
    }

    return [...upsertIds.keys()];
  };

  public upsertBatch = async (
    components: PutLayoutComponent[],
    trx?: Knex.Transaction,
  ): Promise<string[]> => {
    if (components.length === 0) {
      return [];
    }

    const batches = this.mergeBatches(components);
    return this.withTransaction(
      (t) => this.executeUpsertBatches(t, batches),
      trx,
    );
  };

  private readonly buildUpsertBatches = (
    component: PutLayoutComponent,
  ): BuiltUpsertBatches => {
    const batches = emptyBuiltUpsertBatches();
    const componentBatches = component.id
      ? batches.updatables
      : batches.insertables;
    const componentId = component.id ?? crypto.randomUUID();

    if (component.id) {
      const updatable: Record<string, unknown> = {};
      if (component.name) updatable.name = component.name;
      if (component.description) updatable.description = component.description;
      if (component.config) updatable.config = component.config;

      if (Object.keys(updatable).length > 0) {
        componentBatches.base.push({
          id: componentId,
          ...updatable,
        });
      }
    } else {
      componentBatches.base.push({
        id: componentId,
        name: component.name,
        description: component.description,
        config: component.config ?? {},
      });
    }

    switch (component.type) {
      case 'LEAF': {
        componentBatches.leaf.push({
          id: componentId,
          componentType: component.componentType,
        });
        break;
      }

      case 'COMMERCE': {
        componentBatches.commerce.push({
          id: componentId,
          componentType: component.componentType,
        });
        break;
      }

      case 'REPEATER': {
        let repeaterBatches = emptyBuiltUpsertBatches();
        if ('itemTemplate' in component && component.itemTemplate) {
          repeaterBatches = this.buildUpsertBatches(
            component.itemTemplate as PutLayoutComponent,
          );
        }

        const templateId =
          repeaterBatches.insertables.base[0]?.id ??
          repeaterBatches.updatables.base[0]?.id;
        componentBatches.repeater.push({
          id: componentId,
          componentType: component.componentType,
          itemTemplateId: templateId,
        });
        for (const group of ['insertables', 'updatables'] as const) {
          for (const key of [
            'base',
            'leaf',
            'commerce',
            'repeater',
            'composite',
            'children',
          ] as const) {
            batches[group][key].push(...repeaterBatches[group][key]);
          }
        }
        break;
      }

      case 'COMPOSITE': {
        componentBatches.composite.push({
          id: componentId,
          componentType: component.componentType,
        });

        // Create a set to track generated or existing child ID
        // to get child ID from child array index later
        const childIds: Array<string> = [];

        if ('children' in component && Array.isArray(component.children)) {
          for (const child of component.children) {
            if (!child) continue;
            const childBatches = this.buildUpsertBatches(
              child as PutLayoutComponent,
            );

            // Capture the generated or existing child ID
            const childId =
              (child as PutLayoutComponent).id ??
              (childBatches.updatables.base[0]?.id as string | undefined) ??
              (childBatches.insertables.base[0]?.id as string | undefined);

            if (childId) childIds.push(childId);

            for (const group of ['insertables', 'updatables'] as const) {
              for (const key of [
                'base',
                'leaf',
                'commerce',
                'repeater',
                'composite',
                'children',
              ] as const) {
                batches[group][key].push(...childBatches[group][key]);
              }
            }
          }
        }

        // Process slots
        const slots = component.slots;
        const breakpoints = ['desktop', 'tablet', 'mobile'] as const;
        if (slots) {
          for (const breakpoint of breakpoints) {
            const slotMap = slots[breakpoint];
            if (!slotMap) continue;
            for (const [orderStr, childIdOrIndex] of Object.entries(slotMap)) {
              // Validate that the childIdOrIndex is either a string (child ID) or a number (child index)
              if (
                typeof childIdOrIndex !== 'string' &&
                typeof childIdOrIndex !== 'number'
              ) {
                throw new TypeError(
                  `Invalid child reference at breakpoint "${breakpoint}" and order "${orderStr}". Expected a string (child ID) or a number (child index), but got: ${typeof childIdOrIndex}`,
                );
              }
              if (typeof childIdOrIndex === 'string') {
                batches.updatables.children.push({
                  compositeId: componentId,
                  childId: childIdOrIndex,
                  breakpoint,
                  sortOrder: Number.parseInt(orderStr, 10),
                });
              } else if (typeof childIdOrIndex === 'number') {
                const resolvedId = childIds[childIdOrIndex];
                if (resolvedId) {
                  batches.insertables.children.push({
                    compositeId: componentId,
                    childId: resolvedId,
                    breakpoint,
                    sortOrder: Number.parseInt(orderStr, 10),
                  });
                }
              }
            }
          }
        }
        break;
      }
      default: {
        const _exhaustive: never = component;
        throw new Error(`Unsupported component type: ${_exhaustive}`);
      }
    }

    return batches;
  };

  public upsertLayoutComponent = async (
    component: PutLayoutComponent,
    trx?: Knex.Transaction,
  ): Promise<string> => {
    const batches = this.buildUpsertBatches(component);
    const rootId =
      component.id ??
      (batches.insertables.base[0]?.id as string | undefined) ??
      (batches.updatables.base[0]?.id as string);

    await this.withTransaction(
      (t) => this.executeUpsertBatches(t, batches),
      trx,
    );

    return rootId;
  };

  public deleteComponents = async (ids: string[], trx?: Knex.Transaction) => {
    if (ids.length === 0) return;
    const execute = async (t: Knex.Transaction) => {
      const affectedRows = await t('layout_components')
        .whereIn('id', ids)
        .del();

      if (affectedRows !== ids.length) {
        throw new NotFoundError(
          `Failed to delete all components. Expected to delete ${ids.length} but deleted ${affectedRows}`,
        );
      }
    };

    return await this.withTransaction(execute, trx);
  };
}

const layoutComponentDao = new LayoutComponentDao(database.instance);
export default layoutComponentDao;
