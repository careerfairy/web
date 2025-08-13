import { SPARK_REPLICAS } from "@careerfairy/shared-lib/sparks/search"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import {
   FilterOptions,
   useSparkSearchAlgolia,
} from "components/custom-hook/spark/useSparkSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAutoPlayGrid } from "components/custom-hook/utils/useAutoPlayGrid"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import SparkCardSkeleton from "components/views/sparks/components/spark-card/SparkCardSkeleton"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { InView, useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import { useSearchContext } from "../SearchContext"
import { NoResultsFound } from "../SearchResults"
import FilterCompanySize from "./filter/FilterCompanySize"
import FilterContentTopic from "./filter/FilterContentTopic"
import FilterIndustry from "./filter/FilterIndustry"
import FilterLanguage from "./filter/FilterLanguage"

const styles = sxStyles({
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
   loader: {
      display: "flex",
      justifyContent: "center",
      padding: 4,
   },
   sparksGrid: {
      display: "grid",
      gridTemplateColumns: {
         xs: "repeat(2, minmax(0, 1fr))",
         sm: "repeat(3, minmax(0, 1fr))",
         md: "repeat(4, minmax(0, 1fr))",
         lg: "repeat(5, minmax(0, 1fr))",
         xl: "repeat(6, minmax(0, 1fr))",
      },
      gap: 2,
      mt: 2,
   },
})

export const SparksTab = () => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const { getFilterValues } = useSearchContext()
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const {
      shouldDisableAutoPlay,
      moveToNextElement,
      ref: autoPlayRef,
      handleInViewChange,
      muted,
   } = useAutoPlayGrid()

   const searchTerm = getFilterValues("q")[0] || ""
   const selectedLanguages = getFilterValues("languages")
   const selectedContentTopics = getFilterValues("contentTopicIds")
   const selectedCompanySizes = getFilterValues("companySizes")
   const selectedIndustries = getFilterValues("industries")

   const filterOptions: FilterOptions = {
      arrayFilters: {
         language: selectedLanguages,
         contentTopicsTagIds: selectedContentTopics,
         groupCompanySize: selectedCompanySizes,
         groupCompanyIndustriesIdTags: selectedIndustries,
      },
      booleanFilters: {
         published: true,
         groupPublicSparks: true,
      },
   }

   const { data, setSize, isValidating } = useSparkSearchAlgolia(
      searchTerm,
      filterOptions,
      20, // Match sparks feed pagination
      SPARK_REPLICAS.PUBLISHED_AT_DESC
   )

   const infiniteSparks = useMemo(() => {
      return data?.flatMap((page) => page.deserializedHits) ?? []
   }, [data])

   const numberOfResults = data?.[0]?.nbHits || 0

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView && infiniteSparks.length < numberOfResults) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize, infiniteSparks.length, numberOfResults])

   const handleSparkClick = useCallback(
      (spark) => {
         if (!spark) return

         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { sparkId, ...currentQuery } = router.query
         const query: Record<string, string | string[]> = {
            ...currentQuery,
            interactionSource: SparkInteractionSources.PortalSearch,
         }

         if (selectedLanguages.length > 0) {
            query.languages = router.query.languages
         }
         if (selectedContentTopics.length > 0) {
            query.contentTopicIds = router.query.contentTopicIds
         }
         if (selectedCompanySizes.length > 0) {
            query.companySizes = router.query.companySizes
         }
         if (selectedIndustries.length > 0) {
            query.industries = router.query.industries
         }
         if (searchTerm) {
            query.q = router.query.q
         }

         router.push({
            pathname: `/sparks/${spark.id}`,
            query,
         })
      },
      [
         router,
         selectedLanguages,
         selectedContentTopics,
         selectedCompanySizes,
         selectedIndustries,
         searchTerm,
      ]
   )

   return (
      <Box sx={styles.resultsContainer} id="sparks-tab" ref={autoPlayRef}>
         <Box sx={styles.filterContainer}>
            <ChipDropdownProvider>
               <Stack direction="row" spacing={1} sx={styles.searchBy}>
                  <FilterLanguage />
                  <FilterIndustry />
                  <FilterCompanySize />
                  <FilterContentTopic />
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
            {infiniteSparks.length > 0 ? (
               <Box sx={styles.sparksGrid}>
                  {infiniteSparks.map((spark, index) => (
                     <InView
                        key={spark.id}
                        onChange={handleInViewChange(index)}
                     >
                        {({ inView, ref }) => (
                           <Box ref={ref}>
                              {inView ? (
                                 <SparkPreviewCard
                                    spark={spark}
                                    onClick={handleSparkClick}
                                    questionLimitLines={true}
                                    muted={muted}
                                    type="gallery"
                                    disableAutoPlay={shouldDisableAutoPlay(
                                       index
                                    )}
                                    onGoNext={moveToNextElement}
                                 />
                              ) : (
                                 <SparkCardSkeleton />
                              )}
                           </Box>
                        )}
                     </InView>
                  ))}
               </Box>
            ) : !isValidating ? (
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
