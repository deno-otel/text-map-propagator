import { ContextAPI } from "./deps.ts";
import { TextMapPropagator } from "./text-map-propagator.ts";

/**
 * No-op implementation of the TextMapPropagator interface.
 */
export class NoOpTextMapPropagator implements TextMapPropagator {
  inject() {
    return;
  }

  extract(context: ContextAPI) {
    return context;
  }

  fields() {
    return [];
  }
}
