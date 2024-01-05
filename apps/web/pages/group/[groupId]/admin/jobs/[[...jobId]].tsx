import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import { GetServerSidePropsContext } from "next"
import { FC } from "react"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

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
            {Boolean(jobId) ? (
               <JobFetchWrapper jobId={jobId} shouldFetch={Boolean(jobId)}>
                  {(job: CustomJob) => <JobAdminDetails job={job} />}
               </JobFetchWrapper>
            ) : (
               <JobsContent />
            )}
         </SuspenseWithBoundary>
         <JobDialog />
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
