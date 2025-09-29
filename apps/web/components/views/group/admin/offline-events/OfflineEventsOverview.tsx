import { Stack } from "@mui/material"
import { useGroupOfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedSearchField } from "components/views/common/inputs/BrandedSearchField"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { AdminContainer } from "../common/Container"
import {
   OfflineEventsViewProvider,
   useOfflineEventsOverview,
} from "./context/OfflineEventsOverviewContext"
import { DesktopOfflineEventsView } from "./offline-events-table/DesktopOfflineEventsView"
import { MobileOfflineEventsView } from "./offline-events-table/MobileOfflineEventsView"
import { useOfflineEventRouting } from "./useOfflineEventRouting"

const OfflineEventsOverviewContent = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const isMobile = useIsMobile()
   const { sortBy, statusFilter, searchTerm, setSearchTerm } =
      useOfflineEventsOverview()
   console.log(
      "🚀 ~ OfflineEventsOverviewContent ~ statusFilter:",
      statusFilter
   )
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
   console.log("🚀 ~ OfflineEventsOverviewContent ~ stats:", stats)

   const hasFilters = Boolean(statusFilter.length > 0 || searchTerm.trim())
   const noResults = stats.length === 0

   return (
      <Stack spacing={1} pt={isMobile ? 2 : 3.5} pb={3}>
         <BrandedSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by title or company"
            fullWidth
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

export const OfflineEventsOverview = () => {
   return (
      <AdminContainer>
         <OfflineEventsViewProvider>
            <OfflineEventsOverviewContent />
         </OfflineEventsViewProvider>
      </AdminContainer>
   )
}
