import { LivestreamEvent } from "./livestreams"

export type TransformedLivestreamEvent = LivestreamEvent & {
   levelOfStudyNameTags: string[]
   fieldOfStudyNameTags: string[]
   levelOfStudyIdTags: string[]
   fieldOfStudyIdTags: string[]
   languageCode: string
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
   "companyIndustries",
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
] satisfies FieldToIndexType[]
