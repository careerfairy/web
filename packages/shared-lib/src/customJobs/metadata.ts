// import { Group } from "../groups"
// import { getArrayDifference } from "../utils"
// import { CustomJobApplicant } from "./customJobs"

// export type MetaData = Pick<
//    CustomJobApplicant,
//    "companyCountry" | "companyIndustries" | "companySize"
// >

// export const getMetaDataFromCustomJobGroup = (group: Group): MetaData => {
//    Aggregate all the metadata from the groups
//    const meta: MetaData = {
//       companyCountry: group.companyCountry?.id,
//       companyIndustries: group?.companyIndustries?.map(
//          (industry) => industry.id
//       ),
//       companySize: group.companySize,
//    }

//    return meta
// }

// export const hasCustomJobsGroupMetaDataChanged = (
//    previousValue: Group,
//    currentValue: Group
// ): boolean => {
//    const countryChanged =
//       previousValue?.companyCountry?.id != currentValue?.companyCountry?.id

//    const industriesChanged = Boolean(
//       getArrayDifference(
//          previousValue?.companyIndustries.map((industry) => industry.id),
//          currentValue?.companyIndustries.map((industry) => industry.id)
//       ).length
//    )

//    const sizeChanged = previousValue?.companySize != currentValue?.companySize
//    return countryChanged || industriesChanged || sizeChanged
// }
