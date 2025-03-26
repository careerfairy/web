import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { ListItem, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import JobCard from "components/views/common/jobs/JobCard"
import { DIALOG_JOB_ID_QUERY_PARAM } from "components/views/jobs/components/custom-jobs/CustomJobDialogContext"
import Link from "next/link"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      maxWidth: "calc(100% - 50px)",
   },
   typography: {
      maxWidth: "calc(100% - 50px)",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

type Props = {
   jobs: CustomJob[]
}

const GroupJobsList = ({ jobs: groupCustomJobs }: Props) => {
   const router = useRouter()

   const isMobile = useIsMobile("lg")

   if (!groupCustomJobs?.length) return null

   return (
      <Stack width={"100%"} spacing={2}>
         {groupCustomJobs.map((customJob, idx) => {
            return (
               <Link
                  href={`/company/${router.query.companyName}/jobs?${DIALOG_JOB_ID_QUERY_PARAM}=${customJob.id}`}
                  // Prevents GSSP from running on designated page:https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
                  shallow
                  passHref
                  // Prevents the page from scrolling to the top when the link is clicked
                  scroll={false}
                  legacyBehavior
                  key={idx}
               >
                  <ListItem sx={styles.jobListItemWrapper}>
                     <JobCard
                        job={customJob}
                        previewMode
                        titleSx={isMobile ? null : styles.title}
                        typographySx={isMobile ? null : styles.typography}
                        hideJobUrl
                        smallCard={isMobile}
                     />
                  </ListItem>
               </Link>
            )
         })}
      </Stack>
   )
}

export default GroupJobsList
