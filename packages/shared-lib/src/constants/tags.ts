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
   BusinessDevelopment: "Business development",
   Consulting: "Consulting",
   DataAnalytics: "Data & analytics",
   Finance: "Finance",
   InformationTechnology: "Information technology",
   Legal: "Legal",
   Marketing: "Marketing",
   Operations: "Operations",
   Other: "Other",
   ResearchDevelopment: "Research & development",
   ProductManagement: "Product management",
   SupplyChainLogistics: "Supply chain & logistics",
}

export const BusinessFunctionsTagValues = Object.entries(
   BusinessFunctionsTags
).map(([id, name]) => ({
   id,
   name,
})) satisfies OptionGroup[]

export const ContentTopicsTags = {
   ApplicationProcess: "Application process",
   CompanyCulture: "Company culture",
   DayInTheLife: "Day in the life",
   Events: "Events",
   Jobs: "Jobs",
   Role: "Role",
}

export const ContentTopicsTagValues = Object.entries(ContentTopicsTags).map(
   ([id, name]) => ({
      id,
      name,
   })
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

export const groupTags = (tagIds: string[]): GroupedTags => {
   const businessFunctions = BusinessFunctionsTagValues.filter((bf) =>
      tagIds.includes(bf.id)
   )
   const contentTopics = ContentTopicsTagValues.filter((ct) =>
      tagIds.includes(ct.id)
   )
   const languages = languageOptionCodes.filter((lang) =>
      tagIds.includes(lang.id)
   )

   return {
      businessFunctions: Object.fromEntries(
         businessFunctions
            .filter((option) => {
               return tagIds.includes(option.id)
            })
            .map((bf) => {
               return [bf.id, bf]
            })
      ),
      contentTopics: Object.fromEntries(
         contentTopics
            .filter((option) => {
               return tagIds.includes(option.id)
            })
            .map((ct) => {
               return [ct.id, ct]
            })
      ),
      language: Object.fromEntries(
         languages
            .filter((option) => {
               return tagIds.includes(option.id)
            })
            .map((l) => {
               return [l.id, l]
            })
      ),
   }
}
