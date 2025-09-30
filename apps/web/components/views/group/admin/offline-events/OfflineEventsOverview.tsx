import { Box, Stack, Typography } from "@mui/material"
import { useGroupOfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedSearchField } from "components/views/common/inputs/BrandedSearchField"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { Calendar } from "react-feather"
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
   const { group } = useGroup()
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
      <Stack spacing={1} pt={isMobile ? 2 : 3.5} pb={3}>
         <Stack
            direction={isMobile ? "row" : "row"}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
         >
            <BrandedSearchField
               value={searchTerm}
               onChange={setSearchTerm}
               placeholder="Search"
               fullWidth
            />
            <Box
               sx={{
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
                  p: 1.5,
                  background: (theme) => theme.brand.white[100],
                  height: "48px",
                  alignItems: "center",
                  display: "flex",
               }}
            >
               <Stack direction="row" alignItems="center" spacing={1}>
                  <Box component={Calendar} size={16} color={"neutral.700"} />
                  <Typography
                     variant="small"
                     color={"neutral.700"}
                     sx={{
                        whiteSpace: "nowrap",
                     }}
                  >
                     {group?.availableOfflineEvents ?? 0}{" "}
                     {group?.availableOfflineEvents === 1 ? "event" : "events"}{" "}
                     available
                  </Typography>
               </Stack>
            </Box>
         </Stack>

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
