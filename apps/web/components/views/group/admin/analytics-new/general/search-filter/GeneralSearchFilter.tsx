import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import {
   Card,
   Checkbox,
   CircularProgress,
   Divider,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useTimeFramedLivestreamStats from "./useTimeFramedLivestreamStats"
import Stack from "@mui/material/Stack"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { StyledMenuItem, StyledTextField } from "../../../common/inputs"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import {
   prettyDate,
   truncate,
} from "../../../../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
   },
   wrapper: {
      flex: 1,
      p: 1,
   },
   livestreamStatSelect: {
      flex: 1,
   },
   timeFrameSelect: {
      minWidth: 350,
   },
})
const GeneralSearchFilter = () => {
   const { setLivestreamStats } = useAnalyticsPageContext()
   const isMobile = useIsMobile()
   const [selectedStatIds, setSelectedStatIds] = useState<string[]>([])

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<TimeFrame>("Last 2 years")

   const { data: livestreamStats } = useTimeFramedLivestreamStats(
      livestreamStatsTimeFrame
   )

   const noLivestreamStats = livestreamStats?.length === 0

   const isLoading = livestreamStats === undefined

   useEffect(() => {
      if (selectedStatIds.length === 0) {
         setLivestreamStats(livestreamStats)
      } else {
         setLivestreamStats(
            livestreamStats?.filter((stat) =>
               selectedStatIds.includes(stat.livestream.id)
            ) ?? []
         )
      }
   }, [livestreamStats, selectedStatIds, setLivestreamStats])

   const handleTimeframeChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
         setLivestreamStatsTimeFrame(event.target.value as TimeFrame)
         setSelectedStatIds([])
      },
      [setLivestreamStatsTimeFrame]
   )

   const handleLivestreamStatChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
         const value = event.target.value

         if (Array.isArray(value)) {
            setSelectedStatIds(value)
         } else {
            setSelectedStatIds([])
         }
      },
      [setSelectedStatIds]
   )

   const selectedStats = useMemo(
      () =>
         livestreamStats?.filter((stat) =>
            selectedStatIds.includes(stat.livestream.id)
         ) ?? [],
      [livestreamStats, selectedStatIds]
   )

   const value = useMemo(
      () =>
         selectedStatIds.length === 0 ? ["All live streams"] : selectedStatIds,
      [selectedStatIds]
   )

   const livestreamStatSelectProps = useMemo(
      () => ({
         multiple: true,
         renderValue: () => {
            if (isLoading)
               return <CircularProgress color={"inherit"} size={15} />
            if (!selectedStats.length) {
               return noLivestreamStats ? "No live streams" : "All live streams"
            } else {
               const streamTitle = selectedStats[0]?.livestream?.title
               const streamCount = selectedStats.length - 1
               return `${streamTitle} ${streamCount ? `+ ${streamCount}` : ""}` // Eg. "Stream 1 + 2" or "Stream 1"
            }
         },
      }),
      [isLoading, selectedStats, noLivestreamStats]
   )

   return (
      <Card sx={styles.root}>
         <Stack
            direction={isMobile ? "column" : "row"}
            sx={styles.wrapper}
            spacing={2}
            component={Stack}
            divider={
               <Divider
                  flexItem
                  orientation={isMobile ? "horizontal" : "vertical"}
               />
            }
         >
            <StyledTextField
               sx={styles.livestreamStatSelect}
               id="select-livestream"
               select
               disabled={noLivestreamStats || isLoading}
               fullWidth
               SelectProps={livestreamStatSelectProps}
               value={value}
               variant="outlined"
               onChange={handleLivestreamStatChange}
            >
               {livestreamStats?.map((stat) => (
                  <StyledMenuItem
                     value={stat.livestream.id}
                     key={stat.livestream.id}
                  >
                     <ListItemText
                        aria-label={stat.livestream.title}
                        primary={truncate(stat.livestream.title, 80)}
                        secondary={prettyDate(stat.livestream.start)}
                     />
                     <Checkbox
                        checked={selectedStatIds.includes(stat.livestream.id)}
                        color={"default"}
                     />
                  </StyledMenuItem>
               )) ?? []}
            </StyledTextField>
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
                        <ListItemIcon>
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

export const TimeFrames = {
   "Last 30 days": {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: null, // null means we don't care about the end date
   },
   "Last 6 months": {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: null,
   },
   "Last 1 year": {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: null,
   },
   "Last 2 years": {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: null,
   },
   "All time": {
      start: new Date(0),
      end: null,
   },
} as const

export type TimeFrame = keyof typeof TimeFrames

export default GeneralSearchFilter
