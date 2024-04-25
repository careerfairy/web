import uniq from "lodash.uniq"
import { Group } from "../groups"
import { getArrayDifference } from "../utils"
import { LivestreamEvent } from "./livestreams"

type MetaData = Pick<
   LivestreamEvent,
   | "companyCountries"
   | "companyIndustries"
   | "companySizes"
   | "companyTargetedCountries"
   | "companyTargetedFieldsOfStudies"
   | "companyTargetedUniversities"
>

export const getMetaDataFromEventHosts = (eventHosts: Group[]): MetaData => {
   const companies = eventHosts?.filter((group) => !group.universityCode)

   let groupsToGetMetadataFrom = eventHosts

   if (companies?.length > 0) {
      // if there is at least one company, we want to get the metadata ONLY from the companies, not the universities
      groupsToGetMetadataFrom = companies
   }

   // Aggregate all the metadata from the groups
   const meta = groupsToGetMetadataFrom.reduce<MetaData>(
      (acc, group) => {
         if (group.companyCountry?.id) {
            acc.companyCountries = [
               ...acc.companyCountries,
               group.companyCountry.id,
            ]
         }

         if (group.companyIndustries?.length) {
            acc.companyIndustries = [
               ...acc.companyIndustries,
               ...group.companyIndustries.map(({ id }) => id),
            ]
         }

         if (group.companySize) {
            acc.companySizes = [...acc.companySizes, group.companySize]
         }

         if (group.targetedCountries) {
            acc.companyTargetedCountries = [
               ...acc.companyTargetedCountries,
               ...group.targetedCountries.map(({ id }) => id),
            ]
         }

         if (group.targetedFieldsOfStudy) {
            acc.companyTargetedFieldsOfStudies = [
               ...acc.companyTargetedFieldsOfStudies,
               ...group.targetedFieldsOfStudy.map(({ id }) => id),
            ]
         }

         if (group.targetedUniversities) {
            acc.companyTargetedUniversities = [
               ...acc.companyTargetedUniversities,
               ...group.targetedUniversities.map(({ id }) => id),
            ]
         }

         return acc
      },
      {
         companyCountries: [],
         companyIndustries: [],
         companySizes: [],
         companyTargetedCountries: [],
         companyTargetedUniversities: [],
         companyTargetedFieldsOfStudies: [],
      }
   )

   // remove duplicates
   meta.companyCountries = uniq(meta.companyCountries ?? [])
   meta.companyIndustries = uniq(meta.companyIndustries ?? [])
   meta.companySizes = uniq(meta.companySizes ?? [])
   meta.companyTargetedCountries = uniq(meta.companyTargetedCountries ?? [])
   meta.companyTargetedFieldsOfStudies = uniq(
      meta.companyTargetedFieldsOfStudies ?? []
   )
   meta.companyTargetedUniversities = uniq(
      meta.companyTargetedUniversities ?? []
   )

   return meta
}

export const hasMetadataChanged = (
   previousValue: Group,
   currentValue: Group
): boolean => {
   const countryChanged =
      previousValue?.companyCountry?.id != currentValue?.companyCountry?.id

   console.log("🚀 ~ countryChanged:", countryChanged)

   const industriesChanged = Boolean(
      getArrayDifference(
         previousValue?.companyIndustries.map((industry) => industry.id),
         currentValue?.companyIndustries.map((industry) => industry.id)
      ).length
   )

   console.log("🚀 ~ industriesChanged:", industriesChanged)

   const sizeChanged = previousValue?.companySize != currentValue?.companySize
   console.log("🚀 ~ sizeChanged:", sizeChanged)

   const targetCountriesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedCountries.map((country) => country.id),
         currentValue?.targetedCountries.map((country) => country.id)
      ).length
   )

   console.log("🚀 ~ targetCountriesChanged:", targetCountriesChanged)

   const targetUniversitiesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedUniversities.map((uni) => uni.id),
         currentValue?.targetedUniversities.map((uni) => uni.id)
      ).length
   )

   console.log("🚀 ~ targetUniversitiesChanged:", targetUniversitiesChanged)

   const targetFieldsOfStudiesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedFieldsOfStudy.map(
            (fieldOfStudy) => fieldOfStudy.id
         ),
         currentValue?.targetedFieldsOfStudy.map(
            (fieldOfStudy) => fieldOfStudy.id
         )
      ).length
   )

   console.log(
      "🚀 ~ targetFieldsOfStudiesChanged:",
      targetFieldsOfStudiesChanged
   )

   return (
      countryChanged ||
      industriesChanged ||
      sizeChanged ||
      targetCountriesChanged ||
      targetUniversitiesChanged ||
      targetFieldsOfStudiesChanged
   )
}
