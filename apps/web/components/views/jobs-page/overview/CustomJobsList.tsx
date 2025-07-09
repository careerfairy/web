import { Box, CircularProgress, ListItem } from "@mui/material"

import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import JobCard from "components/views/common/jobs/JobCard"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"

const styles = sxStyles({
   title: {
      maxWidth: "calc(100% - 50px)",
   },
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
   const { isValidating, nextPage, selectedJob, hasMore } =
      useJobsOverviewContext()

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

   return (
      <Fragment>
         {customJobs.map((customJob, idx) => {
            return (
               <Link
                  href={{
                     pathname: router.pathname,
                     query: {
                        ...router.query,
                        jobId: customJob.id,
                     },
                  }}
                  shallow
                  passHref
                  // Prevents the page from scrolling to the top when the link is clicked
                  scroll={false}
                  key={idx}
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
                        titleSx={isMobile ? null : styles.title}
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
