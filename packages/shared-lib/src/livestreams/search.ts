import { LivestreamEvent } from "./livestreams"

export type TransformedLivestreamEvent = LivestreamEvent & {
   levelOfStudyNameTags: string[]
   fieldOfStudyNameTags: string[]
   levelOfStudyIdTags: string[]
   fieldOfStudyIdTags: string[]
   languageCode: string
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
] satisfies (keyof TransformedLivestreamEvent)[]

type FieldToIndexType = (typeof LIVESTREAM_FIELDS_TO_INDEX)[number]

/**
 * Searchable attributes for livestream events to enhance search functionality:
 * - `title`: Livestream event title.
 * - `company`: Hosting company.
 * - `levelOfStudyNameTags`: Education level tags for event filtering.
 * - `fieldOfStudyNameTags`: Area of interest tags for event filtering.
 * - `companyIndustries`: Hosting company's industries for industry-based filtering.
 */
export const LIVESTREAM_SEARCHABLE_ATTRIBUTES = [
   "title",
   "company",
   "fieldOfStudyNameTags",
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
   "start",
   "groupIds",
   "hasEnded",
   "test",
   "hidden",
   "languageCode",
   "companySizes",
   "companyCountries",
   "companyIndustries",
   "hasJobs",
] satisfies FieldToIndexType[]
