import { firestore } from "../lib/firebase"
import {
   ParticipatingStudent,
   RegisteredStudent,
   TalentPoolStudent,
   UserData,
   UserGroupData,
} from "@careerfairy/shared-lib/dist/users"
import Counter from "../lib/Counter"
import { GroupQuestion, Group } from "@careerfairy/shared-lib/dist/groups"
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
import { UserGroupQuestionsWithAnswerMap } from "@careerfairy/shared-lib/dist/users"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { groupRepo, livestreamRepo, userRepo } from "../RepositoryInstances"
import { getArgValue } from "../index"

const customCountKeys = {
   numTotalUsers: "Total Users",
   numUsersWithFieldOfStudy: "Users with Field of Study",
   numUsersWithLevelOfStudy: "Users with Level of Study",
   numUsersWithRegisteredGroups: "Users with Registered Groups",
   numGroupQuestions: "Group Questions",
   numUsersWithAssignedFieldOfStudy: "Users with Assigned Field of Study",
   numUsersWithAssignedLevelOfStudy: "Users with Assigned Level of Study",
   numUniversityGroups: "Total Number of University Groups",
   numNonUniversityGroups: "Total Number of Non University Groups",
}

const levelOfStudyMapping = mappings.levelOfStudyMapping
const fieldOfStudyMapping = mappings.fieldOfStudyMapping

type GroupsDict = Record<Group["id"], Group>
type DocumentType =
   | "userData"
   | "registeredStudent"
   | "participatingStudent"
   | "talentPoolStudent"
   | "careerCenterData"
export default async function main() {
   const counter = new Counter()
   const batch = new BigBatch({ firestore: firestore }) //

   const targetBackfill = getArgValue<DocumentType>("targetBackfill")
   const groups = await groupRepo.getAllGroups()
   counter.addToReadCount(groups.length)
   const groupsDict = convertDocArrayToDict(groups)

   switch (targetBackfill) {
      case "userData":
         backfillUsers(
            await userRepo.getAllUsers(),
            groupsDict,
            batch,
            counter,
            "userData"
         )
         break
      case "registeredStudent":
         backfillUsers(
            await livestreamRepo.getAllRegisteredStudents(),
            groupsDict,
            batch,
            counter,
            "registeredStudent"
         )
         break
      case "participatingStudent":
         backfillUsers(
            await livestreamRepo.getAllParticipatingStudents(),
            groupsDict,
            batch,
            counter,
            "participatingStudent"
         )
         break
      case "talentPoolStudent":
         backfillUsers(
            await livestreamRepo.getAllTalentPoolStudents(),
            groupsDict,
            batch,
            counter,
            "talentPoolStudent"
         )
         break
      case "careerCenterData":
         createCustomGroupCategorySubCollections(groups, batch, counter)
         break
      default:
         throwMigrationError("Invalid targetBackfill")
   }

   Counter.log("Committing batch...")
   await batch.commit()
   Counter.log("Batch committed! ")

   counter.print()
}

