import React from "react"
import GeneralLayout from "layouts/GeneralLayout"
import HighlightsCarousel from "../components/views/portal/HighlightsCarousel"
import Container from "@mui/material/Container"
import RecommendedEvents from "../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper"
import { useAuth } from "../HOCs/AuthProvider"
import { GetServerSideProps } from "next"
import highlightRepo from "../data/firebase/HighlightRepository"
import livestreamRepo from "../data/firebase/LivestreamRepository"
import { mapServerSideStream } from "../util/serverUtil"
import SEO from "../components/util/SEO"
import { useRouter } from "next/router"

const PortalPage = ({ highlights, comingUpNextEvents, showHighlights }) => {
   const { authenticatedUser, userData } = useAuth()
   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )
   const { pathname } = useRouter()
   return (
      <>
         <SEO
            id={"CareerFairy | Portal"}
            description={
               "To find the greatest virtual career events, use the CareerFairy Portal. Through our events, meet potential future colleagues live and land your dream job!"
            }
            title={"CareerFairy | Portal"}
            canonical={`https://careerfairy.com${pathname}`}
         />
         <GeneralLayout backgroundColor={"#FFF"} hideNavOnScroll fullScreen>
            <Container disableGutters>
               <WidgetsWrapper>
                  <HighlightsCarousel
                     showHighlights={showHighlights}
                     serverSideHighlights={highlights}
                  />
                  {hasInterests && (
                     <RecommendedEvents maxLimitIncreaseTimes={5} limit={30} />
                  )}
                  <ComingUpNextEvents
                     serverSideEvents={comingUpNextEvents}
                     limit={20}
                  />
                  <MyNextEvents limit={20} />
               </WidgetsWrapper>
            </Container>
         </GeneralLayout>
      </>
   )
}

export const getServerSideProps: GetServerSideProps = async () => {
   const [showHighlights, highlights, comingUpNextEvents] = await Promise.all([
      highlightRepo.shouldShowHighlightsCarousel(),
      highlightRepo.getHighlights(5),
      livestreamRepo.getUpcomingEvents(20),
   ])
   return {
      props: {
         showHighlights,
         ...(highlights && { highlights }),
         ...(comingUpNextEvents && {
            comingUpNextEvents: comingUpNextEvents.map((event) =>
               mapServerSideStream(event)
            ),
         }),
      },
   }
}

export default PortalPage
