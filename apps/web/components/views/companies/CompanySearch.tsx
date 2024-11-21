import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"
import { COMPANY_REPLICAS } from "@careerfairy/shared-lib/groups/search"
import {
   companyNameSlugify,
   queryParamToArr,
   queryParamToBool,
} from "@careerfairy/shared-lib/utils"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, CircularProgress, Grid, Stack } from "@mui/material"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import {
   FilterOptions,
   useCompanySearchAlgolia,
} from "components/custom-hook/group/useGroupSearchAlgolia"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search as FindIcon } from "react-feather"
import { useInView } from "react-intersection-observer"
import { useDebounce } from "react-use"
import { CompanySearchResult } from "types/algolia"
import { sxStyles } from "../../../types/commonTypes"
import { getParts } from "../../util/search"
import AutocompleteSearch from "../common/AutocompleteSearch"
import Filter, { FilterEnum } from "../common/filter/Filter"
import RenderParts from "../common/search/RenderParts"
import Companies from "./Companies"

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
      justifyContent: "end",
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
   loader: {
      display: "flex",
      justifyContent: "center",
   },
})

/**
 *
 * @param query Query string object, all applied filters are passed by query string parameters.
 * @returns @type FilterCompanyOptions mapped from the query string object
 */
const getQueryVariables = (query: ParsedUrlQuery): FilterCompanyOptions => {
   return {
      companyCountries: queryParamToArr(query.companyCountries),
      companyIndustries: queryParamToArr(query.companyIndustries),
      publicSparks: queryParamToBool(query.companySparks as string),
      companySize: queryParamToArr(query.companySizes),
   }
}

const CompanySearch = () => {
   const [inputValue, setInputValue] = useState("")
   const [debouncedInputValue, setDebouncedInputValue] = useState("")
   const { push, query } = useRouter()
   const { companyCountries, companyIndustries, companySize, publicSparks } =
      useMemo(() => getQueryVariables(query), [query])
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   useDebounce(
      () => {
         setDebouncedInputValue(inputValue)
      },
      250,
      [inputValue]
   )

   /**
    * Filter by Company: location, industry, sparks(y/n) or size.
    */

   const filtersToShow = useMemo(
      () => [
         FilterEnum.COMPANY_SPARKS,
         FilterEnum.COMPANY_COUNTRIES,
         FilterEnum.COMPANY_INDUSTRIES,
         FilterEnum.COMPANY_SIZES,
      ],
      []
   )

   const filterOptions = useMemo<FilterOptions>(
      () => ({
         arrayFilters: {
            companyCountryId: companyCountries,
            companyIndustriesIdTags: companyIndustries,
            companySize,
         },

         booleanFilters: {
            ...(publicSparks && {
               publicSparks,
            }),
            test: false,
            publicProfile: true,
         },
      }),
      [companyCountries, companyIndustries, companySize, publicSparks]
   )

   const { data, setSize, isValidating } = useCompanySearchAlgolia(
      debouncedInputValue,
      filterOptions,
      COMPANY_REPLICAS.NAME_ASC
   )

   const numberOfResults = data?.[0]?.nbHits || 0

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

   const infiniteCompanies = useMemo(() => {
      return data?.flatMap((page) => page.deserializedHits)
   }, [data])

   const firstPage = data?.[0].deserializedHits

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize])

   return (
      <Stack spacing={2}>
         <Stack direction={"row"}>
            <Box sx={styles.searchWrapper}>
               <AutocompleteSearch
                  id="company-search"
                  loading={isValidating}
                  inputValue={inputValue}
                  handleChange={handleChange}
                  options={firstPage}
                  renderOption={renderOption}
                  isOptionEqualToValue={isOptionEqualToValue}
                  getOptionLabel={getOptionLabel}
                  setInputValue={setInputValue}
                  noOptionsText="No companies found"
                  placeholderText="Search for a company"
                  inputEndIcon={<FindIcon color={"black"} />}
                  disableFiltering // Filtering is now done by Algolia, not by the component
               />
            </Box>
            <Box sx={styles.filter}>
               <Stack direction={"row"} sx={styles.filterWrapper}>
                  <Filter
                     filtersToShow={filtersToShow}
                     numberOfResults={numberOfResults}
                  />
               </Stack>
            </Box>
         </Stack>
         <Grid item xs={12}>
            <Companies companies={infiniteCompanies} />
         </Grid>

         {Boolean(isValidating) && (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         )}
         <Box ref={ref} />
      </Stack>
   )
}

const isOptionEqualToValue = (option: Group, value: Group) =>
   option.id === value.id

const getOptionLabel = (option: CompanySearchResult) =>
   typeof option === "string" ? option : option.universityName
export default CompanySearch
