import { firestore } from "../../../lib/firebase"
import {
   ParticipatingStudent,
   RegisteredStudent,
   TalentPoolStudent,
   UserData,
   UserReadableGroupQuestionsWithAnswerMap,
} from "@careerfairy/shared-lib/dist/users"
import Counter from "../../../lib/Counter"
import {
   Group,
   UserGroupData,
   UserGroupQuestionsWithAnswerMap,
} from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleLevelsOfStudy,
   possibleOthers,
} from "../../../constants"
import { RegisteredGroup } from "@careerfairy/shared-lib/dist/users/users"
import {
   checkIfHasMatch,
   removeDuplicates,
   throwMigrationError,
   trimAndLowerCase,
} from "../../../util/misc"
import * as mappings from "@careerfairy/firebase-scripts/data/fieldAndLevelOfStudyMapping.json"
import {
   BulkWriter,
   DocumentReference,
   FieldValue,
   Timestamp,
} from "firebase-admin/firestore"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { groupRepo, livestreamRepo, userRepo } from "../../../repositories"
import { getArgValue } from "../../../index"
import {
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { ReadableQuestionAndAnswer } from "@careerfairy/shared-lib/src/users"
import { GroupCategory } from "@careerfairy/shared-lib/src/groups"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"

const customCountKeys = {
   numTotalUsers: "Total Users",
   numUsersWithFieldOfStudy: "Users with Field of Study",
   numUsersWithLevelOfStudy: "Users with Level of Study",
   numUsersWithRegisteredGroups: "Users with Registered Groups",
   numUsersWithAssignedFieldOfStudy: "Users with Assigned Field of Study",
   numUsersWithAssignedLevelOfStudy: "Users with Assigned Level of Study",
}

const levelOfStudyMapping = mappings.levelOfStudyMapping
const fieldOfStudyMapping = mappings.fieldOfStudyMapping

type GroupsDict = Record<Group["id"], Group>
type DocumentType =
   | "registeredStudent"
   | "participatingStudent"
   | "talentPoolStudent"
   | "userData"

export async function run() {
   const counter = new Counter()
   const targetBackfill = getArgValue<DocumentType>("targetBackfill")
   try {
      const bulkWriter = firestore.bulkWriter()
      const groups = await groupRepo.getAllGroups()
      counter.addToReadCount(groups.length)
      counter.setCustomCount(counterConstants.numFailedWrites, 0)
      const groupsDict = convertDocArrayToDict(groups)

      switch (targetBackfill) {
         case "userData":
            backfillUsers(
               await userRepo.getAllUsers(true),
               groupsDict,
               bulkWriter,
               counter,
               "userData"
            )
            break
         case "registeredStudent":
            backfillUsers(
               await livestreamRepo.getAllRegisteredStudents(true),
               groupsDict,
               bulkWriter,
               counter,
               "registeredStudent"
            )
            break
         case "participatingStudent":
            backfillUsers(
               await livestreamRepo.getAllParticipatingStudents(true),
               groupsDict,
               bulkWriter,
               counter,
               "participatingStudent"
            )
            break
         case "talentPoolStudent":
            backfillUsers(
               await livestreamRepo.getAllTalentPoolStudents(true),
               groupsDict,
               bulkWriter,
               counter,
               "talentPoolStudent"
            )
            break
         default:
            throwMigrationError("Invalid targetBackfill")
      }

      Counter.log("Committing all writes...")
      writeProgressBar.start(
         counter.write(),
         counter.getCustomCount(counterConstants.numSuccessfulWrites)
      )
      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
      await bulkWriter.close()
      writeProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      printPercentOfUsersAssignedData(
         customCountKeys.numUsersWithAssignedFieldOfStudy,
         counter
      )
      printPercentOfUsersAssignedData(
         customCountKeys.numUsersWithAssignedLevelOfStudy,
         counter
      )
      counter.print()
   }
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
   const withoutOthers = fieldOfStudyLabels
      .map(trimAndLowerCase)
      .filter(
         (fieldOfStudyLabel) => !possibleOthers.includes(fieldOfStudyLabel)
      )
   // first try and find field of study labels that arent others
   // if no labels remain after filtering out "others", return the original labels
   return withoutOthers.length ? withoutOthers : fieldOfStudyLabels
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
      return [...acc, trimAndLowerCase(categoryOption.name)]
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
      checkIfHasMatch(category.name, possibleNames)
   )
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

const getUserReadableGroupQuestionsWithAnswerMap = (
   user: UserData,
   group: Group
): UserReadableGroupQuestionsWithAnswerMap => {
   if (!group?.categories) return null
   if (!user.registeredGroups?.length) return null
   return group.categories.reduce<UserReadableGroupQuestionsWithAnswerMap>(
      (acc, groupCategory) => {
         if (!groupCategory.options) return acc
         return {
            ...acc,
            [groupCategory.id]: getReadableQuestionAndAnswer(
               user,
               group,
               groupCategory
            ),
         }
      },
      {}
   )
}
const getReadableQuestionAndAnswer = (
   user: UserData,
   group: Group,
   groupCategory: GroupCategory
): ReadableQuestionAndAnswer => {
   const userRegisteredGroup = user.registeredGroups?.find(
      (registeredGroup) => registeredGroup.groupId === group.id
   )
   const userCategory = userRegisteredGroup?.categories?.find(
      (registeredCategory) => registeredCategory.id === groupCategory.id
   )
   const userSelectedOption = groupCategory?.options?.find(
      (option) => option.id === userCategory?.selectedValueId
   )
   if (!userSelectedOption) return null
   return {
      questionId: groupCategory.id,
      questionName: groupCategory.name,
      answerId: userCategory?.selectedValueId,
      answerName: userSelectedOption?.name,
   }
}

const getUniversity = (user: UserData, groupsDict: GroupsDict): Group => {
   const groups = Object.values(groupsDict)

   // get university User is following
   const registeredUniGroup = groups.find(
      (group) =>
         group.universityCode === user.university?.code &&
         user.groupIds?.includes(group.id)
   )
   if (registeredUniGroup) {
      return registeredUniGroup
   }
   // Otherwise get first university group User is registered to
   return groups.find(
      (group) => group?.universityCode === user.university?.code
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
   bulkWriter: BulkWriter,
   counter: Counter,
   documentType: DocumentType
) => {
   counter.setCustomCount(customCountKeys.numTotalUsers, users.length)
   counter.setCustomCount(counterConstants.totalNumDocs, users.length)
   counter.addToReadCount(users.length)
   loopProgressBar.start(users.length, 0)

   for (let index = 0; index < users.length; index++) {
      // fastest looping method
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)
      const userData = users[index]
      if (
         (userData.fieldOfStudy && userData.levelOfStudy) ||
         !userData.registeredGroups?.length
      ) {
         // skip if user already has been assigned both or
         // does not have any legacy registration data to map
         continue
      }

      if (userData.registeredGroups) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithRegisteredGroups
         )
      }

      // @ts-ignore
      const userRef = userData.ref as DocumentReference
      // @ts-ignore
      delete userData.ref

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

      let updateData:
         | UserData
         | ParticipatingStudent
         | TalentPoolStudent
         | RegisteredStudent = {
         ...userData,
      }
      const backFills = []
      if (assignedFieldOfStudy && !userData.fieldOfStudy) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithAssignedFieldOfStudy
         )
         updateData["fieldOfStudy"] = assignedFieldOfStudy
         backFills.push("fieldOfStudy")
      }
      if (assignedLevelOfStudy && !userData.levelOfStudy) {
         counter.customCountIncrement(
            customCountKeys.numUsersWithAssignedLevelOfStudy
         )
         updateData["levelOfStudy"] = assignedLevelOfStudy
         backFills.push("levelOfStudy")
      }
      const university = getUniversity(userData, groupsDict)

      const dataForUserLivestreamData =
         storeLivestreamGroupQuestionsWithAnswersInUserLivestreamDataCollection(
            userData,
            userRef,
            groupsDict,
            bulkWriter,
            counter
         )

      // @ts-ignore
      updateData = {
         ...updateData,
         university: {
            ...userData.university,
            questions: getUserReadableGroupQuestionsWithAnswerMap(
               userData,
               university
            ),
         },
         ...(backFills.length && {
            backFills: FieldValue.arrayUnion(...backFills),
         }),
      }

      setUserLivestreamData(
         updateData,
         bulkWriter,
         documentType,
         counter,
         userRef,
         dataForUserLivestreamData
      )
      counter.writeIncrement()
   }
   loopProgressBar.stop()
}

