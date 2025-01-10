import { z } from "zod";

export type _ExtractRecursiveIds<
  T,
  Prop extends string,
  Prefix extends string = "",
> = T extends {
  id: infer ID extends string;
  items?: infer ITEMS extends readonly unknown[] | unknown[];
}
  ?
      | (Prefix extends "" ? ID : `${Prefix}.${ID}`)
      | (ITEMS extends readonly any[] | any[]
          ? _ExtractRecursiveIds<
              ITEMS[number],
              Prop,
              Prefix extends "" ? ID : `${Prefix}.${ID}`
            >
          : never)
  : never;

export type ExtractRecursiveIds<
  T,
  Prop extends string,
  Prefix extends string = "",
> =
  IsValidDefinitionsInterface<T, Prop> extends true
    ? _ExtractRecursiveIds<T[keyof T], Prop, Prefix>
    : IsValidDefinitionsInterface<T, Prop>;

export type FindRecursivePropValue<
  T,
  P extends string,
  Prop extends string,
> = T extends any
  ? T extends readonly any[] | any[]
    ? FindRecursivePropValue<T[any], P, Prop>
    : T extends { id: infer ID extends string }
      ? P extends `${infer Head}.${infer Rest}`
        ? ID extends Head
          ? T extends { items: infer ITEMS extends readonly any[] | any[] }
            ? FindRecursivePropValue<ITEMS, Rest, Prop>
            : never
          : never
        : ID extends P
          ? T extends Partial<Record<Prop, infer D>>
            ? D
            : never
          : never
      : never
  : never;

type Error<Message extends string> = Message & { __error__: never };

type AllowedKeys<Prop> = "id" | "items" | Prop;

type HasInvalidKeys<T, Prop> =
  Exclude<keyof T, AllowedKeys<Prop>> extends never ? false : true;

type InvalidKeys<T, Prop> = Exclude<keyof T, AllowedKeys<Prop>>;

type GetLastSegment<S extends string> = S extends `${infer _Rest}.${infer Last}`
  ? GetLastSegment<Last>
  : S;

type NewPrefix<Prefix extends string, ID extends string> = Prefix extends ""
  ? ID
  : GetLastSegment<Prefix> extends ID
    ? Prefix
    : `${Prefix}.${ID}`;

type IsValidItems<
  T,
  Prefix extends string,
  ID extends string,
  Prop extends string,
> = T extends {
  items?: infer Items;
}
  ? Items extends readonly any[] | any[]
    ? IsValidDefinitionsArray<Items, NewPrefix<Prefix, ID>, Prop>
    : Items extends undefined
      ? true
      : Error<`At ${NewPrefix<Prefix, ID>}: 'items' must be an array`>
  : true;

type IsValidDefinitionsFormat<
  T,
  Prop extends string,
  Prefix extends string = "",
> = T extends {
  id: infer ID extends string;
}
  ? HasInvalidKeys<T, Prop> extends true
    ? Error<`At ${NewPrefix<Prefix, ID>}: Invalid properties present: ${InvalidKeys<T, Prop> extends string ? InvalidKeys<T, Prop> : never}`>
    : T extends Partial<Record<Prop, infer M>>
      ? M extends object
        ? IsValidItems<T, Prefix, ID, Prop>
        : Error<`At ${NewPrefix<Prefix, ID>}: '${Prop}' must be an object`>
      : IsValidItems<T, Prefix, ID, Prop>
  : Error<`Missing 'id' at ${Prefix extends "" ? "<root>" : Prefix}`>;

type IsValidDefinitionsArray<
  T extends readonly any[] | any[],
  Prefix extends string,
  Prop extends string,
  IndexArray extends any[] = [],
> = T extends [infer First, ...infer Rest]
  ? IsValidDefinitionsFormat<
      First,
      Prop,
      `${Prefix}[${IndexArray["length"]}]`
    > extends true
    ? IsValidDefinitionsArray<Rest, Prefix, Prop, [...IndexArray, any]>
    : IsValidDefinitionsFormat<
        First,
        Prop,
        `${Prefix}[${IndexArray["length"]}]`
      >
  : true;

type IsValidDefinitionsInterface<T, Prop extends string> = {
  [K in keyof T]: IsValidDefinitionsFormat<T[K], Prop, "">;
}[keyof T] extends true
  ? true
  : {
      [K in keyof T]: IsValidDefinitionsFormat<T[K], Prop, "">;
    };

type Literal = z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
type Json = Literal | { [key: string]: Json } | Json[];

export const stringToJSONSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as z.infer<z.ZodType<Json, z.ZodTypeDef, Json>>;
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});
