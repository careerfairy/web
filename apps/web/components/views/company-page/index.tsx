import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Container,
   Stack,
   Tab,
   TabScrollButton,
   Tabs,
} from "@mui/material"
import useGroupAvailableCustomJobs from "components/custom-hook/custom-job/useGroupAvailableCustomJobs"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { doc } from "firebase/firestore"
import { useRouter } from "next/router"
import {
   MutableRefObject,
   createContext,
   forwardRef,
   useContext,
   useEffect,
   useMemo,
   useRef,
} from "react"
import { useFirestoreDocData } from "reactfire"
import { sxStyles } from "types/commonTypes"
import { groupRepo } from "../../../data/RepositoryInstances"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import useListenToStreams from "../../custom-hook/useListenToStreams"
import EventSection from "./EventSection"
import Header from "./Header"
import JobsSection from "./JobsSection"
import MediaSection from "./MediaSection"
import NewsletterSection from "./NewsletterSection"
import { Overview } from "./Overview"
import ProgressBanner from "./ProgressBanner"
import SparksSection from "./SparksSection"

const styles = sxStyles({
   tabs: {
      borderRadius: "12px 12px 0 0",
      backgroundColor: "#FEFEFE",
      position: "relative",
      borderBottom: "1px solid",
      borderColor: "divider",
      "& .MuiTab-root": {
         textTransform: "none",
         fontFamily: "Poppins",
         fontSize: "16px",
         color: (theme) => theme.palette.neutral[500],
         fontWeight: 400,
         minWidth: "auto",
         px: 2,
      },
      "& .Mui-selected": {
         color: (theme) => theme.brand.tq[600],
         fontWeight: 600,
      },
      "& .MuiTabs-indicator": {
         height: "1px",
      },
      "& .MuiTabs-scroller": {
         zIndex: 0,
      },
   },
})

type Props = {
   group: Group
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
   pastLivestreams: LivestreamEvent[]
   groupCreators: PublicCreator[]
   customJobs: CustomJob[]
   tab?: TabValueType
}

export const TabValue = {
   overview: "overview-section",
   jobs: "jobs-section",
   sparks: "sparks-section",
   livesStreams: "livesStreams-section",
   recordings: "recordings-section",

   profile: "profile-section",
   media: "media-section",
   testimonialsOrMentors: "testimonials-or-mentors-section",

   banner: "banner-section",
   video: "video-section",
} as const

export type TabValueType = (typeof TabValue)[keyof typeof TabValue]

export const getTabLabel = (tabId: TabValueType) => {
   switch (tabId) {
      case TabValue.overview:
         return "Overview"
      case TabValue.jobs:
         return "Jobs"
      case TabValue.sparks:
         return "Sparks"
      case TabValue.livesStreams:
         return "Live streams"
      case TabValue.recordings:
         return "Recordings"
      // case TabValue.media:
      //    return "Media"
      // case TabValue.testimonialsOrMentors:
      //    return featureFlags.mentorsV1 ? "Mentors" : "Testimonials"
      // case TabValue.livesStreams:
      //    return "Live Streams"
      default:
         return ""
   }
}

export type SectionRefs = {
   aboutSectionRef: MutableRefObject<HTMLElement>
   jobsSectionRef: MutableRefObject<HTMLElement>
   testimonialOrMentorsSectionRef: MutableRefObject<HTMLElement>
   eventSectionRef: MutableRefObject<HTMLElement>
   mediaSectionRef: MutableRefObject<HTMLElement>
}

type ICompanyPageContext = {
   group: Group
   groupPresenter: GroupPresenter
   groupCreators: PublicCreator[]
   editMode: boolean
   upcomingLivestreams: LivestreamEvent[]
   pastLivestreams: LivestreamEvent[]
   customJobs: CustomJob[]
   sectionRefs: SectionRefs
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   groupPresenter: null,
   groupCreators: [],
   editMode: false,
   upcomingLivestreams: [],
   pastLivestreams: [],
   customJobs: [],
   sectionRefs: {
      aboutSectionRef: null,
      jobsSectionRef: null,
      eventSectionRef: null,
      mediaSectionRef: null,
      testimonialOrMentorsSectionRef: null,
   },
})

