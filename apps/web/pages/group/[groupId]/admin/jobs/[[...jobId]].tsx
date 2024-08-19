import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { GetServerSidePropsContext } from "next"
import { FC } from "react"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"

type Props = {
   groupId: string
   jobId: string
}

const JobsPage: FC<Props> = ({ groupId, jobId }) => {
   return (
      <GroupDashboardLayout
         titleComponent={"Jobs"}
         groupId={groupId as string}
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { groupId, jobId: queryJobId } = context.params
   const jobId = queryJobId?.[0] || ""

   return {
      props: {
         groupId,
         jobId,
      },
   }
}
export default JobsPage
