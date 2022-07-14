import { Identifiable } from "../commonTypes"
import firebase from "firebase"
import {
   CustomCategory,
   CustomCategoryOption,
   GroupUserStatData,
} from "../groups"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   fieldOfStudy?: {
      name: string
      id: string
   }
   levelOfStudy?: {
      name: string
      id: string
   }
   university: {
      code: string
      name: string
      categories: UniversityCategoriesMap
   }
   badges?: string[]
   groupIds: string[]
   registeredGroups?: RegisteredGroup[]
   linkedinUrl: string
   isAdmin?: boolean
   userResume: string
   backFills: BackFillType[] | firebase.firestore.FieldValue
   universityCountryCode: string
   unsubscribed?: boolean
   userEmail: string
   validationPin: number
   interestsIds?: string[]
   points?: number
   referralCode?: string
   referredBy?: {
      uid: string
      name: string
   }

   // need data migrations to be moved to the user stats doc
   referralsCount?: number
   totalLivestreamInvites?: number
}

export interface UniversityCategoriesMap {
   [categoryId: CustomCategory["id"]]: {
      categoryName?: string
      selectedOptionName?: string
      selectedOptionId: CustomCategoryOption["id"]
   }
}
export type BackFillType = "levelOfStudy" | "fieldOfStudy"
export interface RegisteredGroup {
   groupId: string
   categories: RegisteredGroupCategory[]
}

export interface RegisteredGroupCategory {
   id: string
   selectedValueId: string
}

export interface UserStats {
   userId: string
   totalLivestreamAttendances?: number
   totalQuestionsAsked?: number
   totalHandRaises?: number
}

export interface SavedRecruiter extends Identifiable {
   livestreamId: string
   userId: string
   savedAt: firebase.firestore.Timestamp

   livestreamDetails: {
      title: string
      company: string
      start: firebase.firestore.Timestamp
      companyLogoUrl: string
   }

   streamerDetails: {
      id: string
      avatar?: string
      linkedIn?: string
      firstName: string
      lastName: string
      position: string
      background?: string
   }
}

export interface RegisteredStudent extends UserData {
   dateRegistered: firebase.firestore.Timestamp
}

export interface UserPublicData {
   id: string
   firstName: string
   lastName: string
   badges?: string[]
}

export interface UserBreakdownStats {
   totalCount: number
   id: string
   label: string
   dataDict: Record<GroupUserStatData["optionId"], GroupUserStatData>
   dataArray: GroupUserStatData[]
}

/**
 * Public information about a user
 *
 * Useful to save on relationship documents
 * @param userData
 */
export const pickPublicDataFromUser = (userData: UserData): UserPublicData => {
   return {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      badges: userData.badges || [],
   }
}

export const getGeneralUserBreakdownStats = function (
   users: UserData[]
): UserBreakdownStats[] {
   const fieldOfStudyStats: UserBreakdownStats = {
      totalCount: users.length,
      label: "Field of Study",
      id: "fieldOfStudy",
      dataDict: {},
      dataArray: [],
   }
   const levelOfStudyStats: UserBreakdownStats = {
      totalCount: users.length,
      label: "Level of Study",
      id: "levelOfStudy",
      dataDict: {},
      dataArray: [],
   }
   mapUserStats(fieldOfStudyStats, users, {
      pathToDataId: "fieldOfStudy.id",
      pathToDataName: "fieldOfStudy.name",
   })
   mapUserStats(levelOfStudyStats, users, {
      pathToDataId: "levelOfStudy.id",
      pathToDataName: "levelOfStudy.name",
   })
   return [fieldOfStudyStats, levelOfStudyStats]
}
interface BreakdownDataPaths {
   pathToDataName: string
   pathToDataId: string
}

function resolve(obj, path, separator = ".") {
   const properties = Array.isArray(path) ? path : path.split(separator)
   return properties.reduce((prev, curr) => prev && prev[curr], obj)
}
/*
 * Takes a list of users and maps them to a userBreakdownStats object
 * @param userBreakdownStats - the userBreakdownStats object to map to
 * @param users - list of users
 * @param pathsToData - paths to the data to map to the userBreakdownStats
 * @returns userBreakdownStats - the userBreakdownStats object with the mapped data
 * */
export const mapUserStats = (
   stats: UserBreakdownStats,
   users: UserData[],
   dataPaths: BreakdownDataPaths
) => {
   for (const user of users) {
      const dataId = resolve(user, dataPaths.pathToDataId)
      const dataName = resolve(user, dataPaths.pathToDataName)

      if (!dataId) continue
      if (!stats.dataDict[dataId]) {
         stats.dataDict[dataId] = {
            count: 0,
            optionName: dataName,
            optionId: dataId,
         }
      }
      stats.dataDict[dataId].count++
   }
   stats.dataArray = getDataArray(stats.dataDict)
}

export function getUserBreakdownStatsBasedOnCustomCategories(
   users: UserData[],
   customCategories: CustomCategory[]
): UserBreakdownStats[] {
   return customCategories.map((customCategory) => {
      const customCategoryStat: UserBreakdownStats = {
         id: customCategory.id,
         totalCount: users.length,
         label: customCategory.name,
         dataDict: {},
         dataArray: [],
      }
      mapUserStats(customCategoryStat, users, {
         pathToDataId: `university.categories.${customCategory.id}.selectedOptionId`,
         pathToDataName: `university.categories.${customCategory.id}.selectedOptionName`,
      })
      return customCategoryStat
   }, [])
}

const getDataArray = (
   dataDict: UserBreakdownStats["dataDict"]
): UserBreakdownStats["dataArray"] => {
   return Object.keys(dataDict)
      .map((key) => dataDict[key])
      .sort((a, b) => b.count - a.count)
}
