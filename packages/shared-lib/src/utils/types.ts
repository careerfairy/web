interface IDeepPartialArray<T> extends Array<DeepPartial<T>> {}

type DeepPartialObject<T> = {
   [Key in keyof T]?: DeepPartial<T[Key]>
}

export type DeepPartial<T> = T extends Function
   ? T
   : T extends Array<infer U>
   ? IDeepPartialArray<U>
   : T extends object
   ? DeepPartialObject<T>
   : T | undefined

type FlattenObjectPathsHelper<T> = T extends Record<string, unknown>
   ? {
        [K in keyof T]-?: `${K & string}${FlattenObjectPathsHelper<
           T[K]
        > extends ""
           ? ""
           : "."}${FlattenObjectPathsHelper<T[K]>}`
     }[keyof T]
   : ""

/**
 * This utility type recursively flattens all possible paths of an object as string dot notation.
 * @example
 * type Obj = {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *     d: number;
 *   };
 *   e: boolean;
 * };
 * type Paths = FlattenObjectPaths<Obj>;
 * // type Paths = "a.b.c" | "a.d" | "e"
 */
export type FlattenPaths<T> = FlattenObjectPathsHelper<{
   [K in keyof T]: T[K] // This is to convert Interfaces to mapped types
}>
