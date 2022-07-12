import React, { useMemo } from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration/AtsIntegrationContent"
import { useRouter } from "next/router"
import { useFirestoreConnect } from "react-redux-firebase"

const AtsIntegration = () => (
   <GroupDashboardLayout>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <AtsIntegrationContent />
   </GroupDashboardLayout>
)

/**
 * Fetch the ATS information for the group and stores on redux state
 * for the child components to read
 *
 * Needs to have the groupId in the current path
 * @param children
 * @constructor
 */
const GroupATSAccountsReduxFetcher = ({ children }) => {
   const router = useRouter()

   const groupId = router.query.groupId as string

   const query = useMemo(
      () => [
         {
            collection: "careerCenterData",
            doc: groupId,
            subcollections: [
               {
                  collection: "ats",
               },
            ],
            storeAs: "ats",
         },
      ],
      [groupId]
   )

   useFirestoreConnect(query)

   console.log("groupId", groupId)

   return children
}

export default AtsIntegration
