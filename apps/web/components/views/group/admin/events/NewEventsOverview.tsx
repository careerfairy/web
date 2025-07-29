import { Stack } from "@mui/material"
import { useRouter } from "next/router"
import { Fragment, useState } from "react"
import { useGroupLivestreamsWithStats } from "../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { BrandedSearchField } from "../../../common/inputs/BrandedSearchField"
import { AdminContainer } from "../common/Container"
import { EventsViewProvider, useEventsView } from "./context/EventsViewContext"
import { DesktopEventsView } from "./DesktopEventsView"
import { MobileEventsView } from "./MobileEventsView"

const NewEventsOverviewContent = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const [searchTerm, setSearchTerm] = useState("")
   const isMobile = useIsMobile()
   const { sortBy, statusFilter } = useEventsView()

   const {
      data: stats,
      isLoading,
      error,
   } = useGroupLivestreamsWithStats(groupId, {
      sortBy,
      searchTerm,
      statusFilter,
   })

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

         {stats.length > 0 ? (
            <Fragment>
               {isMobile ? (
                  <MobileEventsView stats={stats} />
               ) : (
                  <DesktopEventsView stats={stats} />
               )}
            </Fragment>
         ) : (
            <p>No events found matching your search criteria.</p>
         )}
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
