import React, { FC, useCallback, useMemo, useState } from "react"
import { Box, Grid, Typography } from "@mui/material"
import { prettyDate } from "../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/utils"
import AutocompleteSearch from "../../../common/AutocompleteSearch"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import { LivestreamSearchResult } from "types/algolia"
import SanitizedHTML from "components/util/SanitizedHTML"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
   listBox: {
      "& li": {
         backgroundColor: "transparent",
         "&:hover": {
            backgroundColor: (theme) =>
               theme.palette.action.hover + " !important",
         },
      },
   },
   listItemGrid: {
      width: "calc(100% - 44px)",
      wordWrap: "break-word",
      "& em": {
         fontStyle: "normal",
         fontWeight: 600,
      },
   },
   listItemSelected: {
      backgroundColor: "white !important",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.action.hover + " !important",
      },
   },
})

type Props = {
   value: LivestreamSearchResult
   handleChange: (value: LivestreamSearchResult | null) => void
   orderByDirection?: "asc" | "desc"
   startIcon?: JSX.Element
   endIcon?: JSX.Element
   placeholderText?: string
   hasPastEvents?: boolean
   includeHiddenEvents?: boolean
   filterOptions: FilterOptions
}

const LivestreamSearch: FC<Props> = ({
   value,
   handleChange,
   orderByDirection,
   startIcon,
   endIcon,
   placeholderText,
   filterOptions,
}) => {
   const [inputValue, setInputValue] = useState("")

   const [open, setOpen] = useState(false)

   const { data } = useLivestreamSearchAlgolia(inputValue, filterOptions, !open)

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: LivestreamSearchResult,
         state: AutocompleteRenderOptionState
      ) => {
         const highlightTitle = option._highlightResult?.title
         const highlightCompany = option._highlightResult?.company

         return (
            <Box
               {...props}
               component="li"
               sx={[state.selected && styles.listItemSelected]}
               key={option.objectID}
            >
               <Grid container alignItems="center">
                  <Grid item width="calc(100% - 44px)" sx={styles.listItemGrid}>
                     <SanitizedHTML
                        htmlString={highlightCompany?.value || option.company}
                     />
                     <Typography variant="body2" color="text.secondary">
                        <SanitizedHTML
                           htmlString={highlightTitle?.value || option.title}
                        />
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        {prettyDate(option.start)}
                     </Typography>
                  </Grid>
                  <Grid item>
                     {state.selected ? (
                        <CheckRoundedIcon fontSize="small" />
                     ) : null}
                  </Grid>
               </Grid>
            </Box>
         )
      },
      []
   )

   const sortedLivestreamHits = useMemo(() => {
      const sortedHits: LivestreamSearchResult[] = data?.deserializedHits || []

      if (value && !sortedHits?.find((hit) => hit.id === value?.id)) {
         // add current value to sortedHits array if it's not already in there
         sortedHits.push(value)
      }

      sortedHits.sort((a, b) =>
         sortLivestreamsDesc(a, b, orderByDirection === "asc")
      )

      return sortedHits
   }, [data, orderByDirection, value])

   return (
      <AutocompleteSearch
         id="livestream-search"
         value={value}
         inputValue={inputValue}
         handleChange={handleChange}
         options={sortedLivestreamHits}
         renderOption={renderOption}
         isOptionEqualToValue={isOptionEqualToValue}
         getOptionLabel={getOptionLabel}
         inputStartIcon={startIcon}
         setInputValue={setInputValue}
         placeholderText={placeholderText}
         inputEndIcon={endIcon}
         open={open}
         setOpen={setOpen}
         disableFiltering // Filtering is now done by Algolia, not by the component
      />
   )
}

const isOptionEqualToValue = (
   option: LivestreamSearchResult,
   value: LivestreamSearchResult
) => option.id === value.id

const getOptionLabel = (option: LivestreamSearchResult) => option.title
export default LivestreamSearch
