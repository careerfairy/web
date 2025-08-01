import {
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid } from "@mui/material"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import { useEffect, useMemo } from "react"
import { useInfiniteHits, useInstantSearch } from "react-instantsearch"
import { CustomJobAlgoliaHit, CustomJobSearchResult } from "types/algolia"
import { sxStyles } from "types/commonTypes"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import JobCard from "../../../common/jobs/JobCard"
import { useSearchContext } from "../../SearchContext"
import { SectionTitle } from "./SectionTitle"
import { ShowMoreButton } from "./ShowMoreButton"

const styles = sxStyles({
   gridSection: {
      mb: 4,
   },
   grid: {
      mt: 0,
   },
   loadMoreButton: {
      mt: 3,
      width: "100%",
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      py: 4,
   },
})

type JobsGridHitsProps = {
   onResultsUpdate: (count: number, hasHits: boolean) => void
}

export const JobsGridHits = ({ onResultsUpdate }: JobsGridHitsProps) => {
   const { selectedJobId, handleCloseJobDialog, handleOpenJobDialog } =
      useSearchContext()
   const { items, results, isLastPage, showMore } =
      useInfiniteHits<CustomJobAlgoliaHit>()
   const { status } = useInstantSearch()

   // Update parent with results count
   useEffect(() => {
      if (results) {
         onResultsUpdate(results.nbHits, items.length > 0)
      }
   }, [results, items.length, onResultsUpdate])

   const deserializedItems = useMemo(() => {
      return items.map((item) =>
         deserializeAlgoliaSearchResponse(item)
      ) as CustomJobSearchResult[]
   }, [items])

   if (deserializedItems.length === 0) return null

   const jobApplicationSource: CustomJobApplicationSource = {
      source: CustomJobApplicationSourceTypes.Portal,
      id: CustomJobApplicationSourceTypes.Portal,
   }

   return (
      <Box sx={styles.gridSection}>
         <SectionTitle title="Jobs" />

         <Grid container spacing={2} sx={styles.grid}>
            {deserializedItems.map((job) => (
               <Grid key={job.id} xs={12} sm={6} lg={4} xl={3} item>
                  <JobCard
                     job={job}
                     previewMode
                     hideJobUrl
                     smallCard
                     showCompanyLogo
                     companyLogoUrl={job.group?.logoUrl}
                     companyName={job.group?.universityName}
                     handleClick={(job, event) => {
                        event?.preventDefault()
                        handleOpenJobDialog(job.id)
                     }}
                  />
               </Grid>
            ))}
         </Grid>

         {!isLastPage && (
            <Box sx={styles.loadMoreButton}>
               <ShowMoreButton
                  onClick={showMore}
                  loading={status === "loading" || status === "stalled"}
               />
            </Box>
         )}

         <CustomJobDetailsDialog
            isOpen={Boolean(selectedJobId)}
            onClose={handleCloseJobDialog}
            customJobId={selectedJobId || ""}
            source={jobApplicationSource}
            suspense={false}
         />
      </Box>
   )
}
