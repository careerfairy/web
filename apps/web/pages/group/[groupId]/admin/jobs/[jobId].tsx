import { FC } from "react"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { GetServerSidePropsContext } from "next"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import JobAdminDetails from "../../../../../components/views/group/admin/jobs/details/jobPosting/JobAdminDetails"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"
import { groupRepo, userRepo } from "../../../../../data/RepositoryInstances"
import { UserData } from "@careerfairy/shared-lib/users"

type Props = {
   groupId: string
   jobId: string
   applicants: UserData[]
}

const JobDetails: FC<Props> = ({ groupId, jobId, applicants }) => {
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
               {(job) => <JobAdminDetails job={job} applicants={applicants} />}
            </JobFetchWrapper>
         </SuspenseWithBoundary>
         <JobDialog />
      </GroupDashboardLayout>
   )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { groupId, jobId } = context.params
   let applicants: UserData[] = []

   const job = await groupRepo.getCustomJobById(
      jobId as string,
      groupId as string
   )

   if (job && job.applicants?.length > 0) {
      applicants = await userRepo.getUsersByEmail(job.applicants, {
         withEmpty: true,
      })
   }

   return {
      props: {
         groupId,
         jobId,
         applicants,
      },
   }
}
export default JobDetails
