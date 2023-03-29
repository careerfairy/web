import React, { useMemo } from "react"
import {
   LivestreamUserType,
   useLivestreamsAnalyticsPageContext,
} from "../LivestreamAnalyticsPageProvider"
import UserLivestreamDataTable, {
   TableSkeleton,
   UserDataEntry,
} from "../../../common/table/UserLivestreamDataTable"
import {
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import UserDataTableProvider, {
   DocumentPaths,
} from "../../../common/table/UserDataTableProvider"
import { collection } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"

const UsersTable = () => {
   const { currentStreamStats, fieldsOfStudyLookup, levelsOfStudyLookup } =
      useLivestreamsAnalyticsPageContext()

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
         userResume: "user.resumeUrl",
         userLinkedIn: "user.linkedInUrl",
      }),
      [userType]
   )

   return (
      <UserDataTableProvider
         fieldsOfStudyLookup={fieldsOfStudyLookup}
         levelsOfStudyLookup={levelsOfStudyLookup}
         documentPaths={documentPaths}
         targetCollectionQuery={collectionQuery}
         converterFn={converterFn}
      >
         <UserLivestreamDataTable />
      </UserDataTableProvider>
   )
}

const converterFn = (doc: UserLivestreamData): UserDataEntry => ({
   email: doc.user.userEmail,
   firstName: doc.user.firstName || "",
   lastName: doc.user.lastName || "",
   universityName: doc.user.university?.name || "",
   universityCountryCode: doc.user.universityCountryCode || "",
   fieldOfStudy: doc.user.fieldOfStudy?.name || "",
   levelOfStudy: doc.user.levelOfStudy?.name || "",
   linkedInUrl: doc.user.linkedinUrl || "",
   resumeUrl: doc.user.userResume || "",
})

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

export default UsersTable
