import { convertLocationIdsToCountryCodes } from "@careerfairy/shared-lib/countries/types"
import { Box, Stack, Typography } from "@mui/material"
import {
   FilterOptions as JobFilterOptions,
   buildAlgoliaFilterString as buildJobFilterString,
} from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import {
   FilterOptions as CompanyFilterOptions,
   buildAlgoliaFilterString,
} from "components/custom-hook/group/useGroupSearchAlgolia"
import {
   FilterOptions as LivestreamFilterOptions,
   buildAlgoliaFilterString as buildLivestreamFilterString,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import {
   FilterOptions as SparkFilterOptions,
   buildAlgoliaFilterString as buildSparkFilterString,
} from "components/custom-hook/spark/useSparkSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import algoliaSearchClient from "data/algolia/AlgoliaInstance"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import {
   Configure,
   Index,
   InstantSearch,
   useSearchBox,
} from "react-instantsearch"
import { sxStyles } from "types/commonTypes"
import { getEnvPrefix } from "util/CommonUtil"
import { useSearchContext } from "../SearchContext"
import { NoResultsFound } from "../SearchResults"
import { CompaniesGridHits } from "./all/CompaniesGridHits"
import { JobsGridHits } from "./all/JobsGridHits"
import { LivestreamsGridHits } from "./all/LivestreamsGridHits"
import { RecordingsGridHits } from "./all/RecordingsGridHits"
import { SparksCarouselHits } from "./all/SparksCarouselHits"
import FilterCompanySize from "./filter/FilterCompanySize"
import FilterFieldOfStudy from "./filter/FilterFieldOfStudy"
import FilterIndustry from "./filter/FilterIndustry"
import FilterLanguage from "./filter/FilterLanguage"
import FilterLocation from "./filter/FilterLocation"

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
})

// Get the correct index names with environment prefix
const getIndexName = (baseName: string) => {
   const envPrefix = getEnvPrefix()
   return `${envPrefix}_${baseName}`
}

// Custom search box component that syncs with URL search params
const SearchBoxConnector = () => {
   const { getFilterValues } = useSearchContext()
   const { refine } = useSearchBox()

   const searchTerm = getFilterValues("q")[0] || ""

   // Sync the search term with InstantSearch
   useEffect(() => {
      refine(searchTerm)
   }, [searchTerm, refine])

   return null
}

const RESULT_TYPES = {
   LIVESTREAMS: "livestreams",
   RECORDINGS: "recordings",
   SPARKS: "sparks",
   COMPANIES: "companies",
   JOBS: "jobs",
} as const

type IndexType = (typeof RESULT_TYPES)[keyof typeof RESULT_TYPES]

interface ResultsTracker {
   counts: Record<IndexType, number>
   hasResults: Record<IndexType, boolean>
}

type ResultsUpdateCallback = (
   indexType: IndexType,
   count: number,
   hasHits: boolean
) => void

