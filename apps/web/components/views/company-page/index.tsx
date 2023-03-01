import { Group } from "@careerfairy/shared-lib/groups"
import Header from "./Header"
import {
   createContext,
   forwardRef,
   MutableRefObject,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { Box, Container, Grid, Grow, Stack } from "@mui/material"
import AboutSection from "./AboutSection"
import MediaSection from "./MediaSection"
import TestimonialSection from "./TestimonialSection"
import EventSection from "./EventSection"
import { useFirestoreDocData } from "reactfire"
import { doc } from "firebase/firestore"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useListenToUpcomingStreams from "../../custom-hook/useListenToUpcomingStreams"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { groupRepo } from "../../../data/RepositoryInstances"
import { errorLogAndNotify } from "../../../util/CommonUtil"

type Props = {
   group: Group
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
}

export const TabValue = {
   profile: "profile-section",
   media: "media-section",
   testimonials: "testimonials-section",
   livesStreams: "livesStreams-section",
} as const

export type TabValueType = typeof TabValue[keyof typeof TabValue]

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
   tabValue: TabValueType
   changeTabValue: (tabValues: TabValueType) => void
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
   sectionRefs: SectionRefs
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   groupPresenter: null,
   tabValue: TabValue.profile,
   changeTabValue: () => {},
   editMode: false,
   upcomingLivestreams: [],
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
}: Props) => {
   const [tabValue, setTabValue] = useState(TabValue.profile as TabValueType)

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

   const contextUpcomingLivestream = useListenToUpcomingStreams({
      filterByGroupId: group.groupId,
   })

   const handleChangeTabValue = useCallback((tabValue) => {
      setTabValue(tabValue)
   }, [])

   const presenter = useMemo(
      () => GroupPresenter.createFromDocument(contextGroup),
      [contextGroup]
   )

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

   const aboutSectionRef = useRef<HTMLElement>(null)
   const testimonialSectionRef = useRef<HTMLElement>(null)
   const eventSectionRef = useRef<HTMLElement>(null)
   const mediaSectionRef = useRef<HTMLElement>(null)

   const contextValue = useMemo<ICompanyPageContext>(
      () => ({
         group: contextGroup,
         groupPresenter: presenter,
         tabValue,
         editMode,
         changeTabValue: handleChangeTabValue,
         upcomingLivestreams: contextUpcomingLivestream || upcomingLivestreams,
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
         tabValue,
         editMode,
         handleChangeTabValue,
         contextUpcomingLivestream,
         upcomingLivestreams,
      ]
   )

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box sx={{ backgroundColor: "white", height: "100%" }}>
            <Box mb={{ xs: 4, md: 10 }}>
               <Header />
            </Box>
            <Grow in>
               <Container disableGutters maxWidth="lg">
                  <Grid container spacing={4}>
                     <Grid item xs={12} md={6}>
                        <Stack px={3} spacing={{ xs: 4, md: 8 }}>
                           <AboutSection />
                           <TestimonialSection />
                           <EventSection />
                        </Stack>
                     </Grid>
                     <Grid item xs={12} md={6}>
                        <MediaSection />
                     </Grid>
                  </Grid>
               </Container>
            </Grow>
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
            position={"relative"}
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
