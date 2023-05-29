import type { ContextAPI } from "./deps.ts";

/**
 * A function that sets a key-value pair on a carrier.
 */
export type SetterFunction<Carrier = unknown> = (
  carrier: Carrier,
  key: string,
  value: string,
) => void;

/**
 * A function that returns the value of a key from a carrier.
 */
export type GetterFunction<Carrier = unknown> = (
  carrier: Carrier,
  key: string,
) => string | null;

/**
 * A function that returns the keys of a carrier.
 */
export type KeysFunction<Carrier = unknown> = (carrier: Carrier) => string[];

/**
 * The TextMapPropagator interface provides methods for injecting and extracting
 * context into and from carriers that travel in-band across process boundaries.
 *
 * @typeParam Carrier - The type of the carrier... this is often an HTTP Request or Response object.
 */
export interface TextMapPropagator<Carrier = unknown> {
  /**
   * Injects context into the given carrier.
   */
  inject(
    context: ContextAPI,
    carrier: Carrier,
    setter?: SetterFunction<Carrier>,
  ): void;
  /**
   * Extracts context from the given carrier. As with all Context modifiers, a new instance of the Context will be returned.
   */
  extract(
    context: ContextAPI,
    carrier: Carrier,
    getter?: GetterFunction<Carrier>,
  ): ContextAPI;

  /**
   * Returns the keys that this TextMapPropagator will propagate.
   */
  fields(): string[];
}
