import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   LIVESTREAM_FIELDS_TO_INDEX,
   LIVESTREAM_FILTERING_FIELDS,
   LIVESTREAM_SEARCHABLE_ATTRIBUTES,
   TransformedLivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/search"
import { Index } from "./searchIndexGenerator"
import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import { CompanyIndustryValuesLookup } from "@careerfairy/shared-lib/constants/forms"

const livestreamIndex = {
   collectionPath: "livestreams",
   indexName: "livestreams" as const, // To allow inferring the type of the index name
   fields: removeDuplicates(LIVESTREAM_FIELDS_TO_INDEX),
   shouldIndex: (doc) => !doc.test, // Don't index test livestreams
   fullIndexSyncQueryConstraints: (collectionRef) =>
      collectionRef.where("test", "==", false),
   transformData: (data) => ({
      ...data,
      languageCode: data.language?.code ?? null,
      fieldOfStudyNameTags:
         data.targetFieldsOfStudy?.map((field) => field.name) ?? [],
      levelOfStudyNameTags:
         data.targetLevelsOfStudy?.map((level) => level.name) ?? [],
      fieldOfStudyIdTags:
         data.targetFieldsOfStudy?.map((field) => field.id) ?? [],
      levelOfStudyIdTags:
         data.targetLevelsOfStudy?.map((level) => level.id) ?? [],
      startTimeMs: data.start?.toDate?.().getTime() ?? null,
      companyIndustryNameTags:
         data.companyIndustries?.map(
            (industry) => CompanyIndustryValuesLookup[industry] ?? industry
         ) ?? [],
   }),
   settings: {
      attributesForFaceting: LIVESTREAM_FILTERING_FIELDS,
      searchableAttributes: LIVESTREAM_SEARCHABLE_ATTRIBUTES,
   },
} satisfies Index<LivestreamEvent, TransformedLivestreamEvent>

export const knownIndexes = {
   [livestreamIndex.indexName]: livestreamIndex,
} as const satisfies Record<string, Index>

export type IndexName = keyof typeof knownIndexes

export const indexNames = Object.keys(knownIndexes) as IndexName[]
