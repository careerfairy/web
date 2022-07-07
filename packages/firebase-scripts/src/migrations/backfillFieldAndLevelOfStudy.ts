import { firestore } from "../lib/firebase"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import ReadAndWriteCounter from "../lib/ReadAndWriteCounter"
import { Group } from "@careerfairy/shared-lib/dist/groups"
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

export default async function main() {
   const counter = new ReadAndWriteCounter()
   const batch = new BigBatch({ firestore: firestore }) //

   const fieldsOfStudySnaps = await firestore.collection("fieldsOfStudy").get()
   const levelsOfStudySnaps = await firestore.collection("levelsOfStudy").get()
   // get all users
   const userSnaps = await firestore.collection("userData").get()
   counter.addToCustomCount("numTotalUsers", userSnaps.docs.length)
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
   let i = 0
   for (const userSnap of userSnaps.docs) {
      consoleLogProgressEveryPercent(userSnaps.docs.length, i)
      i++
      const userData = {
         ...userSnap.data(),
         id: userSnap.id,
      } as UserData

      if (userData.registeredGroups) {
         counter.customCountIncrement("numUsersWithRegisteredGroups")
      }

      const userRef = firestore.collection("userData").doc(userSnap.id)

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
         counter.customCountIncrement("numUsersWithFieldOfStudy")
      }
      if (levelsOfStudy.length) {
         counter.customCountIncrement("numUsersWithLevelOfStudy")
      }

      const bestMatchingFieldOfStudyId = getAssignedFieldOfStudyId(
         fieldsOfStudy,
         mappings.fieldOfStudyMapping
      )
      const bestMatchingLevelOfStudyId = getAssignedFieldOfStudyId(
         levelsOfStudy,
         mappings.levelOfStudyMapping
      )

      const updateData = {
         fieldOfStudyId: null,
         levelOfStudyId: null,
      }
      const backFills = []
      if (bestMatchingFieldOfStudyId) {
         counter.customCountIncrement("numUsersWithAssignedFieldOfStudy")
         updateData["fieldOfStudyId"] = bestMatchingFieldOfStudyId
         backFills.push("fieldOfStudy")
      }
      if (bestMatchingLevelOfStudyId) {
         counter.customCountIncrement("numUsersWithAssignedLevelOfStudy")
         updateData["levelOfStudyId"] = bestMatchingLevelOfStudyId
         backFills.push("levelOfStudy")
      }
      counter.writeIncrement()
      batch.set(
         userRef,
         {
            ...updateData,
            ...(backFills.length && {
               backFills: FieldValue.arrayUnion(...backFills),
            }),
         },
         { merge: true }
      )
   }

   await batch.commit()

   counter.print()
   printPercentOfUsersAssignedData("numUsersWithAssignedFieldOfStudy", counter)
   printPercentOfUsersAssignedData("numUsersWithAssignedLevelOfStudy", counter)
}

const printPercentOfUsersAssignedData = (
   customCount: string,
   counter: ReadAndWriteCounter
) => {
   const percentOfUsersAssignedFieldOfStudy =
      (counter.getCustomCount(customCount) /
         counter.getCustomCount("numTotalUsers")) *
      100
   console.log(
      `-> ${customCount} from Backfill`,
      percentOfUsersAssignedFieldOfStudy.toFixed(2) + "%"
   )
}

type Mapping = {
   current: {
      [docId: string]: string // docLabel
   }
   legacy: {
      [legacyName: string]: string // docId
   }
}
// type FieldAndLevelOfStudyMapping = {
//    fieldOfStudyMapping: Mapping
//    levelOfStudyMapping: Mapping
// }
const getAssignedFieldOfStudyId = (
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
      return docId
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
