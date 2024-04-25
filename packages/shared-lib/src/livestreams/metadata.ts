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
               ...group.targetedUniversities.map(({ name }) => name),
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
      previousValue?.companyCountry != currentValue?.companyCountry

   const industriesChanged = Boolean(
      getArrayDifference(
         previousValue?.companyIndustries,
         currentValue?.companyIndustries
      ).length
   )

   const sizeChanged = previousValue?.companySize === currentValue?.companySize

   const targetCountriesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedCountries,
         currentValue?.targetedCountries
      )
   )
   const targetUniversitiesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedUniversities,
         currentValue?.targetedUniversities
      )
   )
   const targetFieldsOfStudiesChanged = Boolean(
      getArrayDifference(
         previousValue?.targetedFieldsOfStudy,
         currentValue?.targetedFieldsOfStudy
      )
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
