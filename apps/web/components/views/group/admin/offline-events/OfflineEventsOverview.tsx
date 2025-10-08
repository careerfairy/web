import { Group } from "@careerfairy/shared-lib/groups/groups"
import {
   OfflineEventFetchStripeCustomerSession,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useGroupOfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { AdminContainer } from "../common/Container"
import { OverviewHeader } from "./OverviewHeader"
import {
   OfflineEventsViewProvider,
   useOfflineEventsOverview,
} from "./context/OfflineEventsOverviewContext"
import { CheckoutDialog } from "./detail/CheckoutDialog"
import { DesktopOfflineEventsView } from "./offline-events-table/DesktopOfflineEventsView"
import { MobileOfflineEventsView } from "./offline-events-table/MobileOfflineEventsView"
import { useOfflineEventRouting } from "./useOfflineEventRouting"

const OfflineEventsOverviewContent = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const isMobile = useIsMobile(700)
   const { query } = useRouter()

   // TODO: Use for confirmation dialog
   const stripeSessionId = query.stripe_session_id as string
   console.log(
      "🚀 ~ OfflineEventsOverviewContent ~ stripeSessionId:",
      stripeSessionId
   )
   const {
      sortBy,
      statusFilter,
      searchTerm,
      checkoutDialogOpen,
      handleCheckoutDialogClose,
      handleCheckoutDialogOpen,
   } = useOfflineEventsOverview()

   const { group } = useGroup()
   const { userData } = useAuth()
   const { createDraftOfflineEvent } = useOfflineEventRouting()

   const {
      data: stats,
      isLoading,
      error,
   } = useGroupOfflineEventsWithStats(groupId, {
      sortBy,
      searchTerm,
      statusFilter,
   })

   const hasFilters = Boolean(statusFilter.length > 0 || searchTerm.trim())
   const noResults = stats.length === 0

   const checkoutData = getCheckoutData(group, userData?.userEmail)

   return (
      <Stack spacing={1} pt={isMobile ? 2 : 3.5} pb={3}>
         <OverviewHeader />
         <CheckoutDialog
            checkoutData={checkoutData}
            open={checkoutDialogOpen}
            onClose={handleCheckoutDialogClose}
            onOpen={handleCheckoutDialogOpen}
            title="Plan your next offline events"
            subtitle="Select how many offline events you want to publish and reach more students."
         />
         {Boolean(isLoading) && <p>Loading stats...</p>}
         {Boolean(error) && <p>Error loading stats: {error.message}</p>}
         <Fragment>
            {isMobile ? (
               <MobileOfflineEventsView
                  stats={stats}
                  isEmptyNoEvents={!hasFilters && noResults}
                  isEmptySearchFilter={Boolean(hasFilters && noResults)}
                  onCreateOfflineEvent={createDraftOfflineEvent}
               />
            ) : (
               <DesktopOfflineEventsView
                  stats={stats}
                  isEmptyNoEvents={!hasFilters && noResults}
                  isEmptySearchFilter={Boolean(hasFilters && noResults)}
                  onCreateOfflineEvent={createDraftOfflineEvent}
               />
            )}
         </Fragment>
      </Stack>
   )
}

const getCheckoutData = (
   group: Group,
   userEmail: string
): OfflineEventFetchStripeCustomerSession => {
   return {
      type: StripeProductType.OFFLINE_EVENT,
      customerName: group.universityName,
      customerEmail: userEmail,
      groupId: group.groupId,
      priceId: process.env.NEXT_PUBLIC_OFFLINE_EVENT_PRICE_ID,
      successUrl: "/offline-event-success", // TODO: Update to the correct URL
   }
}

export const OfflineEventsOverview = () => {
   return (
      <AdminContainer>
         <OfflineEventsViewProvider>
            <OfflineEventsOverviewContent />
         </OfflineEventsViewProvider>
      </AdminContainer>
   )
}
