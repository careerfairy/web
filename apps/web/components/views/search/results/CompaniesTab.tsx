import { convertLocationIdsToCountryCodes } from "@careerfairy/shared-lib/countries/types"
import { COMPANY_REPLICAS } from "@careerfairy/shared-lib/groups/search"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, CircularProgress, Grid, Stack, Typography } from "@mui/material"
import {
   FilterOptions,
   useCompanySearchAlgolia,
} from "components/custom-hook/group/useGroupSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import CompanyCard from "components/views/companies/CompanyCard"
import { useEffect, useMemo, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import { useSearchContext } from "../SearchContext"
import { NoResultsFound } from "../SearchResults"
import FilterCompanySize from "./filter/FilterCompanySize"
import FilterFieldOfStudy from "./filter/FilterFieldOfStudy"
import FilterIndustry from "./filter/FilterIndustry"
import FilterLanguage from "./filter/FilterLanguage"
import FilterLocation from "./filter/FilterLocation"
import FilterSparks from "./filter/FilterSparks"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      padding: 4,
   },
   resultsContainer: {
      py: { xs: 1.5, md: 2 },
      px: 2,
   },
   filterContainer: {
      mb: { xs: 1.5, md: 2 },
   },
   searchBy: {
      overflowX: "auto",
      "&::-webkit-scrollbar": {
         display: "none",
      },
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      mx: { xs: -2, md: 0 },
      px: { xs: 2, md: 0 },
   },
   flexItem: {
      display: "flex",
   },
})

export const CompaniesTab = () => {
   const isMobile = useIsMobile()
   const { getFilterValues } = useSearchContext()
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const searchTerm = getFilterValues("q")[0] || ""
   const selectedLanguages = getFilterValues("languages")
   const selectedFieldsOfStudy = getFilterValues("fieldsOfStudy")
   const selectedIndustries = getFilterValues("industries")
   const selectedLocations = getFilterValues("locations")
   const selectedCompanySizes = getFilterValues("companySizes")
   const hasPublicSparks = getFilterValues("publicSparks").includes("true")

   // Convert location IDs to country codes for filtering (e.g if a user selects a city,
   // we will still filter only by the country)
   const selectedCountryCodes = useMemo(() => {
      return convertLocationIdsToCountryCodes(selectedLocations)
   }, [selectedLocations])

   const filterOptions: FilterOptions = {
      arrayFilters: {
         contentLanguages: selectedLanguages,
         targetedFieldsOfStudyIdTags: selectedFieldsOfStudy,
         companyIndustriesIdTags: selectedIndustries,
         companyCountryId: selectedCountryCodes,
         companySize: selectedCompanySizes,
      },
      booleanFilters: {
         test: false,
         publicProfile: true,
         ...(hasPublicSparks && { publicSparks: true }),
      },
   }

   const { data, setSize, isValidating } = useCompanySearchAlgolia(
      searchTerm,
      filterOptions,
      COMPANY_REPLICAS.PRIORITY_DESC,
      false,
      12
   )

   const infiniteCompanies =
      data?.flatMap((page) => page.deserializedHits) || []

   const numberOfResults = data?.[0]?.nbHits || 0

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView && infiniteCompanies.length < numberOfResults) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize, infiniteCompanies.length, numberOfResults])

   return (
      <Box sx={styles.resultsContainer} id="companies-tab">
         <Box sx={styles.filterContainer}>
            <ChipDropdownProvider>
               <Stack direction="row" spacing={1} sx={styles.searchBy}>
                  <FilterSparks />
                  <FilterLanguage />
                  <FilterFieldOfStudy />
                  <FilterIndustry />
                  <FilterLocation />
                  <FilterCompanySize />
               </Stack>
            </ChipDropdownProvider>
         </Box>

         <Typography
            variant={isMobile ? "small" : "brandedBody"}
            color="neutral.700"
            mb={2}
         >
            {numberOfResults} result{numberOfResults !== 1 ? "s" : ""}
         </Typography>

         <Box sx={{ mt: 2 }}>
            {infiniteCompanies.length > 0 ? (
               <Grid container spacing={2}>
                  {infiniteCompanies?.map((company) => {
                     if (company) {
                        return (
                           <Grid
                              sx={styles.flexItem}
                              key={company.id}
                              xs={12}
                              sm={6}
                              lg={4}
                              xl={3}
                              item
                           >
                              <CompanyCard
                                 company={company}
                                 interactionSource={
                                    InteractionSources.Portal_Page_Search_Results
                                 }
                              />
                           </Grid>
                        )
                     }
                     return null
                  })}
               </Grid>
            ) : numberOfResults === 0 && !isValidating ? (
               <NoResultsFound />
            ) : null}

            {Boolean(isValidating) && (
               <Box sx={styles.loader}>
                  <CircularProgress />
               </Box>
            )}
            <Box ref={ref} />
         </Box>
      </Box>
   )
}
