import { ListItem, Stack } from "@mui/material"

import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomInfiniteScroll from "components/views/common/CustomInfiniteScroll"
import JobCard from "components/views/common/jobs/JobCard"
import Link from "next/link"
import { useRouter } from "next/router"
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
   const {
      isValidating,
      nextPage,
      selectedJob,
      hasMore,
      setJobDetailsDialogOpen,
   } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         <CustomInfiniteScroll
            hasMore={hasMore}
            loading={isValidating}
            next={() => Promise.resolve(nextPage())}
            offset={200}
         >
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
                     onClick={() => {
                        if (isMobile) {
                           setJobDetailsDialogOpen(true)
                        }
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
                           selected={
                              selectedJob?.id === customJob.id && !isMobile
                           }
                        />
                     </ListItem>
                  </Link>
               )
            })}
         </CustomInfiniteScroll>
         {/* {Boolean(isValidating) && (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         )} */}
         {/* <Box sx={styles.loader} height={300}> 
            </Box> */}
      </Stack>
   )
}
