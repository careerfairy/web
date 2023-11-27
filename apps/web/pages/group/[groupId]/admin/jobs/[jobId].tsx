import { FC } from "react"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { Button } from "@mui/material"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"

type Props = {
   groupId: string
   jobId: string
}

const JobDetails: FC<Props> = ({ groupId, jobId }) => {
   const { push } = useRouter()

   const handleClickBack = () => {
      void push(`/group/${groupId}/admin/jobs`)
   }

   return (
      <GroupDashboardLayout
         titleComponent={"Jobs"}
         groupId={groupId as string}
         topBarCta={<CreateJobButton />}
      >
         <DashboardHead title="CareerFairy | Jobs" />
         <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
            <JobFetchWrapper
               jobId={jobId}
               groupId={groupId}
               shouldFetch={Boolean(jobId)}
            >
               {(job) => (
                  <>
                     <Button onClick={handleClickBack}>Back</Button>
                     Job details {job.title} from the Group {groupId}
                  </>
               )}
            </JobFetchWrapper>
         </SuspenseWithBoundary>
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
