import uniq from "lodash/uniq"
import { CustomJobApplicant } from "../customJobs/customJobs"
import { Group, GroupOption, pickPublicDataFromGroup } from "../groups"
import { LivestreamEvent } from "../livestreams"
import { getArrayDifference } from "../utils"

export type LivestreamMetaData = Pick<
   LivestreamEvent,
   | "companyCountries"
   | "companyIndustries"
   | "companySizes"
   | "companyTargetedCountries"
   | "companyTargetedFieldsOfStudies"
   | "companyTargetedUniversities"
>

export type CustomJobMetaData = Pick<
   CustomJobApplicant,
   "companyCountry" | "companyIndustries" | "companySize"
>

export const getMetaDataFromCustomJobGroup = (
   group: Group
): CustomJobMetaData => {
   // Aggregate all the metadata from the groups
   const publicGroupData = pickPublicDataFromGroup(group)
   const meta: CustomJobMetaData = {
      companyCountry: publicGroupData.companyCountry?.id,
      companyIndustries: publicGroupData?.companyIndustries?.map(
         (industry) => industry.id
      ),
      companySize: publicGroupData.companySize,
   }

   return meta
}

export const hasPublicGroupMetaDataChanged = (
   previousValue: Group,
   currentValue: Group
): boolean => {
   const previousPublicGroupData = pickPublicDataFromGroup(previousValue)
   const currentPublicGroupData = pickPublicDataFromGroup(currentValue)

   // Compare primitive values
   const idChanged = previousPublicGroupData.id !== currentPublicGroupData.id
   const descriptionChanged =
      previousPublicGroupData.description !== currentPublicGroupData.description
   const bannerImageUrlChanged =
      previousPublicGroupData.bannerImageUrl !==
      currentPublicGroupData.bannerImageUrl
   const logoUrlChanged =
      previousPublicGroupData.logoUrl !== currentPublicGroupData.logoUrl
   const extraInfoChanged =
      previousPublicGroupData.extraInfo !== currentPublicGroupData.extraInfo
   const universityNameChanged =
      previousPublicGroupData.universityName !==
      currentPublicGroupData.universityName
   const universityCodeChanged =
      previousPublicGroupData.universityCode !==
      currentPublicGroupData.universityCode
   const publicSparksChanged =
      previousPublicGroupData.publicSparks !==
      currentPublicGroupData.publicSparks
   const publicProfileChanged =
      previousPublicGroupData.publicProfile !==
      currentPublicGroupData.publicProfile
   const careerPageUrlChanged =
      previousPublicGroupData.careerPageUrl !==
      currentPublicGroupData.careerPageUrl
   const companySizeChanged =
      previousPublicGroupData.companySize !== currentPublicGroupData.companySize

   // Compare object values by ID
   const companyCountryChanged =
      previousPublicGroupData.companyCountry?.id !==
      currentPublicGroupData.companyCountry?.id
   const planChanged =
      previousPublicGroupData.plan?.type !== currentPublicGroupData.plan?.type
   const featuredChanged =
      previousPublicGroupData.featured?.targetCountries?.join(",") !==
      currentPublicGroupData.featured?.targetCountries?.join(",")

   // Compare array values using getArrayDifference
   const targetedCountriesDifference = getArrayDifference(
      previousPublicGroupData.targetedCountries?.map(groupOptionId) ?? [],
      currentPublicGroupData.targetedCountries?.map(groupOptionId) ?? []
   )
   const targetedCountriesChanged = Boolean(targetedCountriesDifference.length)

   const targetedUniversitiesDifference = getArrayDifference(
      previousPublicGroupData.targetedUniversities?.map(groupOptionId) ?? [],
      currentPublicGroupData.targetedUniversities?.map(groupOptionId) ?? []
   )
   const targetedUniversitiesChanged = Boolean(
      targetedUniversitiesDifference.length
   )

   const targetedFieldsOfStudyDifference = getArrayDifference(
      previousPublicGroupData.targetedFieldsOfStudy?.map(groupOptionId) ?? [],
      currentPublicGroupData.targetedFieldsOfStudy?.map(groupOptionId) ?? []
   )
   const targetedFieldsOfStudyChanged = Boolean(
      targetedFieldsOfStudyDifference.length
   )

   const companyIndustriesDifference = getArrayDifference(
      previousPublicGroupData.companyIndustries?.map(groupOptionId) ?? [],
      currentPublicGroupData.companyIndustries?.map(groupOptionId) ?? []
   )
   const companyIndustriesChanged = Boolean(companyIndustriesDifference.length)

   return (
      idChanged ||
      descriptionChanged ||
      bannerImageUrlChanged ||
      logoUrlChanged ||
      extraInfoChanged ||
      universityNameChanged ||
      universityCodeChanged ||
      publicSparksChanged ||
      publicProfileChanged ||
      careerPageUrlChanged ||
      companySizeChanged ||
      companyCountryChanged ||
      planChanged ||
      featuredChanged ||
      targetedCountriesChanged ||
      targetedUniversitiesChanged ||
      targetedFieldsOfStudyChanged ||
      companyIndustriesChanged
   )
}

export const hasCustomJobsGroupMetaDataChanged = (
   previousValue: Group,
   currentValue: Group
): boolean => {
   const countryChanged =
      previousValue?.companyCountry?.id != currentValue?.companyCountry?.id

   const industriesChanged = Boolean(
      getArrayDifference(
         previousValue?.companyIndustries.map((industry) => industry.id),
         currentValue?.companyIndustries.map((industry) => industry.id)
      ).length
   )

   const sizeChanged = previousValue?.companySize != currentValue?.companySize
   return countryChanged || industriesChanged || sizeChanged
}

export const getMetaDataFromEventHosts = (
   eventHosts: Group[]
): LivestreamMetaData => {
   const companies = eventHosts?.filter((group) => !group.universityCode)

   let groupsToGetMetadataFrom = eventHosts

   if (companies?.length > 0) {
      // if there is at least one company, we want to get the metadata ONLY from the companies, not the universities
      groupsToGetMetadataFrom = companies
   }

   // Aggregate all the metadata from the groups
   const meta = groupsToGetMetadataFrom.reduce<LivestreamMetaData>(
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

   const industriesDifference = getArrayDifference(
      previousValue?.companyIndustries?.map(groupOptionId),
      currentValue?.companyIndustries?.map(groupOptionId)
   )

   const industriesChanged = Boolean(industriesDifference?.length)

   const sizeChanged = previousValue?.companySize != currentValue?.companySize

   const targetCountriesDifference = getArrayDifference(
      previousValue?.targetedCountries?.map(groupOptionId),
      currentValue?.targetedCountries?.map(groupOptionId)
   )

   const targetCountriesChanged = Boolean(targetCountriesDifference.length)

   const targetUniversitiesDifference = getArrayDifference(
      previousValue?.targetedUniversities?.map(groupOptionId),
      currentValue?.targetedUniversities?.map(groupOptionId)
   )

   const targetUniversitiesChanged = Boolean(
      targetUniversitiesDifference.length
   )

   const fieldsOfStudyDifferences = getArrayDifference(
      previousValue?.targetedFieldsOfStudy?.map(groupOptionId),
      currentValue?.targetedFieldsOfStudy?.map(groupOptionId)
   )

   const targetFieldsOfStudiesChanged = Boolean(fieldsOfStudyDifferences.length)

   return (
      countryChanged ||
      industriesChanged ||
      sizeChanged ||
      targetCountriesChanged ||
      targetUniversitiesChanged ||
      targetFieldsOfStudiesChanged
   )
}

const groupOptionId = (option: GroupOption): string => {
   return option.id
}
