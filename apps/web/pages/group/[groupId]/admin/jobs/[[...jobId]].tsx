import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { useRouter } from "next/router"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"

const JobsPage = () => {
   const {
      query: { jobId: queryJobId },
   } = useRouter()

   const jobId = queryJobId?.[0] || ""

   return (
      <GroupDashboardLayout
         titleComponent={"Jobs"}
         topBarCta={<CreateJobButton />}
      >
         <DashboardHead title="CareerFairy | Jobs" />
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
      </GroupDashboardLayout>
   )
}

export default JobsPage
