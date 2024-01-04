import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Index } from "./searchIndexGenerator"

const livestreamIndex = {
   collectionPath: "livestreams",
   indexName: "livestreams" as const, // To allow inferring the type of the index name
   fields: [
      "id",
      "summary",
      "reasonsToJoinLivestream",
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
   ],
} satisfies Index<LivestreamEvent>

export const knownIndexes = {
   [livestreamIndex.indexName]: livestreamIndex,
} as const satisfies Record<string, Index>

export type IndexName = keyof typeof knownIndexes

export const indexNames = Object.keys(knownIndexes) as IndexName[]
