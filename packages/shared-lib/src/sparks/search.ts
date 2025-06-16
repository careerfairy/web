import { Spark } from "./sparks"

/**
 * When adding new fields to this type, make sure to add them to the
 * SPARK_FIELDS_TO_INDEX array.
 */
export type TransformedSpark = Spark & {
   createdAtMs: number
   publishedAtMs: number
   groupPublicSparks: boolean
}

export const SPARK_FIELDS_TO_INDEX = [
   "id",
   "addedToFeedAt",
   "category",
   "createdAt",
   "creator",
   "group",
   "languageTagIds",
   "language",
   "publishedAt",
   "question",
   "updatedAt",
   "video",
   "published",
   "createdAtMs",
   "contentTopicsTagIds",
   "linkedCustomJobsTagIds",
   "groupPublicSparks",
] satisfies (keyof TransformedSpark)[]

export type FieldToIndexType = (typeof SPARK_FIELDS_TO_INDEX)[number]

/**
 * Searchable attributes for sparks to enhance search functionality:
 * The position of attributes in the list determines their priority in the search.
 * They must be a subset of the fields defined in SPARK_FIELDS_TO_INDEX.
 */
export const SPARK_SEARCHABLE_ATTRIBUTES = [
   "contentTopicsTagIds",
   "languageTagIds",
   "language",
   "linkedCustomJobsTagIds",
] satisfies FieldToIndexType[]

/**
 * The fields listed below are intended for filtering purposes.
 * They must be a subset of the fields defined in SPARK_FIELDS_TO_INDEX.
 */
export const SPARK_FILTERING_FIELDS = [
   "groupPublicSparks",
   "published",
   "createdAtMs",
   "contentTopicsTagIds",
   "linkedCustomJobsTagIds",
   "languageTagIds",
   "language",
   "group",
] satisfies FieldToIndexType[]

type FilterFieldType = (typeof SPARK_FILTERING_FIELDS)[number]

export type ArrayFilterFieldType = Extract<
   FilterFieldType,
   "contentTopicsTagIds" | "languageTagIds"
>

export type BooleanFilterFieldType = Extract<
   FilterFieldType,
   "published" | "groupPublicSparks"
>

export const SPARK_REPLICAS = {
   PUBLISHED_AT_DESC: "sparks_publishedAtMs_desc",
   START_ASC: "sparks_createdAtMs_asc",
   START_DESC: "sparks_createdAtMs_desc",
} as const

export type SparkReplicaType =
   (typeof SPARK_REPLICAS)[keyof typeof SPARK_REPLICAS]
