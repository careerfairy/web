import React from "react"
import DashboardHead from "../../layouts/GroupDashboardLayout/DashboardHead"
import CompanyPageOverview from "../../components/views/company-page"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo, livestreamRepo } from "../../data/RepositoryInstances"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import GeneralLayout from "../../layouts/GeneralLayout"
import FollowButton from "../../components/views/company-page/Header/FollowButton"
import { mapFromServerSide } from "../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import useTrackPageView from "../../components/custom-hook/useTrackDetailPageView"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"

type TrackProps = {
   id: string
   visitorId: string
}

const CompanyPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
}) => {
   const isMobile = useIsMobile()
   const { trackCompanyPageView } = useFirebaseService()
   const { universityName, id } = serverSideGroup

   const viewRef = useTrackPageView({
      trackDocumentId: id,
      handleTrack: ({ id, visitorId }: TrackProps) =>
         trackCompanyPageView(id, visitorId),
   }) as unknown as React.RefObject<HTMLDivElement>

   return (
      <GeneralLayout
         viewRef={viewRef}
         fullScreen
         headerEndContent={
            <>
               {isMobile ? (
                  <Box px={0.5}>
                     <FollowButton group={serverSideGroup} />
                  </Box>
               ) : null}
            </>
         }
      >
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <Box sx={{ backgroundColor: "white", minHeight: "100vh" }}>
            <CompanyPageOverview
               group={serverSideGroup}
               upcomingLivestreams={mapFromServerSide(
                  serverSideUpcomingLivestreams
               )}
               editMode={false}
            />
         </Box>
      </GeneralLayout>
   )
}

export const getStaticProps: GetStaticProps<{
   serverSideGroup: Group
   serverSideUpcomingLivestreams: any[]
}> = async ({ params }) => {
   const { companyName: companyNameSlug } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup) {
         const presenter = GroupPresenter.createFromDocument(serverSideGroup)

         if (presenter.companyPageIsReady()) {
            const serverSideUpcomingLivestreams =
               await livestreamRepo.getEventsOfGroup(
                  serverSideGroup?.groupId,
                  "upcoming",
                  { limit: 10 }
               )

            return {
               props: {
                  serverSideGroup,
                  serverSideUpcomingLivestreams:
                     serverSideUpcomingLivestreams?.map(
                        LivestreamPresenter.serializeDocument
                     ) || [],
               },
               revalidate: 60,
            }
         }

         throw new Error(
            `Company page ${companyName} for groupId ${serverSideGroup.id} is not ready yet`
         )
      }
   }

   throw new Error(`Company ${companyName} not found`)
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default CompanyPage
