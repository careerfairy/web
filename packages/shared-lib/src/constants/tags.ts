import { OptionGroup } from "../commonTypes"
import { languageOptionCodes } from "./forms"

export type GroupedTags = {
   businessFunctions: {
      [id: string]: OptionGroup
   }
   contentTopics: {
      [id: string]: OptionGroup
   }
   language: {
      [id: string]: OptionGroup
   }
}

export const BusinessFunctionsTagValues: OptionGroup[] = [
   {
      id: "BusinessDevelopment",
      name: "Business development",
   },
   {
      id: "Consulting",
      name: "Consulting",
   },
   {
      id: "DataAnalytics",
      name: "Data & analytics",
   },
   {
      id: "Finance",
      name: "Finance",
   },
   {
      id: "InformationTechnology",
      name: "Information technology",
   },
   {
      id: "Legal",
      name: "Legal",
   },
   {
      id: "Marketing",
      name: "Marketing",
   },
   {
      id: "Operations",
      name: "Operations",
   },
   {
      id: "Other",
      name: "Other",
   },
   {
      id: "ResearchDevelopment",
      name: "Research & development",
   },
   {
      id: "ProductManagement",
      name: "Product management",
   },
   {
      id: "SupplyChainLogistics",
      name: "Supply chain & logistics",
   },
]

export const ContentTopicsTagValues: OptionGroup[] = [
   {
      id: "ApplicationProcess",
      name: "Application process",
   },
   {
      id: "CompanyCulture",
      name: "Company culture",
   },
   {
      id: "DayInTheLife",
      name: "Day in the life",
   },
   {
      id: "Events",
      name: "Events",
   },
   {
      id: "Jobs",
      name: "Jobs",
   },
   {
      id: "Role",
      name: "Role",
   },
]

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

export type ContentHits = {
   [tagId: string]: {
      contentHits: number
      count: {
         sparks: number
         livestreams: number
      }
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
