import { CompanyIndustryValuesLookup } from "@careerfairy/shared-lib/constants/forms"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   LIVESTREAM_FIELDS_TO_INDEX,
   LIVESTREAM_FILTERING_FIELDS,
   LIVESTREAM_REPLICAS,
   LIVESTREAM_SEARCHABLE_ATTRIBUTES,
   TransformedLivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/search"

import { Group } from "@careerfairy/shared-lib/groups"
import {
   COMPANY_FIELDS_TO_INDEX,
   COMPANY_FILTERING_FIELDS,
   COMPANY_REPLICAS,
   COMPANY_SEARCHABLE_ATTRIBUTES,
   TransformedGroup,
} from "@careerfairy/shared-lib/groups/search"
import {
   SPARK_FIELDS_TO_INDEX,
   SPARK_FILTERING_FIELDS,
   SPARK_REPLICAS,
   SPARK_SEARCHABLE_ATTRIBUTES,
   TransformedSpark,
} from "@careerfairy/shared-lib/sparks/search"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import { generateFeaturedCompanyPriority } from "@careerfairy/shared-lib/utils/groups"
import { Index } from "./searchIndexGenerator"

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
      replicas: [LIVESTREAM_REPLICAS.START_DESC, LIVESTREAM_REPLICAS.START_ASC],
   },
} satisfies Index<LivestreamEvent, TransformedLivestreamEvent>

const sparkIndex = {
   collectionPath: "sparks",
   indexName: "sparks" as const, // To allow inferring the type of the index name
   fields: removeDuplicates(SPARK_FIELDS_TO_INDEX),
   // Leaving these as undefined as the CI does not build
   shouldIndex: undefined,
   fullIndexSyncQueryConstraints: undefined,
   transformData: (data) => ({
      ...data,
      createdAtMs: data.createdAt?.toDate?.().getTime() ?? null,
      groupPublicSparks: Boolean(data.group?.publicSparks),
      publishedAtMs: data.publishedAt?.toDate?.().getTime() ?? null,
   }),
   settings: {
      attributesForFaceting: SPARK_FILTERING_FIELDS,
      searchableAttributes: SPARK_SEARCHABLE_ATTRIBUTES,
      replicas: [
         SPARK_REPLICAS.START_DESC,
         SPARK_REPLICAS.START_ASC,
         SPARK_REPLICAS.PUBLISHED_AT_DESC,
      ],
   },
} satisfies Index<Spark, TransformedSpark>

const companyIndex = {
   collectionPath: "careerCenterData",
   indexName: "companies" as const, // To allow inferring the type of the index name
   fields: removeDuplicates(COMPANY_FIELDS_TO_INDEX),
   // Leaving these as undefined as the CI does not build
   shouldIndex: (doc) => !doc.test, // Don't index test groups,
   fullIndexSyncQueryConstraints: (collectionRef) =>
      collectionRef.where("test", "==", false),
   transformData: (data) => ({
      ...data,
      companyCountryId: data.companyCountry?.id ?? null,
      companyIndustriesIdTags:
         data.companyIndustries?.map((industry) => industry.id) ?? [],
      featuredCompanyPriority: generateFeaturedCompanyPriority(data),
   }),
   settings: {
      attributesForFaceting: COMPANY_FILTERING_FIELDS,
      searchableAttributes: COMPANY_SEARCHABLE_ATTRIBUTES,
      replicas: [COMPANY_REPLICAS.NAME_ASC],
   },
} satisfies Index<Group, TransformedGroup>

export const knownIndexes = {
   [livestreamIndex.indexName]: livestreamIndex,
   [sparkIndex.indexName]: sparkIndex,
   [companyIndex.indexName]: companyIndex,
} as const satisfies Record<string, Index>

export type IndexName = keyof typeof knownIndexes

export const indexNames = Object.keys(knownIndexes) as IndexName[]
