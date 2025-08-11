import { Stack } from "@mui/material"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { useGroupLivestreamsWithStats } from "../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { BrandedSearchField } from "../../../common/inputs/BrandedSearchBar"
import { AdminContainer } from "../common/Container"
import { EventsViewProvider, useEventsView } from "./context/EventsViewContext"
import { DesktopEventsView } from "./DesktopEventsView"
import { MobileEventsView } from "./MobileEventsView"
import { useLivestreamRouting } from "./useLivestreamRouting"

const NewEventsOverviewContent = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const isMobile = useIsMobile()
   const { sortBy, statusFilter, searchTerm, setSearchTerm } = useEventsView()
   const { createDraftLivestream } = useLivestreamRouting()

   const {
      data: stats,
      isLoading,
      error,
   } = useGroupLivestreamsWithStats(groupId, {
      sortBy,
      searchTerm,
      statusFilter,
   })

   const hasFilters = Boolean(statusFilter.length > 0 || searchTerm.trim())
   const noResults = stats.length === 0

   return (
      <Stack spacing={1} pt={isMobile ? 2 : 3.5} pb={3}>
         <BrandedSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by title or company"
            fullWidth
            settings={{
               submitOnEnter: false,
               submitOnBlur: false,
            }}
         />

         {Boolean(isLoading) && <p>Loading stats...</p>}
         {Boolean(error) && <p>Error loading stats: {error.message}</p>}
         <Fragment>
            {isMobile ? (
               <MobileEventsView
                  stats={stats}
                  isEmptyNoEvents={!hasFilters && noResults}
                  isEmptySearchFilter={Boolean(hasFilters && noResults)}
                  onCreateLivestream={createDraftLivestream}
               />
            ) : (
               <DesktopEventsView
                  stats={stats}
                  isEmptyNoEvents={!hasFilters && noResults}
                  isEmptySearchFilter={Boolean(hasFilters && noResults)}
                  onCreateLivestream={createDraftLivestream}
               />
            )}
         </Fragment>
      </Stack>
   )
}

export const NewEventsOverview = () => {
   return (
      <AdminContainer>
         <EventsViewProvider>
            <NewEventsOverviewContent />
         </EventsViewProvider>
      </AdminContainer>
   )
}
