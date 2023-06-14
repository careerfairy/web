import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import {
   getServerSideGroup,
   mapFromServerSide,
} from "../../../../../util/serverUtil"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyPageOverview from "../../../../../components/views/company-page"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { livestreamRepo } from "../../../../../data/RepositoryInstances"
import {
   MAX_PAST_STREAMS,
   MAX_UPCOMING_STREAMS,
} from "components/views/company-page/EventSection"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
   getLivestreamDialogData,
} from "components/views/livestream-dialog"

const CompanyPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   livestreamDialogData,
}) => {
   const { groupId, universityName } = serverSideGroup

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <GroupDashboardLayout
            pageDisplayName={"Company Page"}
            groupId={groupId}
         >
            <DashboardHead title={`CareerFairy | ${universityName}`} />
            <CompanyPageOverview
               group={serverSideGroup}
               upcomingLivestreams={mapFromServerSide(
                  serverSideUpcomingLivestreams
               )}
               pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
               editMode={true}
            />
         </GroupDashboardLayout>
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps: GetServerSideProps<{
   serverSideGroup: Group
   serverSideUpcomingLivestreams: any[]
   serverSidePastLivestreams: any[]
   livestreamDialogData: LiveStreamDialogData
}> = async (context) => {
   const { groupId } = context.params

   const serverSideGroup = await getServerSideGroup(groupId as string)

   if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
      return {
         notFound: true,
      }
   }

   const results = await Promise.allSettled([
      livestreamRepo.getEventsOfGroup(
         serverSideGroup?.groupId,
         "upcoming",
         { limit: MAX_UPCOMING_STREAMS + 1 } // fetch 10 + 1 to know if there are more
      ),
      livestreamRepo.getEventsOfGroup(
         serverSideGroup?.groupId,
         "past",
         { limit: MAX_PAST_STREAMS + 1 } // fetch 5 + 1 to know if there are more
      ),
      getLivestreamDialogData(context),
   ])

   const [
      serverSideUpcomingLivestreamsResult,
      serverSidePastLivestreamsResult,
      livestreamDialogDataResult,
   ] = results

   const serverSideUpcomingLivestreams =
      serverSideUpcomingLivestreamsResult.status === "fulfilled"
         ? serverSideUpcomingLivestreamsResult.value
         : []

   const serverSidePastLivestreams =
      serverSidePastLivestreamsResult.status === "fulfilled"
         ? serverSidePastLivestreamsResult.value
         : []

   const livestreamDialogData =
      livestreamDialogDataResult.status === "fulfilled"
         ? livestreamDialogDataResult.value
         : null

   return {
      props: {
         serverSideGroup,
         serverSideUpcomingLivestreams:
            serverSideUpcomingLivestreams?.map(
               LivestreamPresenter.serializeDocument
            ) || [],
         serverSidePastLivestreams:
            serverSidePastLivestreams?.map(
               LivestreamPresenter.serializeDocument
            ) || [],
         livestreamDialogData,
      },
   }
}

export default CompanyPage
