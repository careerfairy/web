import { Identifiable } from "../commonTypes"
import { UserData } from "../users"
import { RootFieldOfStudyCategory } from "../fieldOfStudy"
import { RootLevelOfStudyCategory } from "../levelOfStudy"
import {
   LivestreamEvent,
   LivestreamPoll,
   LivestreamQuestion,
   Speaker,
} from "../livestreams"
import { convertDictToDocArray } from "../BaseFirebaseRepository"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]
   adminEmail?: string

   // optional
   categories: GroupCategory[]
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
   hidePrivateEventsFromEmbed?: boolean
   privacyPolicyActive?: boolean
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

/*
 * A a category document found in a sub-collection called "customCategories"
 * of the Group Document
 * */
export interface CustomCategory extends Identifiable {
   name: string
   hidden?: boolean
   // This property is used to determine if the category is can or cant
   // be deleted, levelOfStudy and fieldOfStudy types should not be deleted
   // for the sake of pdf reporting.
   categoryType: "levelOfStudy" | "fieldOfStudy" | "custom"
   options: Record<CustomCategoryOption["id"], CustomCategoryOption>
}

/**
 * A university category option stored in an
 * array field of the UniversityCategory document
 * called "options".
 */
export interface CustomCategoryOption extends Identifiable {
   name: string
}

export interface GroupUserStatData {
   count: number
   optionName: string
   optionId: string
}

export interface PdfReportData {
   universityReports: {
      numberOfStudentsFromUniversity: number
      numberOfUniversityStudentsThatFollowingUniversity: number
      numberOfUniversityStudentsWithNoStats: number
      group: Group
      groupName: string
      groupId: string
      studentStats: any
      isUniversity: boolean
   }[]
   universityChartData: PdfCategoryChartData
   nonUniversityChartData: PdfCategoryChartData
   companyReport: {
      numberOfStudentsFollowingCompany: number
      group: Group
      groupName: string
      groupId: string
      studentStats: object
      isUniversity: boolean
   }
   summary: {
      totalParticipating: number
      totalSumOfParticipatingStudentsWithStats: number
      requestingGroupId: string
      requestingGroup: Group
      speakers: Speaker[]
      totalStudentsInTalentPool: number
      ratings: any[]
      livestream: LivestreamEvent
      questions: LivestreamQuestion[]
      polls: LivestreamPoll[]
      numberOfIcons: number
      totalSumOfUniversityStudents: number
      numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent: number
      mostCommonUniversities: { code: string; name: string; count: number }[]
   }
}

/*
 * Returns the same options dictionary, but sorted
 * by the option name.
 * */
export const sortCustomCategoryOptionsByName = (
   customCategoryOptions: CustomCategory["options"]
): CustomCategory["options"] =>
   convertCategoryOptionsToSortedArray(customCategoryOptions).reduce(
      (accumulator, option) => {
         accumulator[option.id] = customCategoryOptions[option.id]
         return accumulator
      },
      {}
   )

export const convertCategoryOptionsToSortedArray = (
   optionsDict: CustomCategory["options"],
   sortProperty = "name"
): CustomCategoryOption[] => {
   if (!optionsDict) return []
   return Object.keys(optionsDict)
      .map((key) => optionsDict[key])
      .sort((a, b) => (a[sortProperty] > b[sortProperty] ? 1 : -1))
}

export interface DataType {
   names: string[]
   options: string[]
}

export interface PdfCategoryChartData {
   name: string
   mainCategoryName: string
   mainCategoryId: string
   subCategoryName: string
   subCategoryId: string
   mainCategoryOptions: PdfCategoryChartOption[]
}

export const getPdfCategoryChartData = (
   mainCategory: CustomCategory | RootFieldOfStudyCategory,
   subCategory: CustomCategory | RootLevelOfStudyCategory,
   users: UserData[]
): PdfCategoryChartData => {
   // console.log("-> mainCategory", mainCategory)
   // console.log("-> subCategory", subCategory)
   const mainCategoryOptions = convertDictToDocArray(mainCategory.options)
   // console.log("-> mainCategoryOptions", mainCategoryOptions)
   const subCategoryOptions = convertDictToDocArray(subCategory.options)
   // console.log("-> subCategoryOptions", subCategoryOptions)
   const mainCategoryOptionsData = mainCategoryOptions
      .map<PdfCategoryChartOption>((mainOption) => {
         const mainOptionData = {
            ...mainOption,
            count: 0,
         }
         const subCategoryOptionsData = subCategoryOptions
            .map<PdfCategoryChartSubOption>((subOption) => {
               const subOptionData = {
                  ...subOption,
                  count: 0,
               }
               const usersWithOption = users.filter((user) => {
                  // console.log("------------------------------------")
                  // console.log(
                  //    "-> user uni categories",
                  //    user.university.categories
                  // )
                  // console.log("-> mainCategory.id", mainCategory.id)
                  // console.log("-> option.id", option.id)
                  // console.log("-> subCategory.id", subCategory.id)
                  // console.log("-> subOption.id", subOption.id)
                  // console.log("------------------------------------")
                  return (
                     user.university &&
                     user.university.categories &&
                     user.university.categories[mainCategory.id] &&
                     user.university.categories[mainCategory.id]
                        .selectedOptionId === mainOption.id
                     // &&
                     // user.university.categories[subCategory.id] &&
                     // user.university.categories[subCategory.id]
                     //    .selectedOptionId === subOption.id
                  )
               })
               // console.log("-> num users with option", usersWithOption.length)
               // console.log("-> num users", users.length)
               subOptionData.count = usersWithOption.length
               mainOptionData.count += subOptionData.count
               return subOptionData
            })
            .sort((a, b) => (a.count > b.count ? -1 : 1))
         return {
            ...mainOptionData,
            subCategoryOptions: subCategoryOptionsData,
         }
      })
      .sort((a, b) => (a.count > b.count ? -1 : 1))
   return {
      name: mainCategory.name,
      mainCategoryName: mainCategory.name,
      mainCategoryId: mainCategory.id,
      subCategoryName: subCategory.name,
      subCategoryId: subCategory.id,
      mainCategoryOptions: mainCategoryOptionsData,
   }
}

export interface PdfCategoryChartOption extends CustomCategoryOption {
   count: number
   subCategoryOptions: PdfCategoryChartSubOption[]
}

export interface PdfCategoryChartSubOption extends CustomCategoryOption {
   count: number
}
