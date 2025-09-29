import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, Button, Stack, Typography } from "@mui/material"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { useCallback, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import {
   clearHoveredRow,
   setHoveredRow,
} from "../../../../../../store/reducers/offlineEventsTableReducer"
import { StyledPagination } from "../../common/CardCustom"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"
import { OfflineEventMobileCard } from "./OfflineEventMobileCard"
import { getOfflineEventStatsKey } from "./utils"

const ITEMS_PER_PAGE = 5

type Props = {
   stats: OfflineEventsWithStats[]
   isEmptyNoEvents?: boolean
   isEmptySearchFilter?: boolean
   onCreateOfflineEvent?: () => void
}

export const MobileOfflineEventsView = ({
   stats,
   isEmptyNoEvents,
   isEmptySearchFilter,
   onCreateOfflineEvent,
}: Props) => {
   const { resetFilters, setOnPaginationReset } = useOfflineEventsOverview()

   // Reset filters when component unmounts
   useEffect(() => {
      return () => {
         resetFilters()
      }
   }, [resetFilters])

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: ITEMS_PER_PAGE,
      })

   // Use a ref to store the current goToPage function
   const goToPageRef = useRef(goToPage)
   goToPageRef.current = goToPage

   // Register pagination reset callback
   useEffect(() => {
      const resetCallback = () => goToPageRef.current(1)
      setOnPaginationReset(() => resetCallback)
      return () => setOnPaginationReset(undefined)
   }, [setOnPaginationReset])

   return (
      <Box>
         {isEmptySearchFilter ? (
            <Box py={5} textAlign="center">
               <Typography variant="brandedBody" color="neutral.700">
                  No offline events found matching your search
               </Typography>
            </Box>
         ) : isEmptyNoEvents ? (
            <Stack alignItems="center" py={4} spacing={1.5}>
               <Typography
                  variant="brandedBody"
                  color="neutral.800"
                  fontWeight={600}
                  textAlign="center"
               >
                  Plan your first offline event
               </Typography>
               <Typography
                  variant="brandedBody"
                  color="neutral.700"
                  textAlign="center"
                  mb={1.5}
               >
                  This is where all your offline events will appear. Start by
                  creating one
               </Typography>
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={onCreateOfflineEvent}
               >
                  Create offline event
               </Button>
            </Stack>
         ) : (
            <Cards currentPageData={currentPageData} />
         )}

         {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
               <StyledPagination
                  color="secondary"
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => goToPage(page)}
               />
            </Stack>
         )}
      </Box>
   )
}

type CardsProps = {
   currentPageData: OfflineEventsWithStats[]
}

const Cards = ({ currentPageData }: CardsProps) => {
   const {
      handleViewOfflineEvent,
      handleShareOfflineEvent,
      handleAnalytics,
      handleEdit,
      handleViewRegistration,
      handleViewDetails,
      handleDelete,
   } = useOfflineEventsOverview()

   const dispatch = useDispatch()

   const handleCardMouseEnter = useCallback(
      (statKey: string) => {
         dispatch(setHoveredRow(statKey))
      },
      [dispatch]
   )

   const handleCardMouseLeave = useCallback(() => {
      dispatch(clearHoveredRow())
   }, [dispatch])

   return (
      <Stack spacing={2}>
         {currentPageData.map((stat) => {
            const statKey = getOfflineEventStatsKey(stat)
            return (
               <OfflineEventMobileCard
                  key={statKey}
                  stat={stat}
                  statKey={statKey}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                  onViewOfflineEvent={handleViewOfflineEvent}
                  onShareOfflineEvent={handleShareOfflineEvent}
                  onAnalytics={handleAnalytics}
                  onEdit={handleEdit}
                  onViewRegistration={handleViewRegistration}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
               />
            )
         })}
      </Stack>
   )
}
