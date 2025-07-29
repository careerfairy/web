import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Stack } from "@mui/material"
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import useClientSideInfiniteScroll from "../../../../custom-hook/utils/useClientSideInfiniteScroll"
import { MobileEventActionsMenu } from "./MobileEventActionsMenu"
import { MobileEventCard } from "./MobileEventCard"
import { getEventStatsKey } from "./util"

type Props = {
   stats: LiveStreamStats[]
}

const styles = sxStyles({
   loadMoreTrigger: {
      height: 300,
   },
})

export const MobileEventsView = ({ stats }: Props) => {
   const { visibleData, hasMore, ref } = useClientSideInfiniteScroll({
      data: stats,
      itemsPerPage: 10,
   })

   const [selectedStat, setSelectedStat] = useState<LiveStreamStats | null>(
      null
   )
   const isMenuOpen = Boolean(selectedStat)

   const handleCardClick = (stat: LiveStreamStats) => {
      setSelectedStat(stat)
   }

   const handleMenuClose = () => {
      setSelectedStat(null)
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
