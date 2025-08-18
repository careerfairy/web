import { Box, CircularProgress, ListItem } from "@mui/material"

import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import JobCard from "components/views/common/jobs/JobCard"
import { useAlgoliaEvents } from "hooks/useAlgoliaEvents"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"

const styles = sxStyles({
   typography: {
      maxWidth: "calc(100% - 50px)",
   },
   jobListItemWrapper: { m: 0, p: 0 },
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
   },
})

type Props = {
   customJobs: CustomJob[]
}

export const CustomJobsList = ({ customJobs }: Props) => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const { isValidating, nextPage, selectedJob, hasMore, searchResultsData } =
      useJobsOverviewContext()
   const { trackSearchResultClick } = useAlgoliaEvents()

   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return
      if (!hasMore) return

      if (inView) {
         nextPage()
      }
   }, [inView, nextPage, hasMore])

   const handleJobClick = (customJob: CustomJob, position: number) => {
      // Find which page contains this job to get the correct queryID
      let searchPageData = null
      let absolutePosition = position

      if (searchResultsData) {
         let accumulatedResults = 0
         for (const pageData of searchResultsData) {
            const pageSize = pageData.deserializedHits.length
            if (position < accumulatedResults + pageSize) {
               searchPageData = pageData
               absolutePosition = position + 1 // Algolia positions are 1-indexed
               break
            }
            accumulatedResults += pageSize
         }
      }

      const queryID = searchPageData?.queryID

      if (queryID) {
         trackSearchResultClick({
            index: "walterGoncalves_customJobs",
            queryID,
            objectID: customJob.id,
            position: absolutePosition,
            eventName: "Custom Job Search Result Clicked",
         })
      }
   }

   return (
      <Fragment>
         {customJobs.map((customJob, idx) => {
            return (
               <Link
                  href={{
                     pathname: router.pathname,
                     query: {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ...(({ first: _, ...rest }) => rest)(router.query),
                        currentJobId: customJob.id,
                     },
                  }}
                  shallow
                  passHref
                  // Prevents the page from scrolling to the top when the link is clicked
                  scroll={false}
                  key={idx}
                  onClick={() => handleJobClick(customJob, idx)}
               >
                  <ListItem
                     sx={[
                        styles.jobListItemWrapper,
                        idx === customJobs.length - 1 &&
                           styles.lastJobListItemWrapper,
                     ]}
                  >
                     <JobCard
                        job={customJob}
                        previewMode
                        typographySx={isMobile ? null : styles.typography}
                        hideJobUrl
                        smallCard
                        showCompanyLogo
                        companyLogoUrl={customJob.group?.logoUrl}
                        companyName={customJob.group?.universityName}
                        selected={selectedJob?.id === customJob.id && !isMobile}
                     />
                  </ListItem>
               </Link>
            )
         })}

         {Boolean(isValidating) && (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         )}
         {Boolean(hasMore) && <Box height={100} ref={ref} />}
      </Fragment>
   )
}
