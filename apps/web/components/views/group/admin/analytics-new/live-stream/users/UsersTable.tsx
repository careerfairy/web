import React from "react"
import {
   LivestreamUserType,
   useLivestreamsAnalyticsPageContext,
} from "../LivestreamAnalyticsPageProvider"
import UserLivestreamDataTable, {
   TableSkeleton,
} from "../../../common/table/UserLivestreamDataTable"
import { LivestreamUserAction } from "@careerfairy/shared-lib/livestreams"
import UserLivestreamDataTableProvider from "../../../common/table/UserLivestreamDataTableProvider"

const UsersTable = () => {
   const {
      currentStreamStats,
      fieldsOfStudyLookup,
      levelsOfStudyLookup,
      userType,
   } = useLivestreamsAnalyticsPageContext()

   if (!currentStreamStats || !fieldsOfStudyLookup || !levelsOfStudyLookup) {
      return <TableSkeleton />
   }

   return (
      <UserLivestreamDataTableProvider
         fieldsOfStudyLookup={fieldsOfStudyLookup}
         levelsOfStudyLookup={levelsOfStudyLookup}
         livestreamId={currentStreamStats.livestream.id}
         userType={getUserType(userType)}
      >
         <UserLivestreamDataTable />
      </UserLivestreamDataTableProvider>
   )
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

export default UsersTable
