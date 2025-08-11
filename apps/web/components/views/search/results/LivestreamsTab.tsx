import { convertLocationIdsToCountryCodes } from "@careerfairy/shared-lib/countries/types"
import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { Box, CircularProgress, Grid, Stack, Typography } from "@mui/material"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
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
})

export const LivestreamsTab = () => {
   const isMobile = useIsMobile()
   const { getFilterValues, handleOpenLivestreamDialog } = useSearchContext()
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const searchTerm = getFilterValues("q")[0] || ""
   const selectedLanguages = getFilterValues("languages")
   const selectedFieldsOfStudy = getFilterValues("fieldsOfStudy")
   const selectedIndustries = getFilterValues("industries")
   const selectedLocations = getFilterValues("locations")
   const selectedCompanySizes = getFilterValues("companySizes")

   // Convert location IDs to country codes for filtering (e.g if a user selects a city,
   // we will still filter only by the country)
   const selectedCountryCodes = useMemo(() => {
      return convertLocationIdsToCountryCodes(selectedLocations)
   }, [selectedLocations])

   const filterOptions: FilterOptions = {
      arrayFilters: {
         languageCode: selectedLanguages,
         fieldOfStudyIdTags: selectedFieldsOfStudy,
         companyIndustries: selectedIndustries,
         companyCountries: selectedCountryCodes,
         companySizes: selectedCompanySizes,
      },
      booleanFilters: {
         hidden: false,
         test: false,
         hasEnded: false,
      },
      dateFilter: "future" as const,
   }

   const { data, setSize, isValidating } = useLivestreamSearchAlgolia(
      searchTerm,
      filterOptions,
      LIVESTREAM_REPLICAS.START_ASC,
      false,
      12
   )

   const infiniteLivestreams =
      data?.flatMap((page) => page.deserializedHits) || []

   const numberOfResults = data?.[0]?.nbHits || 0

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView && infiniteLivestreams.length < numberOfResults) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize, infiniteLivestreams.length, numberOfResults])

   return (
      <Box sx={styles.resultsContainer} id="livestreams-tab">
         <Box sx={styles.filterContainer}>
            <ChipDropdownProvider>
               <Stack direction="row" spacing={1} sx={styles.searchBy}>
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
            {infiniteLivestreams.length > 0 ? (
               <Grid container spacing={2}>
                  {infiniteLivestreams?.map((livestream, index, arr) => {
                     if (livestream) {
                        return (
                           <Grid
                              key={livestream.id}
                              xs={12}
                              sm={6}
                              lg={4}
                              xl={3}
                              item
                           >
                              <EventPreviewCard
                                 event={livestream as any}
                                 index={index}
                                 totalElements={arr.length}
                                 location={
                                    ImpressionLocation.portalSearchResults
                                 }
                                 onCardClick={(e) => {
                                    e.preventDefault()
                                    handleOpenLivestreamDialog(livestream.id)
                                 }}
                              />
                           </Grid>
                        )
                     }
                     return null
                  })}
               </Grid>
            ) : !isValidating ? (
               <NoResultsFound />
            ) : null}
         </Box>

         {Boolean(isValidating) && (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         )}

         <Box ref={ref} />
      </Box>
   )
}
