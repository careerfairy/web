import { firestore } from "../lib/firebase"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import Counter from "../lib/Counter"
import { CustomCategory, Group } from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleOthers,
   possibleLevelsOfStudy,
} from "../constants"
import { RegisteredGroup } from "@careerfairy/shared-lib/dist/users/users"
import { removeDuplicates } from "../util/misc"
import * as mappings from "@careerfairy/firebase-scripts/data/fieldAndLevelOfStudyMapping.json"

import { FieldValue } from "firebase-admin/firestore"

import { BigBatch } from "@qualdesk/firestore-big-batch"
import { UniversityCategoriesMap } from "@careerfairy/shared-lib/dist/users"
import { Identifiable } from "@careerfairy/webapp/types/commonTypes"

const customCountKeys = {
   numTotalUsers: "Total Users",
   numUsersWithFieldOfStudy: "Users with Field of Study",
   numUsersWithLevelOfStudy: "Users with Level of Study",
   numUsersWithRegisteredGroups: "Users with Registered Groups",
   numCustomCategories: "Custom Categories",
   numUsersWithAssignedFieldOfStudy: "Users with Assigned Field of Study",
   numUsersWithAssignedLevelOfStudy: "Users with Assigned Level of Study",
}

const levelOfStudyMapping = mappings.levelOfStudyMapping
const fieldOfStudyMapping = mappings.fieldOfStudyMapping
export default async function main() {
   const counter = new Counter()
   const batch = new BigBatch({ firestore: firestore }) //

   const fieldsOfStudySnaps = await firestore.collection("fieldsOfStudy").get()
   const levelsOfStudySnaps = await firestore.collection("levelsOfStudy").get()
   // get all users
   const userSnaps = await firestore.collection("userData").get()
   counter.addToCustomCount(
      customCountKeys.numTotalUsers,
      userSnaps.docs.length
   )
   const groupSnaps = await firestore.collection("careerCenterData").get()
   counter.addToReadCount(
      userSnaps.docs.length +
         groupSnaps.docs.length +
         fieldsOfStudySnaps.docs.length +
         levelsOfStudySnaps.docs.length
   )

   const groups = groupSnaps.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Group)
   )
   const users = userSnaps.docs.map(
      (doc) =>
         ({
            id: doc.id,
            ...doc.data(),
         } as UserData)
   )

   createCustomGroupCategorySubCollections(groups, batch, counter)

   assignUsersFieldsOfStudy(users, groups, batch, counter)

   await batch.commit()

   counter.print()
   printPercentOfUsersAssignedData(
      customCountKeys.numUsersWithAssignedFieldOfStudy,
      counter
   )
   printPercentOfUsersAssignedData(
      customCountKeys.numUsersWithAssignedLevelOfStudy,
      counter
   )
}

const printPercentOfUsersAssignedData = (
   customCount: string,
   counter: Counter
) => {
   const percentOfUsersAssignedFieldOfStudy =
      (counter.getCustomCount(customCount) /
         counter.getCustomCount(customCountKeys.numTotalUsers)) *
      100
   console.log(
      `-> ${customCount} from Backfill`,
      percentOfUsersAssignedFieldOfStudy.toFixed(2) + "%"
   )
}

type Mapping = {
   current: {
      [docId: string]: string // docName
   }
   legacy: {
      [legacyName: string]: string // docId
   }
}
// type FieldAndLevelOfStudyMapping = {
//    fieldOfStudyMapping: Mapping
//    levelOfStudyMapping: Mapping
// }
const getAssignedUserInfoIdAndName = (
   userFieldsOfStudy: string[],
   mapping: Mapping
) => {
   const legacyDict = mapping.legacy
   const newDict = mapping.current
   const studyFieldWithMapping = userFieldsOfStudy.find(
      (studyField) => legacyDict[studyField]
   )
   const docId = legacyDict[studyFieldWithMapping]
   if (newDict[docId]) {
      return { id: docId, name: newDict[docId] }
   }
   return null
}

