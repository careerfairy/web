import { convertLocationIdsToCountryCodes } from "@careerfairy/shared-lib/countries/types"
import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { Box, CircularProgress, Grid, Stack, Typography } from "@mui/material"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAutoPlayGrid } from "components/custom-hook/utils/useAutoPlayGrid"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { useEffect, useMemo, useRef } from "react"
import { InView, useInView } from "react-intersection-observer"
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
      px: { xs: 2, md: 4 },
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

export const RecordingsTab = () => {
   const { getFilterValues, handleOpenLivestreamDialog } = useSearchContext()
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })
   const isMobile = useIsMobile()

   const {
      shouldDisableAutoPlay,
      moveToNextElement,
      ref: autoPlayRef,
      handleInViewChange,
      muted,
      setMuted,
   } = useAutoPlayGrid()

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
         hasEnded: true,
      },
      dateFilter: "past" as const,
   }

   const { data, setSize, isValidating } = useLivestreamSearchAlgolia(
      searchTerm,
      filterOptions,
      LIVESTREAM_REPLICAS.START_DESC,
      false,
      12
   )

   const infiniteRecordings =
      data?.flatMap((page) => page.deserializedHits) || []

   const numberOfResults = data?.[0]?.nbHits || 0

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView && infiniteRecordings.length < numberOfResults) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize, infiniteRecordings.length, numberOfResults])

   return (
      <Box sx={styles.resultsContainer} ref={autoPlayRef}>
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
            {infiniteRecordings.length > 0 ? (
               <Grid container spacing={2}>
                  {infiniteRecordings?.map((recording, index, arr) => {
                     if (recording) {
                        return (
                           <Grid
                              key={recording.id}
                              xs={12}
                              lsCardsGallery={6}
                              lg={4}
                              xl={3}
                              item
                           >
                              <InView triggerOnce>
                                 {({ inView, ref }) =>
                                    inView ? (
                                       <EventPreviewCard
                                          ref={ref}
                                          event={recording as any}
                                          index={index}
                                          totalElements={arr.length}
                                          location={
                                             ImpressionLocation.portalSearchResults
                                          }
                                          disableAutoPlay={shouldDisableAutoPlay(
                                             index
                                          )}
                                          onGoNext={moveToNextElement}
                                          onViewChange={handleInViewChange(
                                             index
                                          )}
                                          muted={muted}
                                          setMuted={setMuted}
                                          onCardClick={(e) => {
                                             e.preventDefault()
                                             handleOpenLivestreamDialog(
                                                recording.id
                                             )
                                          }}
                                       />
                                    ) : (
                                       <EventPreviewCard ref={ref} loading />
                                    )
                                 }
                              </InView>
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
