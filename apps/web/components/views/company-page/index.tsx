import { Group } from "@careerfairy/shared-lib/groups"
import Header from "./Header"
import {
   createContext,
   forwardRef,
   MutableRefObject,
   useContext,
   useEffect,
   useMemo,
   useRef,
} from "react"
import { Box, Container, Grid, Stack } from "@mui/material"
import AboutSection from "./AboutSection"
import MediaSection from "./MediaSection"
import TestimonialSection from "./TestimonialSection"
import EventSection from "./EventSection"
import { useFirestoreDocData } from "reactfire"
import { doc } from "firebase/firestore"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useListenToStreams from "../../custom-hook/useListenToStreams"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { groupRepo } from "../../../data/RepositoryInstances"
import {
   errorLogAndNotify,
   shouldEnableSParksB2C,
} from "../../../util/CommonUtil"
import { FollowCompany, SignUp } from "./ctas"
import { useAuth } from "../../../HOCs/AuthProvider"
import NewsletterSection from "./NewsletterSection"
import ProgressBanner from "./ProgressBanner"
import SparksSection from "./SparksSection"

type Props = {
   group: Group
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
   pastLivestreams: LivestreamEvent[]
}

export const TabValue = {
   profile: "profile-section",
   media: "media-section",
   testimonials: "testimonials-section",
   livesStreams: "livesStreams-section",
   banner: "banner-section",
   video: "video-section",
} as const

export type TabValueType = (typeof TabValue)[keyof typeof TabValue]

export const getTabLabel = (tabId: TabValueType) => {
   switch (tabId) {
      case TabValue.profile:
         return "About"
      case TabValue.media:
         return "Media"
      case TabValue.testimonials:
         return "Testimonials"
      case TabValue.livesStreams:
         return "Live Streams"
      default:
         return ""
   }
}

export type SectionRefs = {
   aboutSectionRef: MutableRefObject<HTMLElement>
   testimonialSectionRef: MutableRefObject<HTMLElement>
   eventSectionRef: MutableRefObject<HTMLElement>
   mediaSectionRef: MutableRefObject<HTMLElement>
}

type ICompanyPageContext = {
   group: Group
   groupPresenter: GroupPresenter
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
   pastLivestreams: LivestreamEvent[]
   sectionRefs: SectionRefs
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   groupPresenter: null,
   editMode: false,
   upcomingLivestreams: [],
   pastLivestreams: [],
   sectionRefs: {
      aboutSectionRef: null,
      eventSectionRef: null,
      mediaSectionRef: null,
      testimonialSectionRef: null,
   },
})

const CompanyPageOverview = ({
   group,
   editMode,
   upcomingLivestreams,
   pastLivestreams,
}: Props) => {
   const { isLoggedIn, isLoggedOut } = useAuth()

   const groupRef = useMemo(
      () =>
         doc(FirestoreInstance, "careerCenterData", group.id).withConverter(
            createGenericConverter<Group>()
         ),
      [group.id]
   )

   const { data: contextGroup } = useFirestoreDocData(groupRef, {
      initialData: group,
   })

   const contextUpcomingLivestream = useListenToStreams({
      filterByGroupId: group.groupId,
   })

   const contextPastLivestreams = useListenToStreams({
      filterByGroupId: group.groupId,
      listenToPastEvents: true,
   })

   const aboutSectionRef = useRef<HTMLElement>(null)
   const testimonialSectionRef = useRef<HTMLElement>(null)
   const eventSectionRef = useRef<HTMLElement>(null)
   const mediaSectionRef = useRef<HTMLElement>(null)

   const presenter = useMemo(() => {
      const presenter = GroupPresenter.createFromDocument(contextGroup)
      presenter.setHasLivestream(
         Boolean((contextUpcomingLivestream || upcomingLivestreams)?.length > 0)
      )
      return presenter
   }, [contextGroup, contextUpcomingLivestream, upcomingLivestreams])

   useEffect(() => {
      const isPublicProfile = presenter.companyPageIsReady()

      if (
         editMode &&
         contextGroup &&
         isPublicProfile !== contextGroup.publicProfile
      ) {
         groupRepo
            .updateGroupPublicProfileFlag(contextGroup.id, isPublicProfile)
            .catch((e) => {
               errorLogAndNotify(e, {
                  message: "Failed to update public profile flag",
                  description: e.message,
                  contextGroup,
               })
            })
      }
   }, [contextGroup, editMode, presenter])

   const contextValue = useMemo<ICompanyPageContext>(
      () => ({
         group: contextGroup,
         groupPresenter: presenter,
         editMode,
         upcomingLivestreams: contextUpcomingLivestream || upcomingLivestreams,
         pastLivestreams: contextPastLivestreams || pastLivestreams,
         sectionRefs: {
            aboutSectionRef,
            testimonialSectionRef,
            eventSectionRef,
            mediaSectionRef,
         },
      }),
      [
         contextGroup,
         presenter,
         editMode,
         contextUpcomingLivestream,
         upcomingLivestreams,
         contextPastLivestreams,
         pastLivestreams,
      ]
   )

   const showFollowCompanyCta = isLoggedIn && !editMode
   const showSignUpCta = isLoggedOut && !editMode

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box height={"100%"} pb={5}>
            {editMode ? <ProgressBanner /> : null}
            <Box mb={{ xs: 4, md: 10 }}>
               <Header />
            </Box>
            <Container disableGutters maxWidth="lg">
               <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                     <Stack px={3} spacing={{ xs: 4, md: 8 }}>
                        <AboutSection />
                        {group.publicSparks && shouldEnableSParksB2C() ? (
                           <SparksSection key={group.id} groupId={group.id} />
                        ) : null}
                        {showFollowCompanyCta ? <FollowCompany /> : null}
                        {showSignUpCta ? <SignUp /> : null}
                        <TestimonialSection />
                        <EventSection />
                     </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <MediaSection />
                  </Grid>
               </Grid>
            </Container>
            <NewsletterSection />
         </Box>
      </CompanyPageContext.Provider>
   )
}

type SectionAnchorProps = {
   tabValue: TabValueType
}
/*
 * Handles the anchor for each section with an offset to account for the header
 * */
export const SectionAnchor = forwardRef<HTMLElement, SectionAnchorProps>(
   ({ tabValue }, ref) => {
      return (
         <Box
            id={tabValue}
            ref={ref}
            display={"block"}
            position={"absolute"}
            bgcolor={"red"}
            zIndex={10}
            bottom={0}
            left={0}
            right={0}
            top={"-130px"}
            visibility={"hidden"}
            component={"span"}
         />
      )
   }
)

SectionAnchor.displayName = "SectionAnchor"

export const useCompanyPage = () =>
   useContext<ICompanyPageContext>(CompanyPageContext)

export default CompanyPageOverview
