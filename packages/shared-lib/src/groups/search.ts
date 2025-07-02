import { Group } from "."

/**
 * When adding new fields to this type, make sure to add them to the
 * COMPANY_FIELDS_TO_INDEX array.
 */
export type TransformedGroup = Group & {
   companyIndustriesIdTags: string[]
   companyCountryId: string
   featuredCompanyPriority: number
}

export const COMPANY_FIELDS_TO_INDEX = [
   "id",
   "test",
   "targetedUniversities",
   "targetedFieldsOfStudy",
   "targetedCountries",
   "companyIndustries",
   "companyIndustriesIdTags",
   "groupId",
   "description",
   "logoUrl",
   "extraInfo",
   "partnerGroupIds",
   "universityCode",
   "universityId",
   "universityName",
   "normalizedUniversityName",
   "hidePrivateEventsFromEmbed",
   "privacyPolicyActive",
   "privacyPolicyUrl",
   "inActive",
   "bannerImageUrl",
   "atsAdminPageFlag",
   "careerPageUrl",
   "sparksAdminPageFlag",
   "maxPublicSparks",
   "publicSparks",
   "companyCountry",
   "companyCountryId",
   "companySize",
   "publicProfile",
   "featuredCompanyPriority",
   "hasJobs",
   "hasUpcomingEvents",
   "hasSparks",
   "featured",
   "contentLanguages",
] satisfies (keyof TransformedGroup)[]

export type CompanyFieldToIndexType = (typeof COMPANY_FIELDS_TO_INDEX)[number]

/**
 * Searchable attributes for live stream events to enhance search functionality:
 * The position of attributes in the list determines their priority in the search.
 * They must be a subset of the fields defined in COMPANY_FIELDS_TO_INDEX.
 */
export const COMPANY_SEARCHABLE_ATTRIBUTES = [
   "universityName",
   "normalizedUniversityName",
] satisfies CompanyFieldToIndexType[]

/**
 * The fields listed below are intended for filtering purposes.
 * They must be a subset of the fields defined in COMPANY_FIELDS_TO_INDEX.
 */
export const COMPANY_FILTERING_FIELDS = [
   "companyIndustriesIdTags",
   "test",
   "companyCountryId",
   "companySize",
   "inActive",
   "publicSparks",
   "publicProfile",
   "contentLanguages",
] satisfies CompanyFieldToIndexType[]

type FilterFieldType = (typeof COMPANY_FILTERING_FIELDS)[number]

export type ArrayFilterFieldType = Extract<
   FilterFieldType,
   | "companySize"
   | "companyIndustriesIdTags"
   | "companyCountryId"
   | "id"
   | "contentLanguages"
> &
   "objectID"

export type BooleanFilterFieldType = Extract<
   FilterFieldType,
   "publicProfile" | "publicSparks" | "inActive" | "test"
>

export const COMPANY_REPLICAS = {
   NAME_ASC: "companies_universityName_asc",
   PRIORITY_DESC: "companies_featuredCompanyPriority_desc",
} as const

export type CompanyReplicaType =
   (typeof COMPANY_REPLICAS)[keyof typeof COMPANY_REPLICAS]
