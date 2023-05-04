import React, { FC, useCallback, useMemo, useState } from "react"
import { Box, Card, Grid } from "@mui/material"
import { getParts } from "../../util/search"
import { sxStyles } from "../../../types/commonTypes"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import RenderParts from "../common/search/RenderParts"
import { companyNameSlugify, dynamicSort } from "@careerfairy/shared-lib/utils"
import useGroupSearch from "../../custom-hook/group/useGroupSearch"
import { UseSearchOptions } from "../../custom-hook/utils/useSearch"
import { where } from "firebase/firestore"
import { Group } from "@careerfairy/shared-lib/groups"
import AutocompleteSearch from "../common/AutocompleteSearch"
import { useRouter } from "next/router"
import { Search as FindIcon } from "react-feather"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
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

const CompanySearch: FC = () => {
   const [inputValue, setInputValue] = useState("")
   const { push } = useRouter()

   const options = useMemo<UseSearchOptions<Group>>(
      () => ({
         maxResults: 7,
         additionalConstraints: [
            where("publicProfile", "==", true),
            where("test", "==", false),
         ],
         emptyOrderBy: {
            field: "universityName",
            direction: "asc",
         },
      }),
      []
   )

   const { data: companyHits, status } = useGroupSearch(inputValue, options)

   const loading = status === "loading"

   const handleChange = useCallback(
      (newValue: Group | null) =>
         push(`/company/${companyNameSlugify(newValue?.universityName || "")}`),
      [push]
   )

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         option: Group,
         state: AutocompleteRenderOptionState
      ) => {
         const titleParts = getParts(option.universityName, inputValue)

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

   const sortedGroups = useMemo(
      () => companyHits?.sort(dynamicSort("universityName", "asc")) || [],
      [companyHits]
   )

   return (
      <Card sx={styles.root}>
         <AutocompleteSearch
            id="company-search"
            loading={loading}
            handleChange={handleChange}
            options={sortedGroups}
            renderOption={renderOption}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            setInputValue={setInputValue}
            noOptionsText="No companies found"
            placeholderText="Search for a company"
            inputEndIcon={<FindIcon />}
         />
      </Card>
   )
}

const isOptionEqualToValue = (option: Group, value: Group) =>
   option.id === value.id

const getOptionLabel = (option: Group) => option.universityName
export default CompanySearch
