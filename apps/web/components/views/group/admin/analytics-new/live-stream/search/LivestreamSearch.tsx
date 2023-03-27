import React, { useCallback, useMemo, useState } from "react"
import { StyledTextField } from "../../../common/inputs"
import Autocomplete from "@mui/material/Autocomplete"
import { Box, Card, Grid, Typography } from "@mui/material"
import { where } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { useLivestreamSearch } from "../../../../../../custom-hook/live-stream/useLivestreamSearch"
import { getParts } from "../../../../../../util/search"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import { useRouter } from "next/router"
import { prettyDate } from "../../../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import RenderParts from "../../../../../common/search/RenderParts"

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
const LivestreamSearch = () => {
   const { group } = useGroup()
   const { push } = useRouter()

   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()
   const [inputValue, setInputValue] = useState("")

   const additionalConstraints = useMemo(
      () => [where("groupIds", "array-contains", group.id)],
      [group.id]
   )

   const { data: livestreamHits } = useLivestreamSearch(
      inputValue,
      additionalConstraints,
      {
         maxResults: 7,
      }
   )

   const value = currentStreamStats?.livestream ?? null

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: LivestreamEvent,
         state: AutocompleteRenderOptionState
      ) => {
         const titleParts = getParts(option.title, inputValue)
         const companyParts = getParts(option.company, inputValue)

         return (
            <Box
               {...props}
               component="li"
               sx={[state.selected && styles.listItemSelected]}
               key={option.id}
            >
               <Grid container alignItems="center">
                  <Grid item width="calc(100% - 44px)" sx={styles.listItemGrid}>
                     <RenderParts parts={titleParts} />
                     <Typography variant="body2" color="text.secondary">
                        <RenderParts parts={companyParts} />
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
      [inputValue]
   )

   // Change only triggered/called when user selects an option
   const onChange = useCallback(
      (event: any, newValue: LivestreamEvent | null) => {
         void push(
            `/group/${group.id}/admin/analytics/live-stream/${
               newValue?.id ?? ""
            }`,
            undefined,
            { shallow: true }
         )
      },
      [group.id, push]
   )

   const onInputChange = useCallback(
      (event: any, newInputValue: string, reason: string) => {
         if (reason === "reset") {
            return // don't update the input value when the user selects an option, better UX
         }
         setInputValue(newInputValue)
      },
      []
   )

   return (
      <Card sx={styles.root}>
         <Autocomplete
            id="livestream-search"
            fullWidth
            getOptionLabel={getOptionLabel}
            options={livestreamHits ?? []}
            autoComplete
            disableClearable
            includeInputInList
            clearOnBlur
            ListboxProps={listBoxProps}
            value={value}
            isOptionEqualToValue={isOptionEqualToValue}
            noOptionsText="No livestreams found"
            onChange={onChange}
            onInputChange={onInputChange}
            renderInput={(params) => (
               <StyledTextField
                  {...params}
                  placeholder={"Search for livestreams"}
                  fullWidth
               />
            )}
            renderOption={renderOption}
         />
      </Card>
   )
}

const listBoxProps: React.ComponentProps<typeof Autocomplete>["ListboxProps"] =
   {
      // @ts-ignore
      sx: styles.listBox,
   }

const isOptionEqualToValue = (
   option: LivestreamEvent,
   value: LivestreamEvent
) => option.id === value.id

const getOptionLabel = (option: LivestreamEvent) => option.title
export default LivestreamSearch
