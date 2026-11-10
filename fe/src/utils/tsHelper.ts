/**
 * A helper to create a type that is either a base type or a combination of the base type and another type.
 */
export type WithBase<B, T> = B | (T extends unknown ? B & T : never);