const printPercentOfUsersAssignedData = (
   customCount: string,
   counter: Counter
) => {
   const percentOfUsersAssignedFieldOfStudy =
      (counter.getCustomCount(customCount) /
         counter.getCustomCount(customCountKeys.numTotalUsers)) *
      100
   Counter.log(
      `${customCount} from Backfill`,
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
   groupsDict: GroupsDict
): string[] => {
   return (
      userData.registeredGroups?.reduce((acc, registeredGroupSelection) => {
         if (!registeredGroupSelection.categories) return acc

         const registeredGroup = getRegisteredGroup(
            registeredGroupSelection.groupId,
            groupsDict
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

const getRegisteredGroup = (
   registeredGroupId: string,
   groupsDict: GroupsDict
) => {
   return groupsDict[registeredGroupId]
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
   documentType: DocumentType,
   totalUsers: number,
   userIndex: number,
   percent = 10
) => {
   if (userIndex % Math.floor(totalUsers / Math.floor(100 / percent)) === 0) {
      Counter.log(
         `Backfilled ${Math.round(
            (userIndex / totalUsers) * 100
         )}% of ${documentType}`
      )
   }
}

const getQuestionType = (
   questionName: string
): GroupQuestion["questionType"] => {
   const isFieldOfStudy = checkIfHasMatch(questionName, possibleFieldsOfStudy)
   const isLevelOfStudy = checkIfHasMatch(questionName, possibleLevelsOfStudy)

   if (isFieldOfStudy) return "fieldOfStudy"
   if (isLevelOfStudy) return "levelOfStudy"
   return "custom"
}

const convertUserGroupCategoriesToQuestionWithAnswerMap = (
   user: UserData,
   targetGroupId: string,
   groupsDict: GroupsDict
): {
   targetGroup: Group
   userGroupQuestionWithAnswerMap: UserGroupQuestionsWithAnswerMap
} => {
   let userGroupQuestionWithAnswerMap: UserGroupQuestionsWithAnswerMap = null
   const targetGroup = groupsDict[targetGroupId]
   if (!targetGroup) return { targetGroup, userGroupQuestionWithAnswerMap }
   if (!targetGroup?.categories)
      return { userGroupQuestionWithAnswerMap, targetGroup }
   userGroupQuestionWithAnswerMap =
      targetGroup.categories.reduce<UserGroupQuestionsWithAnswerMap>(
         (acc, question) => {
            if (!question.options) return acc
            return {
               ...acc,
               [question.id]: getCategorySelectedOptionId(
                  user,
                  targetGroup,
                  question.id
               ),
            }
         },
         {}
      )

   return { userGroupQuestionWithAnswerMap, targetGroup }
}

const getUniversity = (universityCode, groupsDict: GroupsDict): Group => {
   return Object.values(groupsDict).find(
      (group) => group?.universityCode === universityCode
   )
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

   return category?.selectedValueId || null
}

// Goes through every group and creates a document for each category
// then stores each document in the group's groupQuestions sub-collection
const createCustomGroupCategorySubCollections = (
   groups: Group[],
   batch: BigBatch,
   counter: Counter
) => {
   groups.forEach((group, index) => {
      consoleLogProgressEveryPercent("careerCenterData", groups.length, index)
      if (!group.categories) return
      let groupHasFieldOfStudy, groupHasLevelOfStudy
      const isUniversity = group.universityCode
      if (isUniversity) {
         counter.customCountIncrement(customCountKeys.numUniversityGroups)
      } else {
         counter.customCountIncrement(customCountKeys.numNonUniversityGroups)
      }
      group.categories?.forEach((category) => {
         const categoryRef = firestore
            .collection(`careerCenterData/${group.id}/groupQuestions`)
            .doc(category.id)

         const questionType = getQuestionType(category.name)
         if (!groupHasFieldOfStudy) {
            groupHasFieldOfStudy = questionType === "fieldOfStudy"
         }
         if (!groupHasLevelOfStudy) {
            groupHasLevelOfStudy = questionType === "levelOfStudy"
         }

         if (isUniversity || questionType === "custom") {
            const categoryData: GroupQuestion = {
               id: category.id,
               name: category.name,
               options: convertDocArrayToDict(category.options),
               questionType: questionType,
            }
            batch.set(categoryRef, categoryData)
         }
         counter.customCountIncrement(customCountKeys.numGroupQuestions)
         counter.writeIncrement()
      })

      if (!groupHasFieldOfStudy && !groupHasLevelOfStudy && isUniversity) {
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
}

const checkIfHasMatch = (questionName: string, possibleNames: string[]) => {
   return possibleNames
      .map((name) => trimAndLowerCase(name))
      .includes(trimAndLowerCase(questionName))
}
const trimAndLowerCase = (str: string) => {
   return str.trim().toLowerCase()
}

/*
 * Goes through every user and does 2 things:
 *
 * 1. If the user has registered groups, it tries to find their field of study and level of study
 *    based on their registered groups data
 * 2. If the user has a university, it gets the universities group categories and maps all the selected
 *    categories of the university to the user and stores them as a dictionary in the
 *    user's user.university.questions field
 * */
const backfillUsers = (
   users:
      | UserData[]
      | RegisteredStudent[]
      | ParticipatingStudent[]
      | TalentPoolStudent[],
   groupsDict: GroupsDict,
   batch: BigBatch,
   counter: Counter,
   documentType: DocumentType
) => {
   counter.addToCustomCount(customCountKeys.numTotalUsers, users.length)
   counter.addToReadCount(users.length)
   for (let index = 0; index < users.length; index++) {
      // fastest looping method
      const userData = users[index]
      consoleLogProgressEveryPercent(documentType, users.length, index)

      if (userData.registeredGroups) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithRegisteredGroups
         )
      }

      // @ts-ignore
      const userRef = userData.ref

      const fieldsOfStudy = getUserCategorySelectionByPossibleNames(
         possibleFieldsOfStudy,
         userData,
         groupsDict
      )

      const levelsOfStudy = getUserCategorySelectionByPossibleNames(
         possibleLevelsOfStudy,
         userData,
         groupsDict
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
      const university = getUniversity(userData.university?.code, groupsDict)

      const additionalUserDataToUpdate =
         storeLivestreamGroupQuestionsWithAnswersOnUser(
            userData,
            groupsDict,
            batch,
            counter
         )

      updateData = {
         ...updateData,
         university: {
            ...userData.university,
            groupId: university?.id || null,
            questions: convertUserGroupCategoriesToQuestionWithAnswerMap(
               userData,
               university?.id,
               groupsDict
            ).userGroupQuestionWithAnswerMap,
         },
         ...(backFills.length && {
            backFills: FieldValue.arrayUnion(...backFills),
         }),
         ...(additionalUserDataToUpdate && additionalUserDataToUpdate),
      }
      batch.update(userRef, updateData)
      counter.writeIncrement()
   }
   printPercentOfUsersAssignedData(
      customCountKeys.numUsersWithAssignedFieldOfStudy,
      counter
   )
   printPercentOfUsersAssignedData(
      customCountKeys.numUsersWithAssignedLevelOfStudy,
      counter
   )
}

const storeLivestreamGroupQuestionsWithAnswersOnUser = (
   userData: UserData,
   groupsDict: GroupsDict,
   batch: BigBatch,
   counter: Counter
): Partial<RegisteredStudent> => {
   // @ts-ignore
   const userRef = userData.ref
   const dataDict: Record<Group["id"], UserGroupQuestionsWithAnswerMap> = {}
   const path = userRef.path
   let livestreamId = ""
   const isInUserDataCollection =
      path.startsWith("userData/") && path.endsWith(userData.userEmail)
   const isInLivestreamsSubcollection =
      path.startsWith("livestreams/") && path.endsWith(userData.userEmail)
   if (isInLivestreamsSubcollection) {
      livestreamId = path.split("/")[1]
   }
   if (userData.registeredGroups?.length) {
      // Create a document for each group with all the questions for that group
      // along with their answers/selectedOptionId and store them in a sub-collection
      // called userGroupQuestionsWithAnswers
      userData.registeredGroups.forEach((registeredGroup) => {
         const { userGroupQuestionWithAnswerMap, targetGroup } =
            convertUserGroupCategoriesToQuestionWithAnswerMap(
               userData,
               registeredGroup.groupId,
               groupsDict
            )
         if (!targetGroup) return
         const data: UserGroupData = {
            id: targetGroup.id,
            userUid: userData.authId || "",
            groupId: targetGroup.id,
            groupName: targetGroup.universityName,
            groupLogo: targetGroup.logoUrl || "",
            groupUniversityCode: targetGroup.universityCode || "",
            questions: userGroupQuestionWithAnswerMap,
         }
         if (!isInUserDataCollection) {
            dataDict[registeredGroup.groupId] = userGroupQuestionWithAnswerMap
         } else {
            const userGroupDataRef = userRef
               .collection("userGroups")
               .doc(registeredGroup.groupId)
            counter.writeIncrement()
            batch.set(userGroupDataRef, data, {
               merge: true,
            })
         }
      })
   }
   return isInUserDataCollection
      ? undefined
      : { livestreamGroupQuestionAnswers: dataDict, livestreamId }
}

const throwMigrationError = (message: string) => {
   throw new Error(
      `Migration canceled, dont worry no mutations have been made, Error Message: ${message}`
   )
}
