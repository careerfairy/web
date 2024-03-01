import React, { FC, useCallback, useMemo, useState } from "react"
import { Box, Grid, Typography } from "@mui/material"
import { where } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { prettyDate } from "../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/utils"
import { UseSearchOptions } from "../../../../custom-hook/utils/useSearch"
import AutocompleteSearch from "../../../common/AutocompleteSearch"
import { QueryConstraint } from "@firebase/firestore"
import { useLivestreamSearchAlgolia } from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
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
   },
   listItemSelected: {
      backgroundColor: "white !important",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.action.hover + " !important",
      },
   },
})

export type LivestreamHit = LivestreamSearchResult

type Props = {
   value: LivestreamHit
   handleChange: (value: LivestreamHit | null) => void
   orderByDirection?: "asc" | "desc"
   startIcon?: JSX.Element
   endIcon?: JSX.Element
   placeholderText?: string
   additionalConstraints?: QueryConstraint[]
   hasPastEvents?: boolean
   includeHiddenEvents?: boolean
}
const LivestreamSearch: FC<Props> = ({
   value,
   handleChange,
   orderByDirection,
   startIcon,
   endIcon,
   placeholderText,
   additionalConstraints = [] as QueryConstraint[],
   // hasPastEvents, TODO: Add this to Algolia filtering
   includeHiddenEvents,
}) => {
   const [inputValue, setInputValue] = useState("")

   // When using trigrams in a search, it's necessary to obtain more results because the filtering can only be performed on the client-side.
   // This ensures that we have some results to display to the user.
   //
   // When using trigrams in a search, we require a minimum number of characters in the search input
   // to ensure that no emptyOrderBy option will be added
   // TODO: convert this to algolia filtering
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const options = useMemo<UseSearchOptions<LivestreamEvent>>(
      () => ({
         maxResults: 7,
         debounceMs: null,
         additionalConstraints: [
            ...additionalConstraints,
            where("test", "==", false),
            ...(includeHiddenEvents ? [] : [where("hidden", "==", false)]),
         ],
         emptyOrderBy: {
            field: "start",
            direction: orderByDirection || "desc",
         },
      }),
      [additionalConstraints, includeHiddenEvents, orderByDirection]
   )

   const { data } = useLivestreamSearchAlgolia(inputValue)

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: LivestreamHit,
         state: AutocompleteRenderOptionState
      ) => {
         const highlightTitle = option._highlightResult.title
         const highlightCompany = option._highlightResult.company

         return (
            <Box
               {...props}
               component="li"
               sx={[state.selected && styles.listItemSelected]}
               key={option.id}
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
         disableFiltering // Filtering is now done by Algolia, not by the component
      />
   )
}

const isOptionEqualToValue = (option: LivestreamHit, value: LivestreamHit) =>
   option.id === value.id

const getOptionLabel = (option: LivestreamHit) => option.title
export default LivestreamSearch
