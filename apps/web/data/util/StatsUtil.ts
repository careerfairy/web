import {
   Group,
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/dist/groups"
import {
   CSVDownloadUserData,
   RegisteredStudent,
   UserData,
   TalentPoolStudent,
} from "@careerfairy/shared-lib/dist/users"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { getUserAnswerNameFromLivestreamGroupQuestion } from "@careerfairy/shared-lib/dist/livestreams"

export default class StatsUtil {
   static getStudentInGroupDataObject(student, group) {
      let studentDataObject = {
         "First Name": student.firstName,
         "Last Name": student.lastName,
         Email: student.userEmail,
         University: student.university?.name || "N/A",
      }
      let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(
         student,
         group.groupId
      )
      if (
         studentCategoriesForGroup &&
         studentCategoriesForGroup.categories &&
         studentCategoriesForGroup.categories.length &&
         group.categories
      ) {
         group.categories.forEach((category) => {
            let studentCatValue = studentCategoriesForGroup.categories.find(
               (studCat) => studCat.id === category.id
            )
            if (studentCatValue) {
               let studentSelectedOption = category.options.find(
                  (option) => option.id === studentCatValue.selectedValueId
               )
               if (studentSelectedOption) {
                  studentDataObject[category.name] = studentSelectedOption.name
               }
            }
         })
      }
      return studentDataObject
   }

   static getCsvData(
      requestingGroup: Group,
      targetStream: LivestreamEvent,
      users: TalentPoolStudent[] | RegisteredStudent[],
      groupQuestions: GroupQuestion[]
   ): CSVDownloadUserData[] {
      try {
         return users
            .map((user) => {
               const otherCustomUniversityCategories = Object.keys(
                  targetStream.groupQuestionsMap || {}
               ).reduce((acc, groupId) => {
                  const groupData = targetStream.groupQuestionsMap[groupId]
                  Object.values(groupData.questions).forEach((question) => {
                     acc[question.name] =
                        getUserAnswerNameFromLivestreamGroupQuestion(
                           user,
                           groupData.groupId,
                           question
                        )
                  })
                  return acc
               }, {})
               return {
                  "First Name": user.firstName,
                  "Last Name": user.lastName,
                  Email: user.userEmail,
                  University: user.university?.name || "N/A",
                  "Level of study":
                     StatsUtil.getUserUniLevelOrFieldOfStudyCategoryByType(
                        "levelOfStudy",
                        groupQuestions,
                        user
                     ),
                  "Field of study":
                     StatsUtil.getUserUniLevelOrFieldOfStudyCategoryByType(
                        "fieldOfStudy",
                        groupQuestions,
                        user
                     ),
                  ...otherCustomUniversityCategories,
               }
            })
            .sort(dynamicSort("First Name"))
      } catch (error) {
         console.log(error)
      }
   }

   static getUserUniLevelOrFieldOfStudyCategoryByType(
      type: Omit<GroupQuestion["questionType"], "custom">,
      groupQuestions: GroupQuestion[],
      user: TalentPoolStudent | RegisteredStudent
   ): GroupQuestionOption["name"] | "N/A" {
      const groupQuestion = groupQuestions.find(
         (question) => question.questionType === type
      )
      const userSelectedAnswerId =
         user.university?.questions?.[groupQuestion?.id]
      const name = groupQuestion?.options?.[userSelectedAnswerId]?.name
      if (!name) {
         return type === "levelOfStudy"
            ? user.levelOfStudy?.name
            : type === "fieldOfStudy"
            ? user.fieldOfStudy?.name
            : "N/A"
      }
      return name || "N/A"
   }

   static getStudentOutsideGroupDataObject(student, allGroups) {
      let studentMainGroup = allGroups.find((group) => {
         if (group.universityCode) {
            return group.universityCode === student.university?.code
         }
      })
      let studentDataObject = {
         "First Name": student.firstName,
         "Last Name": student.lastName,
         Email: student.userEmail,
         University: student.university?.name || "N/A",
      }
      if (studentMainGroup) {
         let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(
            student,
            studentMainGroup.groupId
         )
         if (
            studentCategoriesForGroup &&
            studentCategoriesForGroup.categories &&
            studentCategoriesForGroup.categories.length &&
            studentMainGroup.categories
         ) {
            studentMainGroup.categories.forEach((category) => {
               let studentCatValue = studentCategoriesForGroup.categories.find(
                  (studCat) => studCat.id === category.id
               )
               if (studentCatValue) {
                  let studentSelectedOption = category.options.find(
                     (option) => option.id === studentCatValue.selectedValueId
                  )
                  if (studentSelectedOption) {
                     studentDataObject[category.name] =
                        studentSelectedOption.name
                  }
               }
            })
         }
      } else if (student.groupIds && student.groupIds[0]) {
         let currentGroup = allGroups.find(
            (group) => group.groupId === student.groupIds[0]
         )
         if (currentGroup) {
            let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(
               student,
               student.groupIds[0]
            )
            if (
               studentCategoriesForGroup &&
               studentCategoriesForGroup.categories &&
               studentCategoriesForGroup.categories.length &&
               currentGroup.categories
            ) {
               currentGroup.categories.forEach((category) => {
                  let studentCatValue =
                     studentCategoriesForGroup.categories.find(
                        (studCat) => studCat.id === category.id
                     )
                  if (studentCatValue) {
                     let studentSelectedOption = category.options.find(
                        (option) =>
                           option.id === studentCatValue.selectedValueId
                     )
                     if (studentSelectedOption) {
                        studentDataObject[category.name] =
                           studentSelectedOption.name
                     }
                  }
               })
            }
         }
      }
      return studentDataObject
   }

   static getGroupByUniversityCode(allGroups, universityCode) {
      return allGroups.find((group) => group.universityCode === universityCode)
   }

   static getStudentCategories(student, allGroups) {
      let studentMainGroup = StatsUtil.getGroupByUniversityCode(
         allGroups,
         student.university
      )
      if (
         student.categories &&
         student.registeredGroups[studentMainGroup.groupId]
      ) {
         return StatsUtil.getRegisteredGroupById(
            student,
            studentMainGroup.groupId
         )
      } else {
         return StatsUtil.getRegisteredGroupById(student, student.groupIds[0])
      }
   }

   static getRegisteredStudentsStats(registeredStudentsFromGroup, group) {
      if (StatsUtil.groupHasSpecializedCategories(group)) {
         return StatsUtil.getSpecializedStudentStats(
            registeredStudentsFromGroup,
            group
         )
      }
      let categoryStats = {}
      if (group.categories && group.length) {
         group.categories.forEach((category) => {
            category.options.forEach((option) => {
               if (!categoryStats[category.id]) {
                  categoryStats[category.id] = {}
               }
               categoryStats[category.id][option.id] = 0
            })
            categoryStats[category.id].name = category.name
         })
         registeredStudentsFromGroup.forEach((student) => {
            let registeredGroup = StatsUtil.getRegisteredGroupById(
               student,
               group.groupId
            )
            if (registeredGroup) {
               registeredGroup.categories.forEach((category) => {
                  categoryStats[category.id][category.selectedValueId] =
                     categoryStats[category.id][category.selectedValueId] + 1
               })
            }
         })
      }
      return categoryStats
   }

   static groupHasSpecializedCategories(group) {
      if (group.categories) {
         let fieldOfStudyCategory = group.categories.find(
            (category) => category.name.toLowerCase() === "field of study"
         )
         let levelOfStudyCategory = group.categories.find(
            (category) => category.name.toLowerCase() === "level of study"
         )
         return fieldOfStudyCategory && levelOfStudyCategory
      }
      return false
   }

   static getSpecializedStudentStats(registeredStudentsFromGroup, group) {
      let fieldOfStudyCategory = group.categories.find(
         (category) => category.name.toLowerCase() === "field of study"
      )
      let levelOfStudyCategory = group.categories.find(
         (category) => category.name.toLowerCase() === "level of study"
      )
      let categoryStats = {
         type: "specialized",
         id: fieldOfStudyCategory.id,
         options: {},
         names: levelOfStudyCategory.options.map((option) => option.name),
      }
      fieldOfStudyCategory.options.forEach((option) => {
         let optionObj = {
            name: option.name,
            id: levelOfStudyCategory.id,
            entries: 0,
            subOptions: {},
         }
         levelOfStudyCategory.options.forEach((option2) => {
            let option2Obj = {
               name: option2.name,
               entries: 0,
            }
            optionObj.subOptions[option2.id] = option2Obj
         })
         categoryStats.options[option.id] = optionObj
      })
      registeredStudentsFromGroup.forEach((student) => {
         let registeredGroup = StatsUtil.getRegisteredGroupById(
            student,
            group.groupId
         )
         let fieldOfStudyOptionId = registeredGroup?.categories.find(
            (category) => category.id === fieldOfStudyCategory.id
         )?.selectedValueId
         let levelOfStudyOptionId = registeredGroup?.categories.find(
            (category) => category.id === levelOfStudyCategory.id
         )?.selectedValueId
         if (
            categoryStats.options[fieldOfStudyOptionId] &&
            categoryStats.options[fieldOfStudyOptionId].subOptions[
               levelOfStudyOptionId
            ]
         ) {
            categoryStats.options[fieldOfStudyOptionId].entries =
               categoryStats.options[fieldOfStudyOptionId].entries + 1
            categoryStats.options[fieldOfStudyOptionId].subOptions[
               levelOfStudyOptionId
            ].entries =
               categoryStats.options[fieldOfStudyOptionId].subOptions[
                  levelOfStudyOptionId
               ].entries + 1
         }
      })
      return categoryStats
   }

   static getRegisteredGroupById(student, groupId) {
      return student.registeredGroups?.find(
         (category) => category?.groupId === groupId
      )
   }

   static studentBelongsToGroup(student: UserData, group: Group) {
      if (group.universityCode) {
         if (student.university?.code === group.universityCode) {
            return student.groupIds && student.groupIds.includes(group.groupId)
         } else {
            return false
         }
      } else {
         return student.groupIds && student.groupIds.includes(group.groupId)
      }
   }

   static studentHasSelectedCategory(student, group, targetCategoryId) {
      if (!targetCategoryId) return false
      const studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(
         student,
         group?.id
      )
      return studentCategoriesForGroup?.categories?.some(
         (category) => category?.id === targetCategoryId
      )
   }

   static studentFollowsGroup(student: UserData, group: Group) {
      return student.groupIds && student.groupIds.includes(group.groupId)
   }

   static getGroupThatStudentBelongsTo(student, groups) {
      const studentUniversityGroup = StatsUtil.getStudentUniversityGroup(
         student,
         groups
      )
      return (
         studentUniversityGroup ||
         StatsUtil.getFirstGroupUserBelongsTo(student, groups)
      )
   }

   static getStudentUniversityGroup(student, groups) {
      return groups.find(
         (uniGroup) => student.university?.code === uniGroup?.universityCode
      )
   }

   static getFirstGroupUserBelongsTo(student, groups) {
      return groups.find(
         (grp) => student.groupIds && student?.groupIds?.includes(grp?.groupId)
      )
   }

   static studentHasAllCategoriesOfGroup(student, group) {
      const studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(
         student,
         group.id
      )
      // If the group exists but has no categories,
      // it means that the student has all categories so return true
      if (group && !group.categories?.length) {
         return true
      }
      return group.categories.every((groupCategory) => {
         return studentCategoriesForGroup?.categories.find(
            // check to see if the student has all the non hidden group categories
            (studCat) =>
               studCat?.id === groupCategory?.id || groupCategory.hidden
         )
      })
   }

   static getFirstGroupThatUserBelongsTo(
      student: UserData,
      arrayOfGroups = [],
      requestingGroup,
      forCategoryData?: boolean
   ) {
      let groupThatUserBelongsTo
      const userFollowsRequestingGroup = StatsUtil.studentFollowsGroup(
         student,
         requestingGroup
      )
      if (forCategoryData && !requestingGroup?.categories?.length) {
         groupThatUserBelongsTo =
            arrayOfGroups.find((group) => group?.categories?.length) ||
            requestingGroup
      } else if (userFollowsRequestingGroup) {
         groupThatUserBelongsTo = requestingGroup
      } else {
         groupThatUserBelongsTo = arrayOfGroups.find((group) =>
            StatsUtil.studentFollowsGroup(student, group)
         )
      }
      return groupThatUserBelongsTo
   }

   static mapUserCategorySelection({ userData, group, alreadyJoined }) {
      let mappedGroupCategories = []
      const userCategories = userData?.registeredGroups?.find(
         (el) => el.groupId === group.id
      )?.categories
      if (group?.categories?.length) {
         mappedGroupCategories = group.categories.map((groupCategory) => {
            if (userCategories && alreadyJoined) {
               let userSelectedValueId = ""
               const newGroupCategory = { ...groupCategory }
               const userCategory = userCategories.find(
                  (userCat) => userCat.id === newGroupCategory.id
               )

               if (userCategory) {
                  userSelectedValueId = userCategory.selectedValueId
               }
               return {
                  ...newGroupCategory,
                  selectedValueId: userSelectedValueId,
                  isNew: !Boolean(userSelectedValueId),
               }
            } else {
               return {
                  ...groupCategory,
                  selectedValueId: "",
               }
            }
         })

         return mappedGroupCategories
      }
   }
}