const CompanyPageOverview = ({
   group,
   editMode,
   upcomingLivestreams,
   pastLivestreams,
   customJobs,
   groupCreators,
   tab,
}: Props) => {
   const featureFlags = useFeatureFlags()
   const isMobile = useIsMobile()
   const groupRef = useMemo(
      () =>
         doc(FirestoreInstance, "careerCenterData", group.id).withConverter(
            createGenericConverter<Group>()
         ),
      [group.id]
   )

   const router = useRouter()
   // const [tabValue, setTabValue] = useState<TabValueType>(
   //    (router.query.tab as TabValueType) ?? tab ?? TabValue.overview
   // )

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

   const contextGroupAvailableJobs = useGroupAvailableCustomJobs(group.groupId)

   const aboutSectionRef = useRef<HTMLElement>(null)
   const testimonialOrMentorsSectionRef = useRef<HTMLElement>(null)
   const eventSectionRef = useRef<HTMLElement>(null)
   const mediaSectionRef = useRef<HTMLElement>(null)
   const jobsSectionRef = useRef<HTMLElement>(null)

   const presenter = useMemo(() => {
      const presenter = GroupPresenter.createFromDocument(contextGroup)
      presenter.setHasLivestream(
         Boolean((contextUpcomingLivestream || upcomingLivestreams)?.length > 0)
      )
      presenter.setHasMentor(Boolean(groupCreators?.length > 0))
      presenter.setFeatureFlags(featureFlags)
      return presenter
   }, [
      contextGroup,
      contextUpcomingLivestream,
      featureFlags,
      groupCreators?.length,
      upcomingLivestreams,
   ])

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
         groupCreators: groupCreators,
         editMode,
         upcomingLivestreams: contextUpcomingLivestream || upcomingLivestreams,
         pastLivestreams: contextPastLivestreams || pastLivestreams,
         customJobs: contextGroupAvailableJobs || customJobs,
         sectionRefs: {
            aboutSectionRef,
            jobsSectionRef,
            testimonialOrMentorsSectionRef,
            eventSectionRef,
            mediaSectionRef,
         },
      }),
      [
         contextGroup,
         presenter,
         groupCreators,
         editMode,
         contextUpcomingLivestream,
         upcomingLivestreams,
         contextPastLivestreams,
         pastLivestreams,
         contextGroupAvailableJobs,
         customJobs,
      ]
   )

   const showJobs = Boolean(featureFlags.jobHubV1 && customJobs?.length)

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box
            height={"100%"}
            pb={5}
            px={isMobile ? 0 : 4}
            bgcolor={isMobile ? "white" : "transparent"}
         >
            {editMode ? <ProgressBanner /> : null}
            <Box
               mb={{ xs: 1, md: 2 }}
               sx={{ borderRadius: isMobile ? "12px 12px 0 0" : "12px" }}
            >
               <Header />
            </Box>
            <Container disableGutters sx={{ maxWidth: "100% !important" }}>
               <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  justifyItems={"space-between"}
                  width={"100%"}
                  bgcolor={isMobile ? "#F5F5F5" : "transparent"}
               >
                  <Box maxWidth={isMobile ? "100%" : "50%"}>
                     <Box sx={{ position: "relative" }}>
                        <Tabs
                           variant="scrollable"
                           scrollButtons
                           allowScrollButtonsMobile
                           value={tab}
                           onChange={(_, newValue) => {
                              router.push({
                                 pathname: router.pathname,
                                 query: { ...router.query, tab: newValue },
                              })
                           }}
                           ScrollButtonComponent={CustomScrollButton}
                           sx={styles.tabs}
                        >
                           <Tab
                              label={getTabLabel(TabValue.overview)}
                              value={TabValue.overview}
                           />
                           {showJobs ? (
                              <Tab
                                 label={getTabLabel(TabValue.jobs)}
                                 value={TabValue.jobs}
                              />
                           ) : null}
                           {group.publicProfile ? (
                              <Tab
                                 label={getTabLabel(TabValue.sparks)}
                                 value={TabValue.sparks}
                              />
                           ) : null}
                           <Tab
                              label={getTabLabel(TabValue.livesStreams)}
                              value={TabValue.livesStreams}
                           />
                           <Tab
                              label={getTabLabel(TabValue.recordings)}
                              value={TabValue.recordings}
                           />
                        </Tabs>
                        <Box
                           sx={{
                              backgroundColor: "#FEFEFE",
                              borderRadius: isMobile
                                 ? "0 0 8px 8px"
                                 : "0 0 12px 12px",
                           }}
                           pt={"20px"}
                           pb="24px"
                           px={2}
                        >
                           {tab === TabValue.overview && (
                              <Overview
                                 showJobs={showJobs}
                                 editMode={editMode}
                              />
                           )}
                           {tab === TabValue.jobs && <JobsSection />}
                           {tab === TabValue.sparks && (
                              <SparksSection
                                 key={group.id}
                                 groupId={group.id}
                              />
                           )}
                           {tab === TabValue.livesStreams && <EventSection />}
                           {/* {value === TabValue.recordings && <RecordingsSection />} */}
                        </Box>
                     </Box>
                  </Box>
                  <Box mt={0}>
                     <MediaSection />
                  </Box>
               </Stack>
            </Container>
            <NewsletterSection />
         </Box>
      </CompanyPageContext.Provider>
   )
}

const CustomScrollButton = ({
   direction,
   onClick,
   disabled,
}: {
   direction: "left" | "right"
   onClick: () => void
   disabled: boolean
}) => {
   return (
      <Box
         sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [direction]: 0,
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(to ${
               direction === "left" ? "right" : "left"
            }, #FEFEFE 30%, rgba(254, 254, 254, 0.8) 75%, rgba(254, 254, 254, 0.4) 85%, transparent)`,
            opacity: disabled ? 0 : 1,
            transition: "opacity 0.2s ease",
            zIndex: 1,
            pointerEvents: disabled ? "none" : "auto",
         }}
      >
         <TabScrollButton
            direction={direction}
            orientation="horizontal"
            onClick={onClick}
            disabled={disabled}
            sx={{
               px: 1,
               justifyContent: direction === "left" ? "flex-start" : "flex-end",
               width: "70px",
            }}
         />
      </Box>
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
