import { ContextAPI } from "https://deno.land/x/otel_context_api@v1.0.0/context-api.ts";
import {
  GetterFunction,
  SetterFunction,
  TextMapPropagator,
} from "./text-map-propagator.ts";

/**
 * A composite propagator that can be used to combine multiple propagators into a single propagator.
 *
 * The propagators have to be of the same type.
 */
export class CompositePropagator<Carrier = unknown>
  implements TextMapPropagator<Carrier> {
  private _propagators: TextMapPropagator<Carrier>[] = [];

  constructor(propagators: TextMapPropagator<Carrier>[]) {
    this._propagators = propagators;
  }

  inject(
    context: ContextAPI,
    carrier: Carrier,
    setter: SetterFunction<Carrier> | undefined,
  ): void {
    this._propagators.forEach((propagator) => {
      propagator.inject(context, carrier, setter);
    });
  }

  extract(
    context: ContextAPI,
    carrier: Carrier,
    getter: GetterFunction<Carrier> | undefined,
  ): ContextAPI {
    return this._propagators.reduce((ctx, propagator) => {
      return propagator.extract(ctx, carrier, getter);
    }, context);
  }

  fields(): string[] {
    return this._propagators.reduce((fields, propagator) => {
      return [...fields, ...propagator.fields()];
    }, [] as string[]);
  }
}
