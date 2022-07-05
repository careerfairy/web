import { firestore } from "../lib/firebase"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import ReadAndWriteCounter from "../lib/ReadAndWriteCounter"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { possibleFieldsOfStudy, possibleOthers } from "../constants"
import { RegisteredGroup } from "@careerfairy/shared-lib/dist/users/users"
import { removeDuplicates } from "../util/misc"
import * as currentFieldOfStudiesMapping from "@careerfairy/firebase-scripts/data/currentFieldOfStudiesMapping.json"
import * as legacyFieldOfStudiesMapping from "@careerfairy/firebase-scripts/data/legacyFieldOfStudiesMapping.json"
import { BigBatch } from "@qualdesk/firestore-big-batch"

export default async function main() {
   console.log("-> getMappingsFromCSV")

   // get all users
   const counter = new ReadAndWriteCounter([
      "numTotalUsers",
      "numUsersWithFieldOfStudy",
      "numUsersWithAssignedFieldOfStudy",
   ])
   const batch = new BigBatch({ firestore: firestore }) //

   const fieldsOfStudySnaps = await firestore.collection("fieldOfStudy").get()
   const userSnaps = await firestore.collection("userData").get()
   counter.addToCustomCount("numTotalUsers", userSnaps.docs.length)
   const groupSnaps = await firestore.collection("careerCenterData").get()
   counter.addToReadCount(
      userSnaps.docs.length +
         groupSnaps.docs.length +
         fieldsOfStudySnaps.docs.length
   )

   const groups = groupSnaps.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Group)
   )
   // console.log("-> total users", userSnaps.docs.length)
   for (const userSnap of userSnaps.docs) {
      const userData = {
         ...userSnap.data(),
         id: userSnap.id,
      } as UserData

      const userRef = firestore.collection("userData").doc(userSnap.id)

      const fieldsOfStudy = removeOthers(
         removeDuplicates(getUserFieldsOfStudy(userData, groups))
      )
      if (fieldsOfStudy.length) {
         counter.customCountIncrement("numUsersWithFieldOfStudy")

         const bestMatchingFieldOfStudyId = getAssignedFieldOfStudyId(
            fieldsOfStudy[0]
         )
         if (bestMatchingFieldOfStudyId) {
            counter.customCountIncrement("numUsersWithAssignedFieldOfStudy")
            counter.writeIncrement()
            batch.set(
               userRef,
               {
                  fieldOfStudyId: bestMatchingFieldOfStudyId,
                  fieldOfStudyIsBackfilled: true,
               },
               { merge: true }
            )
         }
      }
   }

   await batch.commit()

   counter.print()
   const percentOfUsersAssignedFieldOfStudy =
      (counter.getCustomCount("numUsersWithAssignedFieldOfStudy") /
         counter.getCustomCount("numTotalUsers")) *
      100
   console.log(
      "-> percent Of Users Assigned Field Of Study from Backfill",
      percentOfUsersAssignedFieldOfStudy.toFixed(2) + "%"
   )
}

const getAssignedFieldOfStudyId = (userFirstFieldOfStudy: string) => {
   const fieldOfStudyId = legacyFieldOfStudiesMapping[userFirstFieldOfStudy]
   return currentFieldOfStudiesMapping[fieldOfStudyId]
}

const getUserFieldsOfStudy = (userData: UserData, groups: Group[]) => {
   return userData.registeredGroups?.reduce((acc, registeredGroupSelection) => {
      if (!registeredGroupSelection.categories) return acc

      const registeredGroup = getRegisteredGroup(
         registeredGroupSelection.groupId,
         groups
      )
      if (!registeredGroup?.categories) return acc

      const registeredGroupFieldOfStudyCategories =
         getRegisteredGroupFieldOfStudyCategories(registeredGroup?.categories)

      if (!registeredGroupFieldOfStudyCategories.length) return acc

      const chosenFieldsOfStudy = getChosenFieldsOfStudy(
         registeredGroupSelection,
         registeredGroupFieldOfStudyCategories
      )

      return [...acc, ...chosenFieldsOfStudy]
   }, [])
}

const removeOthers = (fieldOfStudyLabels: string[]) => {
   return fieldOfStudyLabels.filter(
      (fieldOfStudyLabel) => !possibleOthers.includes(fieldOfStudyLabel.trim())
   )
}
const getChosenFieldsOfStudy = (
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
      return [...acc, categoryOption.name.toLowerCase()]
   }, [])
}

const getRegisteredGroup = (registeredGroupId: string, groups: Group[]) => {
   return groups.find((group) => group.id === registeredGroupId)
}

const getRegisteredGroupFieldOfStudyCategories = (
   registeredGroupCategories: Group["categories"]
) => {
   return registeredGroupCategories.filter((category) =>
      possibleFieldsOfStudy.includes(category.name.trim())
   )
}
