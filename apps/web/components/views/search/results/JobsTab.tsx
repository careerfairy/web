import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CUSTOM_JOB_REPLICAS } from "@careerfairy/shared-lib/customJobs/search"
import {
   Box,
   CircularProgress,
   ListItem,
   Stack,
   Typography,
} from "@mui/material"
import {
   FilterOptions,
   useCustomJobSearchAlgolia,
} from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import CustomJobDetailsDialog, {
   InlineCustomJobDetailsContent,
} from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import { useSearchContext } from "../SearchContext"
import { NoResultsFound } from "../SearchResults"
import FilterBusinessFunctionTags from "./filter/FilterBusinessFunctionTags"
import FilterJobType from "./filter/FilterJobType"
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
   jobsContainer: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 1,
      height: {
         xs: "100%",
         sm: "100%",
         md: "calc(100dvh - 176px)",
      },
      minHeight: {
         md: "calc(100dvh - 176px)",
      },
      maxHeight: {
         md: "calc(100dvh - 176px)",
      },
      overflow: "hidden",
   },
   jobsList: {
      width: "339px",
      minWidth: {
         xs: "100%",
         md: "339px",
      },
      px: { xs: 0, md: 0.5 },
      pt: { xs: 0, md: 0.5 },
      pb: 0.5,
      overflowY: "auto",
   },
   jobDetails: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: (theme) => theme.brand.white[50],
      borderRadius: "8px 8px 0px 0px",
      borderTop: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderLeft: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderRight: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      overflow: "hidden",
   },
   jobDetailsPlaceholder: {
      flex: 1,
      display: { xs: "none", md: "flex" },
      alignItems: "center",
      justifyContent: "center",
      color: "neutral.600",
   },
   jobListItemWrapper: {
      m: 0,
      p: 0,
      cursor: "pointer",
   },
   lastJobListItemWrapper: {
      mb: {
         xs: "100px",
         sm: "100px",
         md: 0,
      },
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      padding: 4,
   },
   typography: {
      maxWidth: "calc(100% - 50px)",
   },
})

export const JobsTab = () => {
   const isMobile = useIsMobile()
   const {
      getFilterValues,
      selectedJobId,
      handleOpenJobDialog,
      handleCloseJobDialog,
   } = useSearchContext()
   const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false)
   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const selectedLocations = getFilterValues("locations")
   const selectedBusinessFunctionTags = getFilterValues("businessFunctionTags")
   const selectedJobTypes = getFilterValues("jobTypes")
   const searchTerm = getFilterValues("q")[0] || ""

   const filterOptions: FilterOptions = {
      arrayFilters: {
         normalizedLocationIds: selectedLocations,
         businessFunctionsTagIds: selectedBusinessFunctionTags,
         normalizedJobType: selectedJobTypes,
      },
      booleanFilters: {
         deleted: false,
         published: true,
         isPermanentlyExpired: false,
      },
   }

   const { data, setSize, isValidating } = useCustomJobSearchAlgolia(
      searchTerm,
      {
         filterOptions,
         targetReplica: CUSTOM_JOB_REPLICAS.DEADLINE_ASC,
         itemsPerPage: 10,
      }
   )

   const infiniteJobs = useMemo(() => {
      return data?.flatMap((page) => page.deserializedHits) ?? []
   }, [data])

   const numberOfResults = data?.[0]?.nbHits || 0

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView && infiniteJobs.length < numberOfResults) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize, infiniteJobs.length, numberOfResults])

   const hasMore = numberOfResults > infiniteJobs.length

   const selectedJob = useMemo(() => {
      if (!selectedJobId) return undefined
      return infiniteJobs.find((job) => job.id === selectedJobId)
   }, [selectedJobId, infiniteJobs])

   // Handle mobile dialog state based on selected job
   useEffect(() => {
      if (selectedJob && isMobile) {
         setIsJobDetailsDialogOpen(true)
      } else {
         setIsJobDetailsDialogOpen(false)
      }
   }, [selectedJob, isMobile])

   const jobApplicationSource: CustomJobApplicationSource = {
      source: CustomJobApplicationSourceTypes.Portal,
      id: CustomJobApplicationSourceTypes.Portal,
   }

   const handleJobClick = (job: CustomJob) => {
      handleOpenJobDialog(job.id)
   }

   const handleMobileDialogClose = () => {
      setIsJobDetailsDialogOpen(false)
      handleCloseJobDialog()
   }

   return (
      <Box sx={styles.resultsContainer} id="jobs-tab">
         {/* Mobile Dialog */}
         <CustomJobDetailsDialog
            isOpen={Boolean(isJobDetailsDialogOpen && isMobile && selectedJob)}
            onClose={handleMobileDialogClose}
            customJobId={selectedJobId || ""}
            source={jobApplicationSource}
            suspense={false}
         />

         <Box sx={styles.filterContainer}>
            <ChipDropdownProvider>
               <Stack direction="row" spacing={1} sx={styles.searchBy}>
                  <FilterLocation />
                  <FilterBusinessFunctionTags />
                  <FilterJobType />
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

         {infiniteJobs.length > 0 ? (
            <Box sx={{ mt: 2 }}>
               <Box sx={styles.jobsContainer}>
                  {/* Jobs List */}
                  <Stack sx={styles.jobsList} spacing={1}>
                     {infiniteJobs.map((job, idx) => {
                        return (
                           <ListItem
                              key={job.id}
                              sx={[
                                 styles.jobListItemWrapper,
                                 idx === infiniteJobs.length - 1 &&
                                    styles.lastJobListItemWrapper,
                              ]}
                              onClick={() => handleJobClick(job)}
                           >
                              <JobCard
                                 job={job}
                                 previewMode
                                 typographySx={
                                    isMobile ? null : styles.typography
                                 }
                                 hideJobUrl
                                 smallCard
                                 showCompanyLogo
                                 companyLogoUrl={job.group?.logoUrl}
                                 companyName={job.group?.universityName}
                                 selected={
                                    !isMobile &&
                                    (selectedJob?.id
                                       ? job.id === selectedJob.id
                                       : infiniteJobs[0].id === job.id)
                                 }
                              />
                           </ListItem>
                        )
                     })}

                     {Boolean(isValidating) && (
                        <Box sx={styles.loader}>
                           <CircularProgress />
                        </Box>
                     )}
                     {Boolean(hasMore) && <Box height={100} ref={ref} />}
                  </Stack>

                  {/* Job Details Panel (Desktop Only) */}
                  {!isMobile && (
                     <Box sx={styles.jobDetails}>
                        {selectedJob ? (
                           <InlineCustomJobDetailsContent
                              customJob={selectedJob}
                              source={jobApplicationSource}
                              key={selectedJob.id}
                           />
                        ) : (
                           <InlineCustomJobDetailsContent
                              customJob={infiniteJobs[0]}
                              source={jobApplicationSource}
                              key={infiniteJobs[0]?.id}
                           />
                        )}
                     </Box>
                  )}
               </Box>
            </Box>
         ) : !isValidating ? (
            <Box sx={{ mt: 2 }}>
               <NoResultsFound />
            </Box>
         ) : null}
      </Box>
   )
}
