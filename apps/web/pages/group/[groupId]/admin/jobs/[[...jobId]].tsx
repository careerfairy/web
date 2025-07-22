import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { useRouter } from "next/router"
import { ReactElement } from "react"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import { withGroupDashboardLayout } from "../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const JobsPage = () => {
   const {
      query: { jobId: queryJobId },
   } = useRouter()

   const jobId = queryJobId?.[0] || ""

   return (
      <>
         <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
            {jobId ? (
               <JobFetchWrapper jobId={jobId}>
                  {(job: CustomJob) => <JobAdminDetails job={job} />}
               </JobFetchWrapper>
            ) : (
               <JobsContent />
            )}
         </SuspenseWithBoundary>
         <JobDialog />
         <SparkPreviewDialog />
      </>
   )
}

JobsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Jobs",
      dashboardHeadTitle: "CareerFairy | Jobs",
   })(page)
}

export default JobsPage
