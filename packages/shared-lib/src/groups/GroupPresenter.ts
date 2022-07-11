import { CustomCategory, Group, GroupUserStat } from "./groups"
import BasePresenter from "../BasePresenter"
import { UserData } from "../users"
var get = require("lodash.get")

export default class GroupPresenter extends BasePresenter<Group> {
   constructor(public readonly model: Group) {
      super(model)
   }

   getGeneralUserCategoryStats(users: UserData[]): GroupUserStat[] {
      const fieldOfStudyStats: GroupUserStat = {
         totalCount: users.length,
         label: "Field of Study",
         id: "fieldOfStudy",
         dataDict: {},
         dataArray: [],
      }
      const levelOfStudyStats: GroupUserStat = {
         totalCount: users.length,
         label: "Level of Study",
         id: "levelOfStudy",
         dataDict: {},
         dataArray: [],
      }
      for (const user of users) {
         this.mapUserStats(fieldOfStudyStats, user, "fieldOfStudy")
         this.mapUserStats(levelOfStudyStats, user, "levelOfStudy")
      }
      return [fieldOfStudyStats, levelOfStudyStats]
   }

   getCustomUserCategoryStats(
      users: UserData[],
      customCategories: CustomCategory[]
   ): GroupUserStat[] {
      return customCategories.map((customCategory) => {
         const customCategoryStat: GroupUserStat = {
            id: customCategory.id,
            totalCount: users.length,
            label: customCategory.name,
            dataDict: {},
            dataArray: [],
         }
         for (const user of users) {
            Object.keys(customCategory.options).forEach(
               (customCategoryOptionId) => {
                  const option = customCategory.options[customCategoryOptionId]
                  const hasSelectedOption =
                     user.university.categories[customCategory.id]
                        .selectedOptionId === option.id
                  if (hasSelectedOption) {
                     if (!customCategoryStat.dataDict[option.id]) {
                        customCategoryStat.dataDict[option.id] = {
                           count: 0,
                           optionName: option.name,
                           optionId: option.id,
                        }
                     }
                     customCategoryStat.dataDict[option.id].count++
                  }
               }
            )
            customCategoryStat.dataArray = Object.keys(
               customCategoryStat.dataDict
            )
               .map((key) => customCategoryStat.dataDict[key])
               .sort((a, b) => b.count - a.count)
         }
         return customCategoryStat
      }, [])
   }

   mapUserStats(stats: GroupUserStat, user: UserData, pathToField: string) {
      const userInfo = get(user, pathToField) as
         | UserData["levelOfStudy"]
         | UserData["fieldOfStudy"]
      if (!userInfo?.id) return
      if (!stats.dataDict[userInfo.id]) {
         stats.dataDict[userInfo.id] = {
            count: 0,
            optionName: userInfo.name,
            optionId: userInfo.id,
         }
      }
      stats.dataDict[userInfo.id].count++

      stats.dataArray = Object.keys(stats.dataDict)
         .map((key) => stats.dataDict[key])
         .sort((a, b) => b.count - a.count)
   }

   getCustomCategoriesForTable(customCategories: CustomCategory[]) {
      return customCategories.map((customCategory) => {
         return {
            field: `university.categories.${customCategory.id}.selectedOptionId`,
            title: customCategory.name,
            lookup: Object.keys(customCategory.options).reduce((acc, key) => {
               acc[key] = customCategory.options[key].name
               return acc
            }, {}),
         }
      })
   }
}