const storeLivestreamGroupQuestionsWithAnswersInUserLivestreamDataCollection = (
   userData:
      | UserData
      | RegisteredStudent
      | ParticipatingStudent
      | TalentPoolStudent,
   userRef: DocumentReference,
   groupsDict: GroupsDict,
   bulkWriter: BulkWriter,
   counter: Counter
): Partial<UserLivestreamData> => {
   // @ts-ignore
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
         if (isInUserDataCollection) {
            // only store this as a subcollection for userData Documents
            const data: UserGroupData = {
               id: targetGroup.id,
               userUid: userData.authId || "",
               groupId: targetGroup.id,
               groupName: targetGroup.universityName,
               groupLogo: targetGroup.logoUrl || "",
               groupUniversityCode: targetGroup.universityCode || "",
               questions: userGroupQuestionWithAnswerMap,
            }
            const userGroupDataRef = userRef
               .collection("userGroups")
               .doc(registeredGroup.groupId)
            counter.writeIncrement()
            bulkWriter
               .set(userGroupDataRef, data, {
                  merge: true,
               })
               .then(() => handleBulkWriterSuccess(counter))
               .catch((err) => handleBulkWriterError(err, counter))
         } else {
            // for RegisteredStudent ParticipatingStudent TalentPoolStudent
            // store it all in a dictionary
            dataDict[registeredGroup.groupId] = userGroupQuestionWithAnswerMap
         }
      })
   }
   if (isInUserDataCollection) {
      return undefined
   } else {
      // we only return data to be merged into the livestream/userLivestreamData/document
      return { answers: dataDict, livestreamId }
   }
}

