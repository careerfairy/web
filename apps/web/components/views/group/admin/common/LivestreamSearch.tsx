import React, { FC, useCallback, useMemo, useState } from "react"
import { StyledTextField } from "./inputs"
import Autocomplete from "@mui/material/Autocomplete"
import { Box, Grid, Typography } from "@mui/material"
import { where } from "firebase/firestore"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
} from "@careerfairy/shared-lib/livestreams"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { useLivestreamSearch } from "../../../../custom-hook/live-stream/useLivestreamSearch"
import { getParts } from "../../../../util/search"
import { prettyDate } from "../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import RenderParts from "../../../common/search/RenderParts"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/utils"

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

export type LivestreamHit = LivestreamEvent | LivestreamEventPublicData

type Props = {
   value: LivestreamHit
   handleChange: (value: LivestreamHit | null) => void
   orderByDirection?: "asc" | "desc"
}
const LivestreamSearch: FC<Props> = ({
   value,
   handleChange,
   orderByDirection,
}) => {
   const { group } = useGroup()

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
         orderByDirection,
      }
   )

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: LivestreamHit,
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
      (event: any, newValue: LivestreamHit | null) => {
         return handleChange(newValue)
      },
      [handleChange]
   )

   const onInputChange = useCallback((event: any, newInputValue: string) => {
      setInputValue(newInputValue)
   }, [])

   const sortedLivestreamHits = useMemo(() => {
      const sortedHits: LivestreamHit[] = livestreamHits || []

      if (value && !livestreamHits?.find((hit) => hit.id === value?.id)) {
         // add current value to sortedHits array if it's not already in there
         sortedHits.push(value)
      }

      return sortedHits.sort((a, b) =>
         sortLivestreamsDesc(
            a as LivestreamEvent,
            b as LivestreamEvent,
            orderByDirection === "asc"
         )
      )
   }, [livestreamHits, orderByDirection, value])

   return (
      <Autocomplete
         id="livestream-search"
         fullWidth
         getOptionLabel={getOptionLabel}
         options={sortedLivestreamHits}
         autoComplete
         disableClearable
         blurOnSelect
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
   )
}

const listBoxProps: React.ComponentProps<typeof Autocomplete>["ListboxProps"] =
   {
      // @ts-ignore
      sx: styles.listBox,
   }

const isOptionEqualToValue = (option: LivestreamHit, value: LivestreamHit) =>
   option.id === value.id

const getOptionLabel = (option: LivestreamHit) => option.title
export default LivestreamSearch
