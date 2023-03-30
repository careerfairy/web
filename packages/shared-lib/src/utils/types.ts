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
 * type Person = {
 *   name: string;
 *   age: number;
 *   address: {
 *   street: string;
 *   city: string;
 * };
 *
 * type Paths = FlattenObjectPaths<Person>;
 * // type Paths = "name" | "age" | "address.street" | "address.city"
 */
export type FlattenPaths<T> = FlattenObjectPathsHelper<{
   [K in keyof T]: T[K] // This is to convert Interfaces to mapped types
}>

export type Logger = {
   debug: (...args: any[]) => void
   info: (...args: any[]) => void
   warn: (...args: any[]) => void
   error: (...args: any[]) => void
}