const getUserCategorySelectionByPossibleNames = (
   possibleNames: string[],
   userData: UserData,
   groups: Group[]
) => {
   return (
      userData.registeredGroups?.reduce((acc, registeredGroupSelection) => {
         if (!registeredGroupSelection.categories) return acc

         const registeredGroup = getRegisteredGroup(
            registeredGroupSelection.groupId,
            groups
         )
         if (!registeredGroup?.categories) return acc

         const registeredGroupCategories = getRegisteredGroupPossibleCategories(
            registeredGroup?.categories,
            possibleNames
         )

         if (!registeredGroupCategories.length) return acc

         const chosenSelection = getChosenSelection(
            registeredGroupSelection,
            registeredGroupCategories
         )

         return removeOthers(removeDuplicates([...acc, ...chosenSelection]))
      }, []) || []
   )
}

const removeOthers = (fieldOfStudyLabels: string[]) => {
   return fieldOfStudyLabels.filter(
      (fieldOfStudyLabel) => !possibleOthers.includes(fieldOfStudyLabel.trim())
   )
}
const getChosenSelection = (
   userRegisteredGroup: RegisteredGroup,
   groupFieldOfStudyCategories: Group["categories"]
): string[] => {
   return userRegisteredGroup.categories.reduce((acc, categorySelections) => {
      const category = groupFieldOfStudyCategories.find(
         (registeredCategory) => registeredCategory.id === categorySelections.id
      )
      if (!category?.options) return acc
      const categoryOption = category.options.find(
         (option) => option.id === categorySelections.selectedValueId
      )
      if (!categoryOption?.name) return acc
      return [...acc, categoryOption.name.toLowerCase().trim()]
   }, [])
}

const getRegisteredGroup = (registeredGroupId: string, groups: Group[]) => {
   return groups.find((group) => group.id === registeredGroupId)
}

const getRegisteredGroupPossibleCategories = (
   registeredGroupCategories: Group["categories"],
   possibleNames
) => {
   return registeredGroupCategories.filter((category) =>
      possibleNames.includes(category.name.trim())
   )
}

const consoleLogProgressEveryPercent = (
   totalUsers: number,
   userIndex: number,
   percent = 10
) => {
   if (userIndex % Math.floor(totalUsers / Math.floor(100 / percent)) === 0) {
      console.log(
         `Backfilled ${Math.round((userIndex / totalUsers) * 100)}% of users`
      )
   }
}

const getUserUniversityCategoryMap = (
   user: UserData,
   groups: Group[]
): UniversityCategoriesMap => {
   const universityCategoriesMap: UniversityCategoriesMap = null
   if (!user.university?.code) return universityCategoriesMap
   const university = getUniversity(user.university?.code, groups)
   if (!university?.categories) return universityCategoriesMap
   return university.categories.reduce<UniversityCategoriesMap>(
      (acc, category) => {
         if (!category.options) return acc
         return {
            ...acc,
            [category.id]: {
               categoryName: category.name,
               ...getCategorySelectedOptionId(user, university, category.id),
            },
         }
      },
      {}
   )
}

const getUniversity = (universityCode, groups): Group => {
   return groups.find((group) => group?.universityCode === universityCode)
}

const getCategorySelectedOptionId = (
   user: UserData,
   university: Group,
   groupCategoryId: string
) => {
   const registeredGroup = user.registeredGroups?.find(
      (registeredGroup) => registeredGroup.groupId === university.id
   )
   if (!registeredGroup?.categories) return null
   const category = registeredGroup.categories.find(
      (registeredGroupCategory) =>
         registeredGroupCategory.id === groupCategoryId
   )
   if (!category?.selectedValueId) return null

   const selectValueName = university.categories
      .find((category) => category.id === groupCategoryId)
      ?.options.find((option) => option.id === category?.selectedValueId)?.name

   return {
      selectedOptionId: category?.selectedValueId || null,
      selectedOptionName: selectValueName || null,
   }
}

