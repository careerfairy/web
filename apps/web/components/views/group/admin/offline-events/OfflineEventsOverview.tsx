import { StripeProductType } from "@careerfairy/shared-lib/stripe/types"
import { Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useGroupOfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import CheckoutConfirmationDialog from "components/views/checkout/views/CheckoutConfirmationDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { AdminContainer } from "../common/Container"
import { OutOfEventsDialog } from "./OutOfEventsDialog"
import { OverviewHeader } from "./OverviewHeader"
import {
   OfflineEventsViewProvider,
   useOfflineEventsOverview,
} from "./context/OfflineEventsOverviewContext"
import { CheckoutDialog } from "./detail/CheckoutDialog"
import { DesktopOfflineEventsView } from "./offline-events-table/DesktopOfflineEventsView"
import { MobileOfflineEventsView } from "./offline-events-table/MobileOfflineEventsView"
import { OfflineEventsPromotionView } from "./promotion/OfflineEventsPromotionView"
import { useOfflineEventRouting } from "./useOfflineEventRouting"

const OfflineEventsOverviewContent = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const isMobile = useIsMobile(700)

   const {
      sortBy,
      statusFilter,
      searchTerm,
      checkoutDialogOpen,
      handleCheckoutDialogClose,
      handleCheckoutDialogOpen,
      outOfEventsDialogOpen,
      handleOutOfEventsDialogClose,
      stripeSessionId,
   } = useOfflineEventsOverview()

   const { group, groupPresenter } = useGroup()
   const showPromotionView = !groupPresenter?.canCreateOfflineEvents(true)
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

   return (
      <>
         <ConditionalWrapper condition={Boolean(stripeSessionId)}>
            <CheckoutConfirmationDialog
               successTitle="Your offline event credits have been purchased!"
               successDescription="You can now create and publish offline events to reach more students and expand your university's presence."
               successButtonText="Start creating events"
            />
         </ConditionalWrapper>
         <OutOfEventsDialog
            open={outOfEventsDialogOpen}
            onClose={handleOutOfEventsDialogClose}
            onPromoteEvents={handleCheckoutDialogOpen}
         />
         <CheckoutDialog
            checkoutData={{
               type: StripeProductType.OFFLINE_EVENT,
               customerName: `${userData.firstName} ${userData.lastName}`,
               customerEmail: userData.userEmail,
               groupId: group.groupId,
               priceId: process.env.NEXT_PUBLIC_OFFLINE_EVENT_STRIPE_PRICE_ID,
               successUrl: `/group/${group.id}/admin/content/offline-events?stripe_session_id={CHECKOUT_SESSION_ID}`,
            }}
            open={checkoutDialogOpen}
            onClose={handleCheckoutDialogClose}
            title="Plan your next offline events"
            subtitle="Select how many offline events you want to publish and reach more students."
         />
         {showPromotionView ? (
            <OfflineEventsPromotionView />
         ) : (
            <Stack spacing={1} pt={isMobile ? 2 : 3.5} pb={3}>
               <OverviewHeader />
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
         )}
      </>
   )
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
