import { FieldOfStudy } from "../fieldOfStudy"
import { UserData } from "../users"
import { dynamicSort } from "../utils"
import {
   convertGroupQuestionOptionsToSortedArray,
   Group,
   GroupQuestion,
   GroupQuestionOption,
} from "./groups"
import {
   LivestreamEvent,
   LivestreamPoll,
   LivestreamQuestion,
   Speaker,
} from "../livestreams"
import { convertDictToDocArray } from "../BaseFirebaseRepository"

export interface PdfCategoryChartData {
   name: string
   totalWithStats: number
   totalWithoutStats: number
   mainCategoryName: string
   mainCategoryId: string
   subCategoryName: string
   subCategoryId: string
   subCategoryOptionNames: string[]
   mainCategoryOptions: PdfCategoryChartOption[]
}

const generalFilterFn = (
   user: UserData,
   userInfo: GroupQuestion,
   option: FieldOfStudy
) => {
   return user[userInfo.id]?.id === option.id
}

export const getPdfCategoryChartData = (
   mainQuestion: GroupQuestion,
   subQuestion: GroupQuestion,
   users: UserData[]
): PdfCategoryChartData => {
   const subCategorySortingOrder = "asc"
   const mainQuestionOptions: PdfCategoryChartOption[] =
      convertGroupQuestionOptionsToSortedArray(mainQuestion?.options)
         .map((mainQuestionOption) => {
            const mainQuestionOptionUsers = users.filter((user) =>
               generalFilterFn(user, mainQuestion, mainQuestionOption)
            )
            return {
               id: mainQuestionOption?.id,
               subCategoryOptions: convertGroupQuestionOptionsToSortedArray(
                  subQuestion?.options
               )
                  .map((subCategoryOption) => {
                     const count = mainQuestionOptionUsers.filter((user) =>
                        generalFilterFn(user, subQuestion, subCategoryOption)
                     ).length
                     return {
                        id: subCategoryOption?.id,
                        name: subCategoryOption?.name,
                        count: count,
                     }
                  })
                  .sort(dynamicSort("name", subCategorySortingOrder)),
               name: mainQuestionOption?.name,
               count: mainQuestionOptionUsers?.length,
            }
         })
         .sort(dynamicSort("count", "desc"))
         .filter((el) => el.count > 0)
   const totalWithStats = mainQuestionOptions.reduce(
      (accumulator, option) => accumulator + option.count,
      0
   )
   return {
      totalWithoutStats: (users?.length || 0) - totalWithStats,
      totalWithStats,
      name: mainQuestion?.name,
      mainCategoryName: mainQuestion?.name,
      mainCategoryId: mainQuestion?.id,
      subCategoryName: subQuestion?.name,
      subCategoryId: subQuestion?.id,
      mainCategoryOptions: mainQuestionOptions,
      subCategoryOptionNames: convertDictToDocArray(subQuestion?.options)
         .sort(dynamicSort("name", subCategorySortingOrder))
         .map((option) => option.name),
   }
}

export interface PdfCategoryChartOption extends GroupQuestionOption {
   count: number
   subCategoryOptions: PdfCategoryChartSubOption[]
}

export interface PdfCategoryChartSubOption extends GroupQuestionOption {
   count: number
}

export interface PdfReportData {
   hostsData: {
      hostName: string
      hostLogoUrl: string
      numberOfStudentsFromUniversity: number
      id: string
      isUniversity: boolean
   }[]
   nonUniversityChartData: PdfCategoryChartData
   summary: {
      totalParticipating: number
      totalParticipatingWithoutData: number
      requestingGroupId: string
      requestingGroup: Group
      speakers: Speaker[]
      totalStudentsInTalentPool: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ratings: any[]
      livestream: LivestreamEvent
      questions: LivestreamQuestion[]
      polls: LivestreamPoll[]
      numberOfIcons: number
      mostCommonUniversities: { code: string; name: string; count: number }[]
   }
}
