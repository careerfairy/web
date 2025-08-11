import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Button, Stack, Typography } from "@mui/material"
import { Fragment, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import useClientSideInfiniteScroll from "../../../../custom-hook/utils/useClientSideInfiniteScroll"
import { useEventsView } from "./context/EventsViewContext"
import { MobileEventActionsMenu } from "./MobileEventActionsMenu"
import { MobileEventCard } from "./MobileEventCard"
import { getEventStatsKey } from "./util"

type Props = {
   stats: LiveStreamStats[]
   isEmptyNoEvents?: boolean
   isEmptySearchFilter?: boolean
   onCreateLivestream?: () => void
}

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
   emptyTitle: {
      color: "neutral.800",
   },
   emptyDescription: {
      color: "neutral.700",
   },
   emptyActions: {
      mt: 1,
   },
})

export const MobileEventsView = ({
   stats,
   isEmptyNoEvents,
   isEmptySearchFilter,
   onCreateLivestream,
}: Props) => {
   const { resetFilters } = useEventsView()
   const { visibleData, hasMore, ref } = useClientSideInfiniteScroll({
      data: stats,
      itemsPerPage: 10,
   })

   const [selectedStat, setSelectedStat] = useState<LiveStreamStats | null>(
      null
   )
   const isMenuOpen = Boolean(selectedStat)

   // Reset filters when component unmounts
   useEffect(() => {
      return () => {
         resetFilters()
      }
   }, [resetFilters])

   const handleCardClick = (stat: LiveStreamStats) => {
      setSelectedStat(stat)
   }

   const handleMenuClose = () => {
      setSelectedStat(null)
   }

   // Empty state: search/filter yields no results
   if (isEmptySearchFilter) {
      return (
         <Box py={5} sx={styles.emptyCard}>
            <Typography variant="brandedBody" sx={styles.emptyDescription}>
               No live streams found matching your search
            </Typography>
         </Box>
      )
   }

   // Empty state: no events created yet
   if (isEmptyNoEvents) {
      return (
         <Stack
            sx={styles.emptyCard}
            spacing={1.5}
            py={4}
            color="neutral.700"
            alignItems="center"
         >
            <Typography variant="brandedBody" fontWeight={600}>
               Plan your first livestream
            </Typography>
            <Typography variant="brandedBody" textAlign="center">
               This is where all your livestreams will appear. Start by creating
               one
            </Typography>
            <Box sx={styles.emptyActions}>
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={onCreateLivestream}
               >
                  Create livestream
               </Button>
            </Box>
         </Stack>
      )
   }

   return (
      <Fragment>
         <Stack spacing={0.5}>
            {visibleData.map((stat) => (
               <MobileEventCard
                  key={getEventStatsKey(stat)}
                  stat={stat}
                  onCardClick={() => handleCardClick(stat)}
               />
            ))}

            {Boolean(hasMore) && <Box sx={styles.loadMoreTrigger} ref={ref} />}
         </Stack>

         <MobileEventActionsMenu
            stat={selectedStat}
            open={isMenuOpen}
            onClose={handleMenuClose}
         />
      </Fragment>
   )
}
