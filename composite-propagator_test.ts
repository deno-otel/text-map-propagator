// deno-lint-ignore-file no-unused-vars no-explicit-any
import { ContextAPI } from "https://deno.land/x/otel_context_api@v1.0.0/context-api.ts";
import {
  GetterFunction,
  SetterFunction,
  TextMapPropagator,
} from "./text-map-propagator.ts";
import { CompositePropagator } from "./composite-propagator.ts";
import { assertEquals } from "https://deno.land/std@0.177.1/testing/asserts.ts";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.189.0/testing/bdd.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  spy,
  stub,
} from "https://deno.land/std@0.189.0/testing/mock.ts";
import { Context } from "../otel-context-api/mod.ts";

const mockGetter: GetterFunction<unknown> = () => {
  return "";
};

const mockSetter: SetterFunction<unknown> = () => {};

const A_SYMBOL = Symbol("a");
const B_SYMBOL = Symbol("b");

class MockTextMapPropagator implements TextMapPropagator {
  inject(
    context: ContextAPI,
    carrier: any,
    setter?: SetterFunction<any>,
  ): void {
    return;
  }
  extract(
    context: ContextAPI,
    carrier: any,
    getter?: GetterFunction<any>,
  ): ContextAPI {
    return context;
  }
  fields(): string[] {
    return [];
  }
}

describe("CompositePropagator", () => {
  it("supports zero propagators", () => {
    const propagator = new CompositePropagator([]);
    assertEquals(propagator.fields(), []);
    assertEquals(
      propagator.inject({} as ContextAPI, {}, mockSetter),
      undefined,
    );
    assertEquals(
      propagator.extract({} as ContextAPI, {}, mockGetter),
      {} as ContextAPI,
    );
  });

  it("supports one propagator", () => {
    const mockPropagator = new MockTextMapPropagator();
    const injectSpy = spy(mockPropagator, "inject");
    const extractSpy = spy(mockPropagator, "extract");
    const fieldsSpy = spy(mockPropagator, "fields");

    const propagator = new CompositePropagator([mockPropagator]);
    assertEquals(propagator.fields(), []);
    assertEquals(
      propagator.inject({} as ContextAPI, {}, mockSetter),
      undefined,
    );
    assertEquals(
      propagator.extract({} as ContextAPI, {}, mockGetter),
      {} as ContextAPI,
    );

    assertSpyCalls(injectSpy, 1);
    assertSpyCalls(extractSpy, 1);
    assertSpyCalls(fieldsSpy, 1);
  });

  it("supports two propagators", () => {
    const mockPropagator1 = new MockTextMapPropagator();
    const injectSpy1 = spy(mockPropagator1, "inject");
    const extractSpy1 = spy(mockPropagator1, "extract");
    const fieldsSpy1 = spy(mockPropagator1, "fields");

    const mockPropagator2 = new MockTextMapPropagator();
    const injectSpy2 = spy(mockPropagator2, "inject");
    const extractSpy2 = spy(mockPropagator2, "extract");
    const fieldsSpy2 = spy(mockPropagator2, "fields");

    const propagator = new CompositePropagator([
      mockPropagator1,
      mockPropagator2,
    ]);
    assertEquals(propagator.fields(), []);
    assertEquals(
      propagator.inject({} as ContextAPI, {}, mockSetter),
      undefined,
    );
    assertEquals(
      propagator.extract({} as ContextAPI, {}, mockGetter),
      {} as ContextAPI,
    );

    assertSpyCalls(injectSpy1, 1);
    assertSpyCalls(extractSpy1, 1);
    assertSpyCalls(fieldsSpy1, 1);
    assertSpyCalls(injectSpy2, 1);
    assertSpyCalls(extractSpy2, 1);
    assertSpyCalls(fieldsSpy2, 1);
  });

  it("composes fields", () => {
    const mockPropagator1 = new MockTextMapPropagator();
    stub(mockPropagator1, "fields", returnsNext([["a"]]));

    const mockPropagator2 = new MockTextMapPropagator();
    stub(mockPropagator2, "fields", returnsNext([["b"]]));

    const propagator = new CompositePropagator([
      mockPropagator1,
      mockPropagator2,
    ]);
    assertEquals(propagator.fields(), ["a", "b"]);
  });

  it("injects via all propagators", () => {
    const mockPropagator1 = new MockTextMapPropagator();

    stub(mockPropagator1, "inject", (ctx: ContextAPI, car: any) => {
      car.a = ctx.getValue(A_SYMBOL);
    });
    const mockPropagator2 = new MockTextMapPropagator();

    stub(mockPropagator2, "inject", (ctx: ContextAPI, car: any) => {
      car.b = ctx.getValue(B_SYMBOL);
    });
    let context = new Context();
    context = context.setValue(A_SYMBOL, "a");
    context = context.setValue(B_SYMBOL, "b");

    const carrier = {};
    const propagator = new CompositePropagator([
      mockPropagator1,
      mockPropagator2,
    ]);

    propagator.inject(context, carrier, mockSetter);

    assertEquals(carrier, { a: "a", b: "b" });
  });

  it("extracts via all propagators", () => {
    const mockPropagator1 = new MockTextMapPropagator();
    stub(mockPropagator1, "extract", (ctx: ContextAPI, car: any) => {
      return ctx.setValue(A_SYMBOL, car.a);
    });

    const mockPropagator2 = new MockTextMapPropagator();
    stub(mockPropagator2, "extract", (ctx: ContextAPI, car: any) => {
      return ctx.setValue(B_SYMBOL, car.b);
    });

    const carrier = { a: 1, b: 2 };
    const propagator = new CompositePropagator([
      mockPropagator1,
      mockPropagator2,
    ]);

    const context = propagator.extract(new Context(), carrier, mockGetter);

    assertEquals(context.getValue(A_SYMBOL), 1);
    assertEquals(context.getValue(B_SYMBOL), 2);
  });
});
