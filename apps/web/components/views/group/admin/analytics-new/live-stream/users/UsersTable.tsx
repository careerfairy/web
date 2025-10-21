import {
   LivestreamGroupQuestionsMap,
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { collection } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { useAuth } from "../../../../../../../HOCs/AuthProvider"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import UserDataTableProvider, {
   DocumentPaths,
} from "../../../common/table/UserDataTableProvider"
import UserLivestreamDataTable, {
   DataPrivacyTable,
   TableSkeleton,
   UserDataEntry,
} from "../../../common/table/UserLivestreamDataTable"
import {
   LivestreamUserType,
   useLivestreamsAnalyticsPageContext,
} from "../LivestreamAnalyticsPageProvider"

const UsersTable = () => {
   const { group } = useGroup()
   const { userData } = useAuth()

   const {
      currentStreamStats,
      fieldsOfStudyLookup,
      levelsOfStudyLookup,
      userType,
   } = useLivestreamsAnalyticsPageContext()

   // If the privacy policy is not active/set, show the data privacy table prompt and not the user data table
   // for registrations, except for CF admins
   if (
      userType === "registrations" &&
      !group.privacyPolicyActive &&
      !userData?.isAdmin
   ) {
      return <DataPrivacyTable />
   }

   if (!currentStreamStats || !fieldsOfStudyLookup || !levelsOfStudyLookup) {
      return <TableSkeleton />
   }

   return <DataTable />
}

const DataTable = () => {
   const {
      currentStreamStats,
      fieldsOfStudyLookup,
      levelsOfStudyLookup,
      userType,
      groupQuestionsMap,
   } = useLivestreamsAnalyticsPageContext()

   const collectionQuery = useMemo(
      () =>
         collection(
            FirestoreInstance,
            "livestreams",
            currentStreamStats.livestream.id,
            "userLivestreamData"
         ),
      [currentStreamStats.livestream.id]
   )

   const documentPaths = useMemo<DocumentPaths>(
      () => ({
         userFieldOfStudyName: "user.fieldOfStudy.name",
         userLevelOfStudyName: "user.levelOfStudy.name",
         userFieldOfStudyId: "user.fieldOfStudy.id",
         userLevelOfStudyId: "user.levelOfStudy.id",
         userUniversityCode: "user.university.code",
         userUniversityCountryCode: "user.universityCountryCode",
         userUniversityName: "user.university.name",
         userFirstName: "user.firstName",
         userLastName: "user.lastName",
         orderBy: `${getUserType(userType)}.date`,
         orderDirection: "desc",
         userEmail: "user.userEmail",
         userResume: "user.userResume",
         userLinkedIn: "user.linkedInUrl",
      }),
      [userType]
   )

   const converterFnWrapper = useMemo(
      () => (doc: unknown) => {
         const userLivestreamData = doc as UserLivestreamData
         return converterFn(userLivestreamData, groupQuestionsMap)
      },
      [groupQuestionsMap]
   )

   return (
      <UserDataTableProvider
         fieldsOfStudyLookup={fieldsOfStudyLookup}
         levelsOfStudyLookup={levelsOfStudyLookup}
         documentPaths={documentPaths}
         targetCollectionQuery={collectionQuery}
         converterFn={converterFnWrapper}
         title={getTitle(userType, currentStreamStats)}
         userType={userType}
      >
         <UserLivestreamDataTable emptyResultsMessage="Create a live stream to collect analytics." />
      </UserDataTableProvider>
   )
}

const converterFn = (
   doc: UserLivestreamData,
   groupQuestionsMap: LivestreamGroupQuestionsMap | Record<string, never>
): UserDataEntry => {
   const answersByQuestionName: Record<string, string> = {}
   const questionsMap = groupQuestionsMap || {}
   const answers = doc?.answers || {}

   // Iterate through each group that the user answered questions for
   Object.keys(answers).forEach((groupId) => {
      const groupAnswer = (answers as any)[groupId] || {}
      const groupQuestionConfig = (questionsMap as any)?.[groupId]
      const questionsConfig = groupQuestionConfig?.questions || {}

      // For each question in this group, map the user's answer IDs to option names
      Object.keys(groupAnswer).forEach((questionId) => {
         const rawOptionIds = groupAnswer[questionId]
         // Handle both single answers (string) and multiple answers (array)
         const optionIds: string[] = Array.isArray(rawOptionIds)
            ? (rawOptionIds as string[])
            : rawOptionIds
            ? [rawOptionIds as string]
            : []
         const questionConfig = questionsConfig?.[questionId]
         const questionName = questionConfig?.name as string | undefined

         if (!questionName) return

         // Convert option IDs to human-readable option names
         const optionNameList = optionIds
            .map((optionId) => questionConfig?.options?.[optionId]?.name)
            .filter(Boolean) as string[]

         // Store as comma-separated list for CSV export
         answersByQuestionName[questionName] = optionNameList.join(", ")
      })
   })

   return {
      email: doc.user.userEmail,
      firstName: doc.user.firstName || "",
      lastName: doc.user.lastName || "",
      universityName: doc.user.university?.name || "",
      universityCountryCode: doc.user.universityCountryCode || "",
      fieldOfStudy: doc.user.fieldOfStudy?.name || "",
      levelOfStudy: doc.user.levelOfStudy?.name || "",
      linkedInUrl: doc.user.linkedinUrl || "",
      resumeUrl: doc.user.userResume || "",
      universityCountryName:
         universityCountryMap?.[doc.user.universityCountryCode] || "",
      preRegAnswers: answersByQuestionName,
   }
}

const getUserType = (userType: LivestreamUserType): LivestreamUserAction => {
   switch (userType) {
      case "participants":
         return "participated"
      case "registrations":
         return "registered"
      default:
         return "registered"
   }
}

const getTitle = (
   userType: LivestreamUserType,
   stats: LiveStreamStats
): string => {
   switch (userType) {
      case "participants":
         return `Participants for ${stats.livestream.company}`
      case "registrations":
         return `Registrations for ${stats.livestream.company}`
      default:
         return `Registrations for ${stats.livestream.company}`
   }
}

export default UsersTable
