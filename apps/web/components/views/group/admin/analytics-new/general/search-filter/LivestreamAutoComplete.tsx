import React, { FC, useCallback, useMemo, useState } from "react"
import VirtualizedAutocomplete from "../../../../../common/VirtualizedAutocomplete"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   AutocompleteRenderInputParams,
   AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete/Autocomplete"
import Box from "@mui/material/Box"
import { CircularProgress, ListItemText, Typography } from "@mui/material"
import {
   getMaxLineStyles,
   prettyDate,
} from "../../../../../../helperFunctions/HelperFunctions"
import { StyledCheckbox, StyledTextField } from "../../../common/inputs"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
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
      "& input": {
         "&::placeholder": {
            color: theme.palette.text.primary,
            opacity: 1,
         },
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
   listItem: {
      flex: 1,
      display: "flex",
   },
})

type Props = {
   livestreamStats: LiveStreamStats[]
   localSelectedStats: LiveStreamStats[]
   loading: boolean
   handleChange: (event: React.SyntheticEvent, value: LiveStreamStats[]) => void
}

const LivestreamAutoComplete: FC<Props> = ({
   livestreamStats,
   loading,
   localSelectedStats,
   handleChange,
}) => {
   const [open, setOpen] = useState(false)
   const noLivestreamStats = livestreamStats?.length === 0
   const allLivestreamsSelected = localSelectedStats?.length === 0
   const livestreamsSelected = localSelectedStats?.length > 0

   const placeHolder = useMemo(() => {
      if (loading) return "Loading..."

      if (livestreamsSelected) {
         return ""
      }

      if (noLivestreamStats) {
         return "No live streams"
      }

      if (open) {
         return "Select live streams"
      }

      if (allLivestreamsSelected) {
         return "All live streams"
      }

      return "Select livestreams"
   }, [
      allLivestreamsSelected,
      livestreamsSelected,
      loading,
      noLivestreamStats,
      open,
   ])

   const getMessage = useCallback(
      (value: LiveStreamStats[]): string => {
         if (allLivestreamsSelected) {
            return ""
         }

         if (value?.length === 0) {
            return noLivestreamStats ? "No live streams" : "All live streams"
         }
         if (value?.length === 1) {
            return value[0]?.livestream?.title
         }

         return `${value?.length} live streams selected`
      },
      [allLivestreamsSelected, noLivestreamStats]
   )

   const renderTags = useCallback(
      (value: LiveStreamStats[]) => {
         if (loading) return <CircularProgress color={"inherit"} size={15} />

         const message = getMessage(value)

         return <Typography whiteSpace="pre-line">{message}</Typography>
      },
      [getMessage, loading]
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

   const closeSelect = useCallback(() => {
      setOpen(false)
   }, [])

   const openSelect = useCallback(() => {
      setOpen(true)
   }, [])

   return (
      <VirtualizedAutocomplete
         multiple
         clearOnBlur
         open={open}
         onOpen={openSelect}
         onClose={closeSelect}
         id="select-livestream"
         options={livestreamStats ?? []}
         disableCloseOnSelect
         loading={loading}
         disabled={noLivestreamStats || loading}
         fullWidth
         clearText={"Clear filter"}
         listBoxCustomProps={listBoxCustomProps}
         noOptionsText={noLivestreamStats ? "No live streams" : "No results"}
         freeSolo={false}
         onChange={handleChange}
         value={localSelectedStats}
         getOptionLabel={getLabelFn}
         isOptionEqualToValue={isOptionEqualToValue}
         // @ts-ignore
         renderOption={renderOption}
         renderInput={renderInput}
         renderTags={renderTags}
      />
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

const listBoxCustomProps = {
   listBoxSx: styles.listBox,
   listBoxItemHeight: 95,
}

export default LivestreamAutoComplete
