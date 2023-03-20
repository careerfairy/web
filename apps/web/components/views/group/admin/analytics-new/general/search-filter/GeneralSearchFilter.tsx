import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import {
   Card,
   CircularProgress,
   Divider,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useTimeFramedLivestreamStats from "./useTimeFramedLivestreamStats"
import Stack from "@mui/material/Stack"
import {
   StyledCheckbox,
   StyledMenuItem,
   StyledTextField,
} from "../../../common/inputs"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import {
   getMaxLineStyles,
   prettyDate,
} from "../../../../../../helperFunctions/HelperFunctions"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import VirtualizedAutocomplete from "../../../../../common/VirtualizedAutocomplete"
import Box from "@mui/material/Box"
import {
   AutocompleteRenderInputParams,
   AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete/Autocomplete"

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
   },
   wrapper: {
      flex: 1,
      p: 2,
   },
   livestreamStatSelect: (theme) => ({
      borderRadius: 1,
      flex: 1,
      minWidth: "auto !important",
      "& .MuiInputBase-input": {
         overflow: "hidden",
         textOverflow: "ellipsis",
      },
      [theme.breakpoints.down("sm")]: {
         minWidth: "auto !important",
      },
   }),
   listBox: {
      "& li": {
         backgroundColor: "transparent !important",
         "&:hover": {
            backgroundColor: (theme) =>
               theme.palette.action.hover + " !important",
         },
      },
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
   listItem: {
      flex: 1,
      display: "flex",
   },
})

const GeneralSearchFilter = () => {
   const isMobile = useIsMobile()

   const [localSelectedStats, setLocalSelectedStats] = useState<
      LiveStreamStats[]
   >([]) // [] means all livestreams are selected

   const { setLivestreamStats, livestreamStats: livestreamStatsContext } =
      useAnalyticsPageContext()

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<TimeFrame>("Last 2 years")

   const { data: livestreamStats } = useTimeFramedLivestreamStats(
      livestreamStatsTimeFrame
   )

   const noLivestreamStats = livestreamStats?.length === 0

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

   const allLivestreamsSelected =
      livestreamStatsContext?.length === livestreamStats?.length

   const placeHolder = useMemo(() => {
      if (isLoading) return "Loading..."

      if (noLivestreamStats) {
         return "No live streams"
      }
      if (allLivestreamsSelected) {
         return "All live streams"
      }

      return ""
   }, [allLivestreamsSelected, isLoading, noLivestreamStats])

   const handleChange = useCallback(
      (event: React.SyntheticEvent, value: LiveStreamStats[]) => {
         if (value.length === livestreamStats?.length) {
            setLocalSelectedStats([])
            return
         }
         setLocalSelectedStats(value)
      },
      [livestreamStats?.length]
   )

   const renderInput = useCallback(
      (params: AutocompleteRenderInputParams) => {
         return (
            <StyledTextField
               {...params}
               sx={styles.livestreamStatSelect}
               placeholder={placeHolder}
               variant="outlined"
            />
         )
      },
      [placeHolder]
   )

   const renderTags = useCallback(
      (value: LiveStreamStats[]) => {
         if (isLoading) return <CircularProgress color={"inherit"} size={15} />

         let message
         if (!value?.length) {
            message = noLivestreamStats ? "No live streams" : "All live streams"
         } else {
            const streamTitle = value[0]?.livestream?.title
            const streamCount = value?.length - 1
            message = `${streamTitle} ${streamCount ? `+ ${streamCount}` : ""}` // Eg. "Stream 1 + 2" or "Stream 1"
         }

         return <Typography whiteSpace="pre-line">{message}</Typography>
      },
      [isLoading, noLivestreamStats]
   )

   return (
      <Card sx={styles.root}>
         <Stack
            direction={isMobile ? "column" : "row"}
            sx={styles.wrapper}
            spacing={2}
            divider={
               <Divider
                  flexItem
                  orientation={isMobile ? "horizontal" : "vertical"}
               />
            }
         >
            <VirtualizedAutocomplete
               multiple
               id="select-livestream"
               options={livestreamStats ?? []}
               disableCloseOnSelect
               loading={isLoading}
               limitTags={2}
               disabled={noLivestreamStats || isLoading}
               fullWidth
               clearText={"All live streams"}
               listBoxCustomProps={listBoxCustomProps}
               noOptionsText={
                  noLivestreamStats ? "No live streams" : "No results"
               }
               freeSolo={false}
               onChange={handleChange}
               value={localSelectedStats}
               getOptionLabel={getLabelFn}
               isOptionEqualToValue={isOptionEqualToValue}
               renderOption={renderOption}
               renderInput={renderInput}
               renderTags={renderTags}
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

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   stat: LiveStreamStats,
   { selected }: AutocompleteRenderOptionState
) => [
   props,
   <Box sx={styles.listItem} key={stat.livestream.id}>
      <ListItemText
         aria-label={stat.livestream.title}
         primary={stat.livestream.title}
         primaryTypographyProps={{
            whiteSpace: "pre-line",
            sx: {
               ...getMaxLineStyles(3),
            },
         }}
         secondary={prettyDate(stat.livestream.start)}
      />
      <Box display={"flex"} alignItems={"center"}>
         <StyledCheckbox checked={selected} />
      </Box>
   </Box>,
]

const isOptionEqualToValue = (
   option: LiveStreamStats,
   value: LiveStreamStats
) => option.livestream.id === value.livestream.id

const getLabelFn = (item: LiveStreamStats) => item.livestream.title

const timeFrameSelectProps = {
   renderValue: (val) => val,
}

const listBoxCustomProps = {
   listBoxSx: styles.listBox,
   listBoxItemHeight: 80,
}

export const TimeFrames = {
   "All time": {
      start: new Date(0),
      end: null,
   },
   "Last 2 years": {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: null,
   },
   "Last 1 year": {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: null,
   },
   "Last 6 months": {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: null,
   },
   "Last month": {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: null, // null means we don't care about the end date
   },
} as const

export type TimeFrame = keyof typeof TimeFrames

export default GeneralSearchFilter
