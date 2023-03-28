import React, { useCallback, useEffect, useState } from "react"
import {
   TimeFrame,
   TimeFrames,
   useAnalyticsPageContext,
} from "../GeneralPageProvider"
import { Card, Divider, ListItemIcon, ListItemText } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useTimeFramedLivestreamStats from "./useTimeFramedLivestreamStats"
import Stack from "@mui/material/Stack"
import { StyledMenuItem, StyledTextField } from "../../../common/inputs"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import LivestreamAutoComplete from "./LivestreamAutoComplete"

const spacing = 1

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
   },
   wrapper: {
      flex: 1,
      p: spacing,
   },
   timeFrameSelect: {
      minWidth: {
         sm: 350,
      },
      justifyContent: "center",
   },
   listIcon: {
      display: "flex",
      justifyContent: "flex-end",
   },
})

const GeneralSearchFilter = () => {
   const isMobile = useIsMobile()

   const [localSelectedStats, setLocalSelectedStats] = useState<
      LiveStreamStats[]
   >([]) // [] means all livestreams are selected

   const {
      setLivestreamStats,
      setLivestreamStatsTimeFrame,
      livestreamStatsTimeFrame,
   } = useAnalyticsPageContext()

   const { data: livestreamStats } = useTimeFramedLivestreamStats(
      livestreamStatsTimeFrame
   )

   const isLoading = livestreamStats === undefined

   const handleTimeframeChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
         setLivestreamStatsTimeFrame(event.target.value as TimeFrame)
         setLocalSelectedStats([]) // Reset selected livestreams to all livestreams
      },
      [setLivestreamStatsTimeFrame]
   )

   useEffect(() => {
      if (localSelectedStats.length === 0) {
         // If all livestreams are selected, set livestreamStats to all livestreams
         setLivestreamStats(livestreamStats ?? [])
      } else {
         // If not all livestreams are selected, set livestreamStats to the selected livestreams
         setLivestreamStats(localSelectedStats)
      }
   }, [livestreamStats, localSelectedStats, setLivestreamStats])

   useEffect(() => {
      if (localSelectedStats.length > 0) {
         // Sync live updates with local selected stats by replacing the livestream stats with the same livestream id
         setLocalSelectedStats((prev) => {
            return prev.map((prevStat) => {
               const newStat = livestreamStats?.find(
                  (newStat) => newStat.livestream.id === prevStat.livestream.id
               )
               return newStat ?? prevStat
            })
         })
      }
   }, [livestreamStats, localSelectedStats.length])

   const handleChange = useCallback(
      (event: React.SyntheticEvent, value: LiveStreamStats[]) => {
         setLocalSelectedStats(value)
      },
      []
   )

   return (
      <Card sx={styles.root}>
         <Stack
            direction={isMobile ? "column" : "row"}
            sx={styles.wrapper}
            spacing={spacing}
            divider={
               <Divider
                  flexItem
                  orientation={isMobile ? "horizontal" : "vertical"}
               />
            }
         >
            <LivestreamAutoComplete
               livestreamStats={livestreamStats}
               localSelectedStats={localSelectedStats}
               loading={isLoading}
               handleChange={handleChange}
            />
            <StyledTextField
               sx={styles.timeFrameSelect}
               id="select-timeframe"
               select
               SelectProps={timeFrameSelectProps}
               disabled={isLoading}
               value={livestreamStatsTimeFrame}
               variant="outlined"
               onChange={handleTimeframeChange}
            >
               {Object.keys(TimeFrames).map((timeframe) => (
                  <StyledMenuItem key={timeframe} value={timeframe}>
                     <ListItemText primary={timeframe} />
                     {timeframe === livestreamStatsTimeFrame ? (
                        <ListItemIcon sx={styles.listIcon}>
                           <CheckRoundedIcon fontSize="small" />
                        </ListItemIcon>
                     ) : null}
                  </StyledMenuItem>
               ))}
            </StyledTextField>
         </Stack>
      </Card>
   )
}

const timeFrameSelectProps = {
   renderValue: (val) => val,
}

export default GeneralSearchFilter
