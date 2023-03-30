import React, { useMemo } from "react"
import UserLivestreamDataTable, {
   TableSkeleton,
   UserDataEntry,
} from "../../../common/table/UserLivestreamDataTable"
import UserDataTableProvider, {
   DocumentPaths,
} from "../../../common/table/UserDataTableProvider"
import { collectionGroup, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { TalentProfile } from "@careerfairy/shared-lib/users"
import { useTalentPoolPageContext } from "../TalentPoolPageProvider"
import { Grid } from "@mui/material"
import CustomToolbar from "./CustomToolbar"

const TalentTable = () => {
   const { fieldsOfStudyLookup, levelsOfStudyLookup } =
      useTalentPoolPageContext()

   if (!fieldsOfStudyLookup || !levelsOfStudyLookup) {
      return <TableSkeleton />
   }

   return <DataTable />
}

const DataTable = () => {
   const { group } = useGroup()
   const { fieldsOfStudyLookup, levelsOfStudyLookup } =
      useTalentPoolPageContext()

   const talentPoolQuery = query(
      collectionGroup(FirestoreInstance, "talentProfiles"),
      where("groupId", "==", group.id)
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
         orderBy: `joinedAt`,
         orderDirection: "desc",
         userEmail: "user.userEmail",
         userResume: "user.userResume",
         userLinkedIn: "user.linkedInUrl",
      }),
      []
   )

   return (
      <UserDataTableProvider
         fieldsOfStudyLookup={fieldsOfStudyLookup}
         levelsOfStudyLookup={levelsOfStudyLookup}
         documentPaths={documentPaths}
         targetCollectionQuery={talentPoolQuery}
         converterFn={converterFn}
         title={`Talent Pool of ${group.universityName}`}
      >
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <CustomToolbar />
            </Grid>
            <Grid item xs={12}>
               <UserLivestreamDataTable hideToolbar />
            </Grid>
         </Grid>
      </UserDataTableProvider>
   )
}

const converterFn = (doc: TalentProfile): UserDataEntry => ({
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
})

export default TalentTable
