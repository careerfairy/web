import { FC } from "react"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { Button } from "@mui/material"

type Props = {
   groupId: string
   jobId: string
}

const JobDetails: FC<Props> = ({ groupId, jobId }) => {
   const router = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Jobs"}
         groupId={groupId as string}
         topBarCta={<CreateJobButton />}
      >
         <DashboardHead title="CareerFairy | Jobs" />
         <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
            <>
               <Button onClick={() => router.back()}>Back</Button>
               Job details {jobId} from the Group {groupId}
            </>
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