// Goes through every group and creates a document for each category
// then stores each document in the group's customCategories sub-collection
const createCustomGroupCategorySubCollections = (
   groups: Group[],
   batch: BigBatch,
   counter: Counter
) => {
   let numUniversities = 0
   groups.forEach((group) => {
      if (!group.categories || !group.universityCode) return
      let groupHasFieldOfStudy, groupHasLevelOfStudy
      numUniversities += 1
      group.categories?.forEach((category) => {
         const categoryRef = firestore
            .collection(`careerCenterData/${group.id}/customCategories`)
            .doc(category.id)

         const categoryIsFieldOfStudy = checkIfHasMatch(
            category.name,
            possibleFieldsOfStudy
         )
         const categoryIsLevelOfStudy = checkIfHasMatch(
            category.name,
            possibleLevelsOfStudy
         )
         if (!groupHasFieldOfStudy) {
            groupHasFieldOfStudy = categoryIsFieldOfStudy
         }
         if (!groupHasLevelOfStudy) {
            groupHasLevelOfStudy = categoryIsLevelOfStudy
         }

         const categoryData: CustomCategory = {
            id: category.id,
            name: category.name,
            options: convertFirebaseDocsToDictionary(category.options),
            categoryType: categoryIsFieldOfStudy
               ? "fieldOfStudy"
               : categoryIsLevelOfStudy
               ? "levelOfStudy"
               : "custom",
         }
         batch.set(categoryRef, categoryData)
         counter.customCountIncrement(customCountKeys.numCustomCategories)
         counter.write()
      })

      if (!groupHasFieldOfStudy && !groupHasLevelOfStudy) {
         // throw an error if the group has no field of study or level of study
         throwMigrationError(
            `University Group ${
               group.universityName
            } has no field of study or level of study, please fix that first, Group Data: ${JSON.stringify(
               group
            )}`
         )
      }
   })
   console.log("-> numUniversities", numUniversities)
}

const checkIfHasMatch = (categoryName: string, possibleNames: string[]) => {
   return possibleNames
      .map((name) => trimAndLowerCase(name))
      .includes(trimAndLowerCase(categoryName))
}
const trimAndLowerCase = (str: string) => {
   return str.trim().toLowerCase()
}
/*
 * Goes through every user and does 2 things:
 *
 * 1. If the user has registered groups, it tries to find their field of study and level of study
 *    based on their registered groups data
 * 2. If the user has a university, it gets the universities group category data and maps all the selected
 *    categories of the university to the user and stores them as a dictionary in the
 *    user's user.university.categories field
 * */
const assignUsersFieldsOfStudy = (
   users: UserData[],
   groups: Group[],
   batch: BigBatch,
   counter: Counter
) => {
   let i = 0
   for (const userData of users) {
      consoleLogProgressEveryPercent(users.length, i)
      i++

      if (userData.registeredGroups) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithRegisteredGroups
         )
      }

      const userRef = firestore.collection("userData").doc(userData.id)

      const fieldsOfStudy = getUserCategorySelectionByPossibleNames(
         possibleFieldsOfStudy,
         userData,
         groups
      )

      const levelsOfStudy = getUserCategorySelectionByPossibleNames(
         possibleLevelsOfStudy,
         userData,
         groups
      )

      if (fieldsOfStudy.length) {
         counter.customCountIncrement(customCountKeys.numUsersWithFieldOfStudy)
      }
      if (levelsOfStudy.length) {
         counter.customCountIncrement(customCountKeys.numUsersWithLevelOfStudy)
      }

      const assignedFieldOfStudy = getAssignedUserInfoIdAndName(
         fieldsOfStudy,
         fieldOfStudyMapping
      )
      const assignedLevelOfStudy = getAssignedUserInfoIdAndName(
         levelsOfStudy,
         levelOfStudyMapping
      )

      let updateData: Partial<UserData> = {
         fieldOfStudy: null,
         levelOfStudy: null,
      }
      const backFills = []
      if (assignedFieldOfStudy) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithAssignedFieldOfStudy
         )
         updateData["fieldOfStudy"] = assignedFieldOfStudy
         backFills.push("fieldOfStudy")
      }
      if (assignedLevelOfStudy) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithAssignedLevelOfStudy
         )
         updateData["levelOfStudy"] = assignedLevelOfStudy
         backFills.push("levelOfStudy")
      }
      counter.writeIncrement()
      updateData = {
         ...updateData,
         university: {
            ...userData.university,
            categories: getUserUniversityCategoryMap(userData, groups),
         },
         ...(backFills.length && {
            backFills: FieldValue.arrayUnion(...backFills),
         }),
      }
      batch.set(userRef, updateData, { merge: true })
   }
}

const convertFirebaseDocsToDictionary = <T extends Identifiable>(
   array: T[]
): Record<string, T> => {
   return array.reduce<Record<string, T>>((acc, curr) => {
      acc[curr.id] = curr
      return acc
   }, {})
}

const throwMigrationError = (message: string) => {
   throw new Error(
      `Migration canceled, dont worry no mutations have been made, Error Message: ${message}`
   )
}
