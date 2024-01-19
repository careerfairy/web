import React, { FC, useCallback, useMemo, useState } from "react"
import { Box, Grid, Stack } from "@mui/material"
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
import Filter, { FilterEnum } from "../common/filter/Filter"

const styles = sxStyles({
   boxWrapper: {
      flex: 1,
      display: "flex",
      marginX: { xs: 2, md: 3 },
   },
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
   filter: {
      flex: "10%",
      display: "flex",
      ml: {
         xs: 1,
         md: 3,
      },
   },
   filterWrapper: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0px 12px 32px 0px rgba(0, 0, 0, 0.04)",
   },
   searchWrapper: {
      backgroundColor: "white",
      flex: "90%",
      display: "flex",
      borderRadius: "8px",
      boxShadow: "0px 12px 32px 0px rgba(0, 0, 0, 0.04)",
   },
})

export type CompanySearchProps = {
   filterResults?: number
}
const CompanySearch: FC<CompanySearchProps> = ({ filterResults }) => {
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
   /**
    * Filter by Company: location, industry, sparks(y/n) or size.
    */

   const filtersToShow = useMemo(
      () => [
         FilterEnum.companySparks,
         FilterEnum.companyCountries,
         FilterEnum.companyIndustries,
         FilterEnum.companySizes,
      ],
      []
   )
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
      <Stack direction={"row"}>
         <Box sx={styles.searchWrapper}>
            <AutocompleteSearch
               id="company-search"
               minCharacters={3}
               loading={loading}
               inputValue={inputValue}
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
         </Box>
         <Box sx={styles.filter} justifyContent={"end"}>
            <Stack direction={"row"} sx={styles.filterWrapper}>
               <Filter
                  filtersToShow={filtersToShow}
                  // TODO:WG Pass results from length of Array in parent components
                  numberOfResults={filterResults}
               />
            </Stack>
         </Box>
      </Stack>
   )
}

const isOptionEqualToValue = (option: Group, value: Group) =>
   option.id === value.id

const getOptionLabel = (option: Group) => option.universityName
export default CompanySearch
