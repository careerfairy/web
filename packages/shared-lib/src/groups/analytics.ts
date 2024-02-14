import { dynamicSort, getNestedProperty } from "../utils"
import { GroupQuestion } from "./groups"
import { UserData } from "../users"

export interface UserBreakdownStats {
   totalCount: number
   id: string
   label: string
   dataDict: Record<GroupUserStatData["optionId"], GroupUserStatData>
   dataArray: GroupUserStatData[]
}
export interface GroupUserStatData {
   count: number
   optionName: string
   optionId: string
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

/*
 * Takes a list of users and maps them to a userBreakdownStats object
 * @param userBreakdownStats - the userBreakdownStats object to map to
 * @param users - list of users
 * @param pathsToData - paths to the data to map to the userBreakdownStats
 * @returns userBreakdownStats - the userBreakdownStats object with the mapped data
 * */
const mapUserStats = (
   stats: UserBreakdownStats,
   users: UserData[],
   dataPaths: BreakdownDataPaths
) => {
   for (const user of users) {
      const dataId = getNestedProperty(user, dataPaths.pathToDataId) as string
      const dataName = getNestedProperty(
         user,
         dataPaths.pathToDataName
      ) as string

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

export function getUserBreakdownStatsBasedOnGroupQuestions(
   users: UserData[],
   groupQuestions: GroupQuestion[]
): UserBreakdownStats[] {
   return groupQuestions.map((groupQuestion) => {
      const groupQuestionStat: UserBreakdownStats = {
         id: groupQuestion.id,
         totalCount: users.length,
         label: groupQuestion.name,
         dataDict: {},
         dataArray: [],
      }
      mapUserStats(groupQuestionStat, users, {
         pathToDataId: `university.questions.${groupQuestion.id}.answerId`,
         pathToDataName: `university.questions.${groupQuestion.id}.answerName`,
      })
      return groupQuestionStat
   }, [])
}

const getDataArray = (
   dataDict: UserBreakdownStats["dataDict"]
): UserBreakdownStats["dataArray"] => {
   return Object.keys(dataDict)
      .map((key) => dataDict[key])
      .sort(dynamicSort("count", "desc"))
}
