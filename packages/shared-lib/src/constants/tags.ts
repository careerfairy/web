import { OptionGroup } from "../commonTypes"
import { languageOptionCodes } from "./forms"

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
