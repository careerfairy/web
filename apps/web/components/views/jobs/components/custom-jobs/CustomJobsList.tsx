import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ListItem, Stack, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import JobCard from "components/views/common/jobs/JobCard"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import Link from "next/link"
import { useRouter } from "next/router"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

type Props = {
   customJobs: CustomJob[]
   hrefLink: string // example: /portal/jobs
   jobsGroupNamesMap: Record<string, string> // {"id_of_job1": "name_of_group", ... }
   jobWrapperSx?: SxProps<DefaultTheme>
   applied?: boolean
}
const CustomJobsList = ({
   customJobs,
   hrefLink,
   jobWrapperSx,
   jobsGroupNamesMap,
   applied,
}: Props) => {
   const isMobile = useIsMobile()
   const router = useRouter()

   return (
      <Stack
         sx={combineStyles(styles.jobListWrapper, jobWrapperSx)}
         spacing={1}
      >
         {customJobs.map((customJob, idx) => {
            return (
               <Link
                  href={{
                     pathname: `${hrefLink}/${customJob.id}`,
                     query: router.query,
                  }}
                  // Prevents GSSP from running on designated page:https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
                  shallow
                  passHref
                  // Prevents the page from scrolling to the top when the link is clicked
                  scroll={false}
                  legacyBehavior
                  key={idx}
               >
                  <ListItem sx={styles.jobListItemWrapper}>
                     <SuspenseWithBoundary
                        fallback={
                           <Box width="100%">
                              <JobCardSkeleton />
                           </Box>
                        }
                     >
                        <JobCard
                           job={customJob}
                           previewMode
                           hideJobUrl
                           smallCard={isMobile}
                           companyName={jobsGroupNamesMap[customJob.id]}
                           applied={applied}
                        />
                     </SuspenseWithBoundary>
                  </ListItem>
               </Link>
            )
         })}
      </Stack>
   )
}

export default CustomJobsList