const AllTabContent = () => {
   const isMobile = useIsMobile()
   const { getFilterValues } = useSearchContext()
   const [totalResults, setTotalResults] = React.useState(0)
   const [hasResults, setHasResults] = React.useState(false)

   // Track results from each index
   const resultsTracker = useRef<ResultsTracker>({
      counts: {
         [RESULT_TYPES.LIVESTREAMS]: 0,
         [RESULT_TYPES.RECORDINGS]: 0,
         [RESULT_TYPES.SPARKS]: 0,
         [RESULT_TYPES.COMPANIES]: 0,
         [RESULT_TYPES.JOBS]: 0,
      },
      hasResults: {
         [RESULT_TYPES.LIVESTREAMS]: false,
         [RESULT_TYPES.RECORDINGS]: false,
         [RESULT_TYPES.SPARKS]: false,
         [RESULT_TYPES.COMPANIES]: false,
         [RESULT_TYPES.JOBS]: false,
      },
   })

   const updateResults: ResultsUpdateCallback = useCallback(
      (indexType, count, hasHits) => {
         resultsTracker.current.counts[indexType] = count
         resultsTracker.current.hasResults[indexType] = hasHits

         const total = Object.values(resultsTracker.current.counts).reduce(
            (sum, count) => sum + count,
            0
         )
         const hasAny = Object.values(resultsTracker.current.hasResults).some(
            (hasResult) => hasResult
         )

         setTotalResults(total)
         setHasResults(hasAny)
      },
      []
   )

   // Get filter values for building Algolia filters
   const selectedLanguages = getFilterValues("languages")
   const selectedFieldsOfStudy = getFilterValues("fieldsOfStudy")
   const selectedIndustries = getFilterValues("industries")
   const selectedLocations = getFilterValues("locations")
   const selectedCompanySizes = getFilterValues("companySizes")
   const selectedContentTopics = getFilterValues("contentTopicIds")

   // Convert location IDs to country codes for filtering
   const selectedCountryCodes =
      convertLocationIdsToCountryCodes(selectedLocations)

   // Build all filter strings in a single useMemo for better performance
   const filterStrings = useMemo(() => {
      // Build filter options
      const livestreamsFilterOptions: LivestreamFilterOptions = {
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

      const recordingsFilterOptions: LivestreamFilterOptions = {
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

      const sparksFilterOptions: SparkFilterOptions = {
         arrayFilters: {
            languageTagIds: selectedLanguages,
            contentTopicsTagIds: selectedContentTopics,
            groupCompanySize: selectedCompanySizes,
            groupCompanyIndustriesIdTags: selectedIndustries,
         },
         booleanFilters: {
            published: true,
            groupPublicSparks: true,
         },
      }

      const companiesFilterOptions: CompanyFilterOptions = {
         arrayFilters: {
            companyIndustriesIdTags: selectedIndustries,
            companyCountryId: selectedCountryCodes,
            companySize: selectedCompanySizes,
            contentLanguages: selectedLanguages,
         },
         booleanFilters: {
            publicProfile: true,
            inActive: false,
            test: false,
         },
      }

      const jobsFilterOptions: JobFilterOptions = {
         arrayFilters: {
            locationIdTags: selectedLocations,
            businessFunctionsTagIds: selectedFieldsOfStudy,
         },
         booleanFilters: {
            published: true,
            deleted: false,
            isPermanentlyExpired: false,
         },
      }

      // Build filter strings
      return {
         livestreams: buildLivestreamFilterString(livestreamsFilterOptions),
         recordings: buildLivestreamFilterString(recordingsFilterOptions),
         sparks: buildSparkFilterString(sparksFilterOptions),
         companies: buildAlgoliaFilterString(companiesFilterOptions),
         jobs: buildJobFilterString(jobsFilterOptions),
      }
   }, [
      selectedLanguages,
      selectedFieldsOfStudy,
      selectedIndustries,
      selectedCountryCodes,
      selectedCompanySizes,
      selectedContentTopics,
      selectedLocations,
   ])

   return (
      <Box sx={styles.resultsContainer} id="all-tab">
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

         <SearchBoxConnector />

         {/* Total results count */}
         <Box mb={2}>
            <Typography
               variant={isMobile ? "small" : "brandedBody"}
               color="neutral.700"
            >
               {totalResults} result{totalResults !== 1 ? "s" : ""}
            </Typography>
         </Box>

         {/* Empty state */}
         {!hasResults && <NoResultsFound />}

         {/* Livestreams Index */}
         <Index indexName={getIndexName("livestreams")}>
            <Configure
               filters={filterStrings.livestreams}
               hitsPerPage={6}
               attributesToRetrieve={["*"]}
            />
            <LivestreamsGridHits
               onResultsUpdate={(count, hasHits) =>
                  updateResults(RESULT_TYPES.LIVESTREAMS, count, hasHits)
               }
            />
         </Index>

         {/* Sparks Index */}
         <Index indexName={getIndexName("sparks")}>
            <Configure
               filters={filterStrings.sparks}
               hitsPerPage={6}
               attributesToRetrieve={["*"]}
            />
            <SparksCarouselHits
               onResultsUpdate={(count, hasHits) =>
                  updateResults(RESULT_TYPES.SPARKS, count, hasHits)
               }
            />
         </Index>

         {/* Companies Index */}
         <Index indexName={getIndexName("companies")}>
            <Configure
               filters={filterStrings.companies}
               hitsPerPage={6}
               attributesToRetrieve={["*"]}
            />
            <CompaniesGridHits
               onResultsUpdate={(count, hasHits) =>
                  updateResults(RESULT_TYPES.COMPANIES, count, hasHits)
               }
            />
         </Index>

         {/* Jobs Index */}
         <Index indexName={getIndexName("customJobs")}>
            <Configure
               filters={filterStrings.jobs}
               hitsPerPage={6}
               attributesToRetrieve={["*"]}
            />
            <JobsGridHits
               onResultsUpdate={(count, hasHits) =>
                  updateResults(RESULT_TYPES.JOBS, count, hasHits)
               }
            />
         </Index>

         {/* Recordings Index */}
         <Index indexName={getIndexName("livestreams")}>
            <Configure
               filters={filterStrings.recordings}
               hitsPerPage={6}
               attributesToRetrieve={["*"]}
            />
            <RecordingsGridHits
               onResultsUpdate={(count, hasHits) =>
                  updateResults(RESULT_TYPES.RECORDINGS, count, hasHits)
               }
            />
         </Index>
      </Box>
   )
}

export const AllTab = () => {
   return (
      <InstantSearch
         searchClient={algoliaSearchClient}
         future={{
            preserveSharedStateOnUnmount: true,
         }}
      >
         <AllTabContent />
      </InstantSearch>
   )
}
