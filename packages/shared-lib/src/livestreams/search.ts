import { LivestreamEvent } from "./livestreams"

/**
 * When adding new fields to this type, make sure to add them to the
 * LIVESTREAM_FIELDS_TO_INDEX array.
 */
export type TransformedLivestreamEvent = LivestreamEvent & {
   levelOfStudyNameTags: string[]
   fieldOfStudyNameTags: string[]
   levelOfStudyIdTags: string[]
   fieldOfStudyIdTags: string[]
   languageCode: string
   companyIndustryNameTags: string[]
   /* The start time of the event in milliseconds */
   startTimeMs: number
}

export const LIVESTREAM_FIELDS_TO_INDEX = [
   "id",
   "summary",
   "reasonsToJoinLivestream",
   "reasonsToJoinLivestream_v2",
   "backgroundImageUrl",
   "company",
   "companyId",
   "maxRegistrants",
   "companyLogoUrl",
   "created",
   "withResume",
   "duration",
   "groupIds",
   "interestsIds",
   "levelOfStudyIds",
   "fieldOfStudyIds",
   "isRecording",
   "language",
   "hidden",
   "hasNoTalentPool",
   "test",
   "title",
   "type",
   "start",
   "status",
   "hasStarted",
   "hasEnded",
   "targetCategories",
   "mode",
   "maxHandRaisers",
   "hasNoRatings",
   "recommendedEventIds",
   "activeCallToActionIds",
   "openStream",
   "impressions",
   "recommendedImpressions",
   "speakerSwitchMode",
   "targetCountries",
   "targetUniversities",
   "targetFieldsOfStudy",
   "targetLevelsOfStudy",
   "lastUpdated",
   "universities",
   "questionsDisabled",
   "denyRecordingAccess",
   "jobs",
   "hasJobs",
   "isHybrid",
   "address",
   "externalEventLink",
   "timezone",
   "isFaceToFace",
   "popularity",
   "companySizes",
   "companyIndustries",
   "companyCountries",
   "isDraft",
   "speakers",
   "languageCode",
   "levelOfStudyIdTags",
   "fieldOfStudyIdTags",
   "fieldOfStudyNameTags",
   "levelOfStudyNameTags",
   "startTimeMs",
   "startedAt",
   "endedAt",
   "companyIndustryNameTags",
   "businessFunctionsTagIds",
   "contentTopicsTagIds",
   "linkedCustomJobsTagIds",
] satisfies (keyof TransformedLivestreamEvent)[]

export type FieldToIndexType = (typeof LIVESTREAM_FIELDS_TO_INDEX)[number]

/**
 * Searchable attributes for livestream events to enhance search functionality:
 * The position of attributes in the list determines their priority in the search.
 * They must be a subset of the fields defined in LIVESTREAM_FIELDS_TO_INDEX.
 */
export const LIVESTREAM_SEARCHABLE_ATTRIBUTES = [
   "title",
   "company",
   "companyIndustryNameTags",
   "businessFunctionsTagIds",
   "contentTopicsTagIds",
   "linkedCustomJobsTagIds",
] satisfies FieldToIndexType[]

/**
 * The fields listed below are intended for filtering purposes.
 * They must be a subset of the fields defined in LIVESTREAM_FIELDS_TO_INDEX.
 */
export const LIVESTREAM_FILTERING_FIELDS = [
   "fieldOfStudyIdTags",
   "levelOfStudyIdTags",
   "denyRecordingAccess",
   "groupIds",
   "hasEnded",
   "test",
   "hidden",
   "languageCode",
   "companySizes",
   "companyCountries",
   "companyIndustries",
   "hasJobs",
   "startTimeMs",
   "businessFunctionsTagIds",
   "contentTopicsTagIds",
   "linkedCustomJobsTagIds",
] satisfies FieldToIndexType[]

type FilterFieldType = (typeof LIVESTREAM_FILTERING_FIELDS)[number]

export type ArrayFilterFieldType = Extract<
   FilterFieldType,
   | "businessFunctionsTagIds"
   | "contentTopicsTagIds"
   | "linkedCustomJobsTagIds"
   | "fieldOfStudyIdTags"
   | "levelOfStudyIdTags"
   | "groupIds"
   | "companyIndustries"
   | "companySizes"
   | "companyCountries"
   | "languageCode"
>

export type BooleanFilterFieldType = Extract<
   FilterFieldType,
   "denyRecordingAccess" | "hasJobs" | "hidden" | "test" | "hasEnded"
>

export const LIVESTREAM_REPLICAS = {
   START_ASC: "livestreams_startTimeMs_asc",
   START_DESC: "livestreams_startTimeMs_desc",
} as const

export type LivestreamReplicaType =
   (typeof LIVESTREAM_REPLICAS)[keyof typeof LIVESTREAM_REPLICAS]
