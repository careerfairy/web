import { OptionGroup } from "../commonTypes"
import { languageOptionCodes } from "./forms"

export type GroupedOptionGroup = {
   [id: string]: OptionGroup
}

export type GroupedTags = {
   businessFunctions: GroupedOptionGroup
   contentTopics: GroupedOptionGroup
   language: GroupedOptionGroup
}

export const BusinessFunctionsTags = {
   BusinessDevelopment: {
      id: "BusinessDevelopment",
      name: "Business development",
   },
   Consulting: {
      id: "Consulting",
      name: "Consulting",
   },
   DataAnalytics: {
      id: "DataAnalytics",
      name: "Data & analytics",
   },
   Finance: {
      id: "Finance",
      name: "Finance",
   },
   InformationTechnology: {
      id: "InformationTechnology",
      name: "Information technology",
   },
   Legal: {
      id: "Legal",
      name: "Legal",
   },
   Marketing: {
      id: "Marketing",
      name: "Marketing",
   },
   Operations: {
      id: "Operations",
      name: "Operations",
   },
   Other: {
      id: "Other",
      name: "Other",
   },
   ResearchDevelopment: {
      id: "ResearchDevelopment",
      name: "Research & development",
   },
   ProductManagement: {
      id: "ProductManagement",
      name: "Product management",
   },
   SupplyChainLogistics: {
      id: "SupplyChainLogistics",
      name: "Supply chain & logistics",
   },
   Accounting: {
      id: "Accounting",
      name: "Accounting",
   },
   HumanResources: {
      id: "HumanResources",
      name: "Human resources (HR)",
   },
} as const

export const BusinessFunctionsTagValues = Object.entries(
   BusinessFunctionsTags
).map(([, entry]) => entry) satisfies OptionGroup[]

export const BusinessFunctionTagsOptions = BusinessFunctionsTagValues.map(
   (tag) => ({
      id: tag.id,
      value: tag.name,
   })
)

export const ContentTopicsTags = {
   ApplicationProcess: {
      id: "ApplicationProcess",
      name: "Application process",
   },
   CompanyCulture: {
      id: "CompanyCulture",
      name: "Company culture",
   },
   DayInTheLife: {
      id: "DayInTheLife",
      name: "Day in the life",
   },
   Events: {
      id: "Events",
      name: "Events",
   },
   Jobs: {
      id: "Jobs",
      name: "Jobs",
   },
   Role: {
      id: "Role",
      name: "Role",
   },
} as const

export type ContentTopicTagId =
   (typeof ContentTopicsTags)[keyof typeof ContentTopicsTags]["id"]

export type BusinessFunctionTagId =
   (typeof BusinessFunctionsTags)[keyof typeof BusinessFunctionsTags]["id"]

export const ContentTopicsTagValues = Object.entries(ContentTopicsTags).map(
   ([, entry]) => entry
) satisfies OptionGroup[]

export const TagValues: OptionGroup[] = [
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
   languageOptionCodes,
].flat()

export const TagValuesLookup = Object.fromEntries(
   TagValues.map((tag) => [tag.id, tag.name])
)

export const TagsLookup = Object.fromEntries(
   TagValues.map((tag) => [tag.id, tag])
)

export const getBusinessTagsByIds = (tagIds: string[]): OptionGroup[] => {
   const tagIdSet = new Set(tagIds)

   return BusinessFunctionsTagValues.filter((tag) => tagIdSet.has(tag.id)).map(
      (tag) => ({
         id: tag.id,
         name: tag.name,
      })
   )
}

export type ContentHitsCount = {
   sparks: number
   livestreams: number
}
export type ContentHits = {
   [tagId: string]: {
      contentHits: number
      count: ContentHitsCount
   }
}

export type TagsContentHits = {
   businessFunctions: {
      hits: ContentHits
   }
   contentTopics: {
      hits: ContentHits
   }
   languages: {
      hits: ContentHits
   }
}

export const getGroupedTags = (tagIds: string[]): GroupedTags => {
   const businessFunctions = BusinessFunctionsTagValues.filter((bf) =>
      tagIds.includes(bf.id)
   ).map((bf) => {
      return [bf.id, bf]
   })

   const contentTopics = ContentTopicsTagValues.filter((ct) =>
      tagIds.includes(ct.id)
   ).map((ct) => {
      return [ct.id, ct]
   })

   const languages = languageOptionCodes
      .filter((lang) => tagIds.includes(lang.id))
      .map((l) => {
         return [l.id, l]
      })

   return {
      businessFunctions: Object.fromEntries(businessFunctions),
      contentTopics: Object.fromEntries(contentTopics),
      language: Object.fromEntries(languages),
   }
}
