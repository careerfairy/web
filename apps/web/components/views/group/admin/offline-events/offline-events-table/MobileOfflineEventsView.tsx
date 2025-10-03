import { Box, Button, Stack, Typography } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useClientSideInfiniteScroll from "components/custom-hook/utils/useClientSideInfiniteScroll"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"
import { OfflineEventMobileActionsMenu } from "./OfflineEventMobileActionsMenu"
import { OfflineEventMobileCard } from "./OfflineEventMobileCard"
import { getOfflineEventStatsKey } from "./utils"

const ITEMS_PER_PAGE = 10

const styles = sxStyles({
   loadMoreTrigger: {
      height: 300,
   },
   emptyCard: {
      px: 1,
      backgroundColor: (theme) => theme.brand.white[200],
      borderRadius: "8px",
      textAlign: "center",
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
   },
})

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
   const { resetFilters } = useOfflineEventsOverview()
   const { visibleData, hasMore, ref } = useClientSideInfiniteScroll({
      data: stats,
      itemsPerPage: ITEMS_PER_PAGE,
   })
   const { groupPresenter } = useGroup()
   const canCreateOfflineEvent = groupPresenter?.canCreateOfflineEvents()

   const [selectedStat, setSelectedStat] =
      useState<OfflineEventsWithStats | null>(null)
   const isMenuOpen = Boolean(selectedStat)

   // Reset filters when component unmounts
   useEffect(() => {
      return () => {
         resetFilters()
      }
   }, [resetFilters])

   const handleCardClick = (stat: OfflineEventsWithStats) => {
      setSelectedStat(stat)
   }

   const handleMenuClose = () => {
      setSelectedStat(null)
   }

   return (
      <Fragment>
         {isEmptySearchFilter ? (
            <Box py={5} sx={styles.emptyCard} textAlign="center">
               <Typography variant="brandedBody" color="neutral.700">
                  No offline events found matching your search
               </Typography>
            </Box>
         ) : isEmptyNoEvents ? (
            <Stack
               sx={styles.emptyCard}
               py={4}
               color="neutral.700"
               alignItems="center"
            >
               <Typography variant="brandedBody" mb={1} fontWeight={600}>
                  Plan your first offline event
               </Typography>
               <Typography variant="brandedBody" textAlign="center" mb={1.5}>
                  This is where all your offline events will appear. Start by
                  creating one or contact our sales department to upgrade your
                  plan.
               </Typography>
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={onCreateOfflineEvent}
                  disabled={!canCreateOfflineEvent}
               >
                  Create offline event
               </Button>
            </Stack>
         ) : (
            <Stack spacing={0.5}>
               {visibleData.map((stat) => (
                  <OfflineEventMobileCard
                     key={getOfflineEventStatsKey(stat)}
                     stat={stat}
                     onCardClick={() => handleCardClick(stat)}
                  />
               ))}

               {Boolean(hasMore) && (
                  <Box sx={styles.loadMoreTrigger} ref={ref} />
               )}
            </Stack>
         )}

         <OfflineEventMobileActionsMenu
            stat={selectedStat}
            open={isMenuOpen}
            onClose={handleMenuClose}
         />
      </Fragment>
   )
}
