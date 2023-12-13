import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/jobPosting/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import { GetServerSidePropsContext } from "next"
import { FC } from "react"

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
         <SuspenseWithBoundary>
            {Boolean(jobId) ? (
               <JobFetchWrapper
                  jobId={jobId}
                  groupId={groupId as string}
                  shouldFetch={Boolean(jobId)}
               >
                  {(job) => <JobAdminDetails job={job} />}
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
