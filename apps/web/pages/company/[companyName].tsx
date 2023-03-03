import React from "react"
import DashboardHead from "../../layouts/GroupDashboardLayout/DashboardHead"
import CompanyPageOverview from "../../components/views/company-page"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo, livestreamRepo } from "../../data/RepositoryInstances"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
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

const CompanyPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serverSideGroup, serverSideUpcomingLivestreams }) => {
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

export const getServerSideProps: GetServerSideProps<
   {
      serverSideGroup: Group
      serverSideUpcomingLivestreams: any[]
   },
   { companyName: string }
> = async ({ params, res }) => {
   // This value is considered fresh for ten seconds (s-maxage=10).
   // If a request is repeated within the next 10 seconds, the previously
   // cached value will still be fresh. If the request is repeated before 59 seconds,
   // the cached value will be stale but still render (stale-while-revalidate=59).
   //
   // In the background, a revalidation request will be made to populate the cache
   // with a fresh value. If you refresh the page, you will see the new value. More info on caching GGSP can be found here: https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#caching-with-server-side-rendering-ssr
   res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
   )

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
            }
         }

         throw new Error(
            `Company page ${companyName} for groupId ${serverSideGroup.id} is not ready yet`
         )
      }
   }

   throw new Error(`Company ${companyName} not found`)
}

export default CompanyPage
