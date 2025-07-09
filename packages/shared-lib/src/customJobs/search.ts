import { CustomJob } from "./customJobs"

/**
 * When adding new fields to this type, make sure to add them to the
 * CUSTOM_JOB_FIELDS_TO_INDEX array.
 */
export type TransformedCustomJob = CustomJob & {
   locationNameTags?: string[]
   locationIdTags?: string[]
   normalizedLocationIds?: string[]
   normalizedJobType?: string
   deadlineAtMs?: number
}

export const CUSTOM_JOB_FIELDS_TO_INDEX = [
   "id",
   "title",
   "description",
   "businessFunctionsTagIds",
   "deleted",
   "documentType",
   "group",
   "groupId",
   "isPermanentlyExpired",
   "jobLocation",
   "livestreams",
   "postingUrl",
   "published",
   "salary",
   "sparks",
   "workplace",
   "deadline",
   "createdAt",
   "updatedAt",
   "jobType",
   "locationNameTags",
   "locationIdTags",
   "normalizedJobType",
   "deadlineAtMs",
   "normalizedLocationIds",
] satisfies (keyof TransformedCustomJob)[]

export type CustomJobFieldToIndexType =
   (typeof CUSTOM_JOB_FIELDS_TO_INDEX)[number]

/**
 * Searchable attributes for custom jobs to enhance search functionality:
 * The position of attributes in the list determines their priority in the search.
 * They must be a subset of the fields defined in CUSTOM_JOB_FIELDS_TO_INDEX.
 */
export const CUSTOM_JOB_SEARCHABLE_ATTRIBUTES = [
   "id",
   "title",
   "group",
   "jobLocation",
   "locationNameTags",
   "businessFunctionsTagIds",
   "jobType",
   "description", // We might not want to index this field, as it might bring noise to the search results
   "normalizedJobType",
   "workplace",
   "normalizedLocationIds",
] satisfies CustomJobFieldToIndexType[]

/**
 * The fields listed below are intended for filtering purposes.
 * They must be a subset of the fields defined in CUSTOM_JOB_FIELDS_TO_INDEX.
 */
export const CUSTOM_JOB_FILTERING_FIELDS = [
   "id",
   "title",
   "description",
   "jobLocation",
   "workplace",
   "jobType",
   "normalizedJobType",
   "locationIdTags",
   "businessFunctionsTagIds",
   "published",
   "isPermanentlyExpired",
   "deleted",
   "normalizedLocationIds",
] satisfies CustomJobFieldToIndexType[]

type FilterFieldType = (typeof CUSTOM_JOB_FILTERING_FIELDS)[number]

export type ArrayFilterFieldType = Extract<
   FilterFieldType,
   | "locationIdTags"
   | "businessFunctionsTagIds"
   | "normalizedJobType"
   | "normalizedLocationIds"
> &
   "objectID"

export type BooleanFilterFieldType = Extract<
   FilterFieldType,
   "deleted" | "isPermanentlyExpired" | "published"
>

export const CUSTOM_JOB_REPLICAS = {
   DEADLINE_ASC: "customJobs_deadlineAtMs_asc",
} as const

export type CustomJobReplicaType =
   (typeof CUSTOM_JOB_REPLICAS)[keyof typeof CUSTOM_JOB_REPLICAS]
