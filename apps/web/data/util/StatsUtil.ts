import {
   Group,
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestion,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { CSVDownloadUserData, UserData } from "@careerfairy/shared-lib/users"
import { dynamicSort } from "@careerfairy/shared-lib/utils"

export default class StatsUtil {
   static getUserAnswerNameFromLivestreamGroupQuestion(
      userLivestreamData: UserLivestreamData,
      groupId: string,
      question: LivestreamGroupQuestion
   ): string {
      const userAnswerId =
         userLivestreamData?.answers?.[groupId]?.[question?.id]
      return question?.options?.[userAnswerId]?.name
   }

   static getCsvData(
      requestingGroup: Group,
      targetStream: LivestreamEvent,
      users: UserLivestreamData[],
      groupQuestions: GroupQuestion[]
   ): CSVDownloadUserData[] {
      return users
         ?.map((data) => {
            const otherCustomUniversityCategories = Object.keys(
               targetStream.groupQuestionsMap || {}
            ).reduce<
               Record<GroupQuestion["name"], GroupQuestionOption["name"]>
            >((acc, groupId) => {
               const groupData = targetStream.groupQuestionsMap[groupId]
               Object.values(groupData.questions).forEach((question) => {
                  acc[question.name] =
                     this.getUserAnswerNameFromLivestreamGroupQuestion(
                        data,
                        groupData.groupId,
                        question
                     )
               })
               return acc
            }, {})
            return {
               "First Name": data.user.firstName,
               "Last Name": data.user.lastName,
               Email: data.user.userEmail,
               University: data.user.university?.name || "N/A",
               "Level of study":
                  StatsUtil.getUserUniLevelOrFieldOfStudyCategoryByType(
                     "levelOfStudy",
                     groupQuestions,
                     data.user
                  ),
               "Field of study":
                  StatsUtil.getUserUniLevelOrFieldOfStudyCategoryByType(
                     "fieldOfStudy",
                     groupQuestions,
                     data.user
                  ),
               ...otherCustomUniversityCategories,
            }
         })
         .sort(dynamicSort("First Name"))
   }

   static getUserUniLevelOrFieldOfStudyCategoryByType(
      type: GroupQuestion["questionType"],
      groupQuestions: GroupQuestion[],
      user: UserData
   ): GroupQuestionOption["name"] | "N/A" {
      const groupQuestion = groupQuestions.find(
         (question) => question.questionType === type
      )
      const userSelectedAnswerId =
         user.university?.questions?.[groupQuestion?.id]?.answerId
      let name = user.university?.questions?.[groupQuestion?.id]?.answerName
      if (!name) {
         name = groupQuestion?.options?.[userSelectedAnswerId]?.name
      }
      if (!name) {
         return type === "levelOfStudy"
            ? user.levelOfStudy?.name
            : type === "fieldOfStudy"
            ? user.fieldOfStudy?.name
            : "N/A"
      }
      return name || "N/A"
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
}
