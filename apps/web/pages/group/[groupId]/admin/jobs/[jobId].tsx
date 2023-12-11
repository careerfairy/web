import { FC } from "react"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { GetServerSidePropsContext } from "next"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"

type Props = {
   groupId: string
   jobId: string
}

const JobDetails: FC<Props> = ({ groupId, jobId }) => {
   return (
      <GroupDashboardLayout
         titleComponent={"Jobs"}
         groupId={groupId as string}
         topBarCta={<CreateJobButton />}
      >
         <DashboardHead title="CareerFairy | Jobs" />
         <SuspenseWithBoundary>
            <JobFetchWrapper
               jobId={jobId}
               groupId={groupId}
               shouldFetch={Boolean(jobId)}
            >
               {(job) => <JobAdminDetails job={job} />}
            </JobFetchWrapper>
         </SuspenseWithBoundary>
         <JobDialog />
      </GroupDashboardLayout>
   )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { groupId, jobId } = context.params
   return {
      props: {
         groupId,
         jobId,
      },
   }
}
export default JobDetails
