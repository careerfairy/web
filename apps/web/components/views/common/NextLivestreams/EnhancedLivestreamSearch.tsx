import { LivestreamReplicaType } from "@careerfairy/shared-lib/livestreams/search"
import { Box, Grid, Stack, Typography } from "@mui/material"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import { prettyDate } from "components/helperFunctions/HelperFunctions"
import SanitizedHTML from "components/util/SanitizedHTML"
import { useAlgoliaEvents } from "hooks/useAlgoliaEvents"
import React, { FC, useCallback, useMemo, useState } from "react"
import { Tag } from "react-feather"
import { LivestreamSearchResult } from "types/algolia"
import { sxStyles } from "types/commonTypes"
import AutocompleteSearch from "../AutocompleteSearch"

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
      color: "neutral.700",
      "& em": {
         fontStyle: "normal",
         fontWeight: 600,
      },
   },
   listItem: {
      padding: "12px !important",
   },
   listItemSelected: {
      backgroundColor: "white !important",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.action.hover + " !important",
      },
   },
})

type Props = {
   value: LivestreamSearchResult | null
   handleChange: (value: LivestreamSearchResult | null) => void
   startIcon?: React.ReactNode
   endIcon?: React.ReactNode
   hasPastEvents?: boolean
   filterOptions: FilterOptions
   placeholderText?: string
   inputValue: string
   debouncedInputValue: string
   setInputValue: (value: string) => void
   freeSolo?: boolean
   targetReplica?: LivestreamReplicaType
   enableAnalytics?: boolean
}

/**
 * Enhanced LivestreamSearch component with Algolia event tracking
 * Tracks search result clicks for Algolia Recommend
 */
const EnhancedLivestreamSearch: FC<Props> = ({
   value,
   handleChange,
   startIcon,
   endIcon,
   filterOptions,
   placeholderText = "Search by title, company or industry",
   inputValue,
   debouncedInputValue,
   setInputValue,
   freeSolo,
   targetReplica,
   enableAnalytics = true,
}) => {
   const [open, setOpen] = useState(false)
   const { trackSearchResultClick } = useAlgoliaEvents()

   const { data } = useLivestreamSearchAlgolia(
      debouncedInputValue ?? inputValue,
      filterOptions,
      targetReplica,
      false, // disable
      undefined, // itemsPerPage
      enableAnalytics
   )

   const firstPage = data?.[0]

   const sortedLivestreamHits = useMemo(() => {
      const sortedHits: LivestreamSearchResult[] =
         firstPage?.deserializedHits || []

      if (value && !sortedHits?.find((hit) => hit.id === value?.id)) {
         // add current value to sortedHits array if it's not already in there
         sortedHits.push(value)
      }

      return sortedHits
   }, [firstPage, value])

   const handleChangeWithTracking = useCallback(
      (selectedValue: LivestreamSearchResult | null) => {
         // Track the click event if analytics is enabled and we have the necessary data
         if (
            enableAnalytics &&
            selectedValue &&
            firstPage?.queryID &&
            selectedValue.objectID
         ) {
            const position = sortedLivestreamHits.findIndex(
               (hit) => hit.objectID === selectedValue.objectID
            )

            trackSearchResultClick({
               index: targetReplica || "livestreams",
               queryID: firstPage.queryID,
               objectID: selectedValue.objectID,
               position: position >= 0 ? position : 0,
               eventName: "Livestream Search Result Clicked",
            })
         }

         // Call the original handler
         handleChange(selectedValue)
      },
      [
         enableAnalytics,
         firstPage?.queryID,
         sortedLivestreamHits,
         targetReplica,
         trackSearchResultClick,
         handleChange,
      ]
   )

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: LivestreamSearchResult,
         state: AutocompleteRenderOptionState
      ) => {
         const highlightTitle = option._highlightResult?.title
         const highlightCompany = option._highlightResult?.company
         const companyIndustryNameTags =
            option._highlightResult?.companyIndustryNameTags

         const companyIndustriesText =
            companyIndustryNameTags
               ?.map((industry) => industry.value)
               .join(", ") || option.companyIndustries?.join(", ")

         return (
            <Box
               {...props}
               component="li"
               sx={[styles.listItem, state.selected && styles.listItemSelected]}
               key={option.objectID}
            >
               <Grid container alignItems="center">
                  <Grid item sx={styles.listItemGrid}>
                     <Typography
                        component={SanitizedHTML}
                        htmlString={highlightTitle?.value || option.title}
                        variant="small"
                        mb={1}
                     />
                     <Typography
                        component={SanitizedHTML}
                        htmlString={highlightCompany?.value || option.company}
                        variant="xsmall"
                     />
                     {Boolean(companyIndustriesText) && (
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={0.5}
                           mt={0.5}
                        >
                           <Tag size={12} />
                           <Typography
                              component={SanitizedHTML}
                              variant="xsmall"
                              htmlString={companyIndustriesText}
                           />
                        </Stack>
                     )}
                     <Typography mt={1} variant="xsmall" color="neutral.500">
                        {prettyDate(option.start)}
                     </Typography>
                  </Grid>
               </Grid>
            </Box>
         )
      },
      []
   )

   const isOptionEqualToValue = useCallback(
      (option: LivestreamSearchResult, value: LivestreamSearchResult) =>
         option.id === value.id,
      []
   )

   const getOptionLabel = useCallback(
      (option: LivestreamSearchResult | string) => {
         if (typeof option === "string") return option
         return option.title || ""
      },
      []
   )

   return (
      <AutocompleteSearch
         id="enhanced-livestream-search"
         value={value}
         inputValue={inputValue}
         handleChange={handleChangeWithTracking}
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
         freeSolo={freeSolo}
      />
   )
}

export default EnhancedLivestreamSearch
