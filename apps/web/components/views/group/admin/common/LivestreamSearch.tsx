import React, { FC, useMemo, useState } from "react"
import { Box, Grid, Stack, Typography } from "@mui/material"
import { prettyDate } from "../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import AutocompleteSearch from "../../../common/AutocompleteSearch"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import { LivestreamSearchResult } from "types/algolia"
import SanitizedHTML from "components/util/SanitizedHTML"
import { Tag } from "react-feather"
import { LivestreamReplicaType } from "@careerfairy/shared-lib/livestreams/search"

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
   value: LivestreamSearchResult
   handleChange: (value: LivestreamSearchResult | null) => void
   orderByDirection?: "asc" | "desc"
   startIcon?: JSX.Element
   endIcon?: JSX.Element
   hasPastEvents?: boolean
   includeHiddenEvents?: boolean
   filterOptions: FilterOptions
   placeholderText?: string
   inputValue: string
   // optional: if you want to use debounce and separate the input ui and search state
   debouncedInputValue?: string
   setInputValue: (value: string) => void
   freeSolo?: boolean
   targetReplica?: LivestreamReplicaType
}

const LivestreamSearch: FC<Props> = ({
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
}) => {
   const [open, setOpen] = useState(false)

   const { data } = useLivestreamSearchAlgolia(
      debouncedInputValue ?? inputValue,
      filterOptions,
      targetReplica
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
         freeSolo={freeSolo}
      />
   )
}

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: LivestreamSearchResult,
   state: AutocompleteRenderOptionState
) => {
   const highlightTitle = option._highlightResult?.title
   const highlightCompany = option._highlightResult?.company
   const companyIndustryNameTags =
      option._highlightResult?.companyIndustryNameTags

   const companyIndustriesText =
      companyIndustryNameTags?.map((industry) => industry.value).join(", ") ||
      option.companyIndustries?.join(", ")

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
            <Grid item>
               {state.selected ? <CheckRoundedIcon fontSize="small" /> : null}
            </Grid>
         </Grid>
      </Box>
   )
}

const isOptionEqualToValue = (
   option: LivestreamSearchResult,
   value: LivestreamSearchResult
) => option.id === value.id

const getOptionLabel = (option: LivestreamSearchResult) =>
   typeof option === "string" ? option : option.title

export default LivestreamSearch
