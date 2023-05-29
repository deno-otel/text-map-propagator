# OpenTelemetry TextMapPropagator

This module contains the API for the [OpenTelemetry TextMapPropagator](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#textmap-propagator)

It also contains an implementation of a `NoOpTextMapPropagator`, which does nothing.

In addition, there's an implementation of a `CompositePropagator` which provides the ability to combine multiple `TextMapPropagator`s into one.

## Deno Module

The Deno module is available at https://deno.land/x/otel_text_map_propagator