const getUserAction = (documentType: DocumentType): LivestreamUserAction => {
   let userAction: LivestreamUserAction
   switch (documentType) {
      case "participatingStudent":
         userAction = "participated"
         break
      case "registeredStudent":
         userAction = "registered"
         break
      case "talentPoolStudent":
         userAction = "talentPool"
         break
      default:
         throwMigrationError(`Unknown document type ${documentType}`)
   }
   return userAction
}

const getUserSubCollectionDateField = (
   documentType: DocumentType
): "joined" | "registeredStudent" | "talentPoolStudent" => {
   let dateField = null
   switch (documentType) {
      case "participatingStudent":
         dateField = "joined"
         break
      case "registeredStudent":
         dateField = "dateRegistered"
         break
      case "talentPoolStudent":
         dateField = "dateJoinedTalentPool"
         break
      default:
         throwMigrationError(`Unknown document type ${documentType}`)
   }
   return dateField
}

const setUserLivestreamData = (
   updateData:
      | ParticipatingStudent
      | TalentPoolStudent
      | RegisteredStudent
      | UserData,
   bulkWriter: BulkWriter,
   documentType: DocumentType,
   counter: Counter,
   userRef: DocumentReference,
   dataForUserLivestreamData: Partial<UserLivestreamData>
) => {
   // if is userData document just update user
   if (documentType === "userData") {
      bulkWriter
         .update(userRef, updateData)
         .then(() => handleBulkWriterSuccess(counter))
         .catch((err) => handleBulkWriterError(err, counter))
      return
   }
   const livestreamId = userRef.parent.parent.id

   const updateRef = firestore
      .collection(`livestreams`)
      .doc(livestreamId)
      .collection("userLivestreamData")
      .doc(updateData.id)
   const dateField = getUserSubCollectionDateField(documentType)
   const userAction = getUserAction(documentType)
   const dateOfAction =
      updateData[dateField] ||
      Timestamp.fromDate(new Date("March 17, 2020 03:24:00"))
   delete updateData[dateField]
   bulkWriter
      .set(
         updateRef,
         {
            userId: updateData.authId || null,
            user: {
               ...updateData,
            },
            [userAction]: {
               date: dateOfAction,
            },
            livestreamId,
            ...dataForUserLivestreamData,
         } as UserLivestreamData,
         { merge: true }
      )
      .then(() => handleBulkWriterSuccess(counter))
      .catch((err) => handleBulkWriterError(err, counter))
}
